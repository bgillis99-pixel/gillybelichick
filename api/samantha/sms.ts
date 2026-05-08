import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';

export const config = {
  maxDuration: 30,
};

// One file, two roles to keep us under Vercel's 12-function Hobby cap:
//
//  1. Outbound (existing): POST JSON {action:'send_sms', params:{to, body}} →
//     returns sms:/Google Voice deep links so Bryan can tap-send from his phone.
//  2. Inbound (new): Twilio webhook posts form-urlencoded {From, Body, ...} to
//     /api/samantha/sms-inbound (rewritten to /api/samantha/sms). We detect the
//     Twilio header, verify HMAC, and reply with TwiML.

const ANTHROPIC_KEY_NAMES = [
  'ANTHROPIC_API_KEY',
  'CLAUDE_API_KEY',
  'SAMANTHA_API_KEY',
  'SAMANTHA',
  'CLAUDE',
  'ANTHROPIC_KEY',
];

function getAnthropicKey(): string | undefined {
  for (const n of ANTHROPIC_KEY_NAMES) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

const SMS_SYSTEM_PROMPT = `You are Samantha Gillis replying to Bryan over SMS. He's driving. Constraints:
- Keep replies short. Aim for under 160 chars when possible.
- One thought per text. No bullet lists, no tables, no emoji.
- Don't claim to do things you can't (no Google Voice/Messages SMS, no web browsing, no CRM).
- If Bryan asks for calendar, retests, or chalkboard, give him the answer in plain text. If you can't run a tool from SMS, say "open the app" instead of bluffing.
- Sign off naturally. Don't say "as an AI" or "I'll do that and..."`;

function verifyTwilioSignature(
  signature: string | undefined,
  url: string,
  params: Record<string, string>,
  authToken: string,
): boolean {
  if (!signature || !authToken) return false;
  const sortedKeys = Object.keys(params).sort();
  const data = url + sortedKeys.map((k) => k + params[k]).join('');
  const expected = crypto.createHmac('sha1', authToken).update(data).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function twiml(reply: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(reply)}</Message></Response>`;
}

function getRawBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof req.body === 'string') return resolve(req.body);
    if (Buffer.isBuffer(req.body)) return resolve(req.body.toString('utf8'));
    if (req.body && typeof req.body === 'object') {
      const parts = Object.entries(req.body).map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      );
      return resolve(parts.join('&'));
    }
    let data = '';
    req.on('data', (chunk: Buffer) => (data += chunk.toString('utf8')));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function parseFormUrlEncoded(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of body.split('&')) {
    if (!pair) continue;
    const [k, v = ''] = pair.split('=');
    out[decodeURIComponent(k.replace(/\+/g, ' '))] = decodeURIComponent(v.replace(/\+/g, ' '));
  }
  return out;
}

async function handleTwilioInbound(req: any, res: any) {
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');

  const rawBody = await getRawBody(req);
  const params = parseFormUrlEncoded(rawBody);
  const from = params.From || '';
  const body = (params.Body || '').trim();

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (authToken && process.env.TWILIO_SKIP_SIG_VERIFY !== '1') {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = `${proto}://${host}${req.url}`;
    const signature = req.headers['x-twilio-signature'] as string | undefined;
    if (!verifyTwilioSignature(signature, url, params, authToken)) {
      return res.status(403).send(twiml('Unauthorized.'));
    }
  }

  const ownerPhone = (process.env.SAMANTHA_OWNER_PHONE || '').trim();
  if (!ownerPhone || from !== ownerPhone) {
    return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response/>');
  }

  if (!body) {
    return res.status(200).send(twiml("Sent an empty text -- did you mean something?"));
  }

  const anthropicKey = getAnthropicKey();
  if (!anthropicKey) {
    return res.status(200).send(twiml("My brain isn't connected. Open the app: bryanoneillgillis.com/api/samantha/status"));
  }

  try {
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: SMS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: body }],
    });

    let text = '';
    for (const block of response.content) {
      if (block.type === 'text') text += block.text;
    }
    text = text.trim() || "Got it. Open the app for the full answer.";
    if (text.length > 1500) text = text.slice(0, 1497) + '...';

    return res.status(200).send(twiml(text));
  } catch (err: any) {
    console.error('sms inbound error:', err);
    return res.status(200).send(twiml("Hit an error reaching my brain. Try again in a sec."));
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Twilio inbound webhook detection: their POSTs include this header.
  // Body is form-urlencoded, not JSON, so the JSON destructure below would
  // throw -- handle Twilio first.
  if (req.headers['x-twilio-signature']) {
    return handleTwilioInbound(req, res);
  }

  try {
    const { action, params } = req.body || {};

    if (action === 'send_sms') {
      const { to, body } = params;

      if (!to || !body) {
        return res.status(400).json({ error: 'Both "to" and "body" are required' });
      }

      const cleanNumber = to.replace(/[^\d+]/g, '');
      const smsLink = `sms:${cleanNumber}?body=${encodeURIComponent(body)}`;
      const googleVoiceLink = `https://voice.google.com/u/0/messages?phoneNumber=${encodeURIComponent(cleanNumber)}`;

      return res.status(200).json({
        status: 'ready',
        to: cleanNumber,
        body,
        smsLink,
        googleVoiceLink,
        message: `Message ready for ${cleanNumber}. Tap to send via your messaging app.`,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('SMS API error:', error);
    return res.status(500).json({ error: 'SMS error', details: error.message });
  }
}
