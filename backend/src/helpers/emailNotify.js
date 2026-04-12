// ProHP Forum — Email Notification Helper
// Anchor: E3592DC3
const https = require('https');
const SENDGRID_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = 'prohormonepro@gmail.com';
const FROM_NAME = 'ProHP Forum';

function sendNotificationEmail(toEmail, subject, textBody) {
  if (!SENDGRID_KEY || !toEmail) return;
  const data = JSON.stringify({
    personalizations: [{ to: [{ email: toEmail }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: subject,
    content: [{ type: 'text/plain', value: textBody }]
  });
  const req = https.request({
    hostname: 'api.sendgrid.net',
    path: '/v3/mail/send',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + SENDGRID_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    if (res.statusCode >= 400) console.error('[EMAIL] SendGrid error:', res.statusCode);
  });
  req.on('error', (e) => console.error('[EMAIL] Send failed:', e.message));
  req.write(data);
  req.end();
}

module.exports = { sendNotificationEmail };