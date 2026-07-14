const nodemailer = require('nodemailer');

async function sendAlertEmail(toEmail, subject, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
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
