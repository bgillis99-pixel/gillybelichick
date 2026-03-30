export const config = {
  maxDuration: 15,
};

// Google Messages approach: generates deep links that open the user's
// default messaging app (Google Messages, iMessage, etc.) with the
// message pre-filled. No third-party SMS service needed.
//
// For automated sending without user tap, Google Business Messages API
// can be configured with a verified agent (free for business use).

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (action === 'send_sms') {
      const { to, body } = params;

      if (!to || !body) {
        return res.status(400).json({ error: 'Both "to" and "body" are required' });
      }

      // Clean up the phone number
      const cleanNumber = to.replace(/[^\d+]/g, '');

      // Generate the SMS deep link -- works on Android (Google Messages)
      // and iOS (iMessage) without any API keys or services
      const smsLink = `sms:${cleanNumber}?body=${encodeURIComponent(body)}`;

      // Also generate a Google Voice link if the user has Google Voice
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
