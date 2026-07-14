const nodemailer = require('nodemailer');

async function sendAlertEmail(toEmail, subject, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },

    // Force IPv4 to avoid ENETUNREACH on hosts without IPv6 outbound support (e.g. Render free tier)
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4,
  });

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject,
    text: message,
  });
}

module.exports = {
  sendAlertEmail,
};
