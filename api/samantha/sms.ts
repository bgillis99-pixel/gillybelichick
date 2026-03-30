export const config = {
  maxDuration: 15,
};

// Uses Google Voice via Gmail's SMS gateway or Twilio as fallback
// Google Voice SMS can be sent via email: number@txt.voice.google.com
// For proper SMS, Twilio is recommended

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (action === 'send_sms') {
      const { to, body } = params;

      // Try Twilio first if configured
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
      const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

      if (twilioSid && twilioAuth && twilioFrom) {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const twilioRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: to,
            From: twilioFrom,
            Body: body,
          }),
        });

        if (twilioRes.ok) {
          const data = await twilioRes.json();
          return res.status(200).json({
            status: 'sent',
            to,
            body,
            sid: data.sid,
            message: `SMS sent to ${to}`,
          });
        }
      }

      // Fallback: create a Gmail draft that sends SMS via carrier gateway
      // This is a best-effort approach for Google Voice users
      // The user can also just be shown the message to copy-paste
      return res.status(200).json({
        status: 'drafted',
        to,
        body,
        message: `SMS drafted for ${to}. Open your messaging app to send, or set up Twilio for auto-send.`,
        smsLink: `sms:${to}?body=${encodeURIComponent(body)}`,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('SMS API error:', error);
    return res.status(500).json({ error: 'SMS error', details: error.message });
  }
}
