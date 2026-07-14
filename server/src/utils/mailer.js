const isProduction = process.env.NODE_ENV === 'production';

async function sendAlertEmail(toEmail, subject, message) {
  if (isProduction) {
    // Resend (HTTP API) — works on Render since SMTP ports are blocked
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: 'Smart Mini-Ledger <onboarding@resend.dev>',
        to: toEmail,
        subject,
        html: `<pre>${message}</pre>`,
      });
    } catch (err) {
      console.error('Failed to send alert email (Resend):', err.message);
    }
  } else {
    // Nodemailer (SMTP) — works fine for local development
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      family: 4,
    });
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject,
        text: message,
      });
    } catch (err) {
      console.error('Failed to send alert email (Nodemailer):', err.message);
    }
  }
}

module.exports = { sendAlertEmail };