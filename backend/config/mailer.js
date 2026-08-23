const nodemailer = require('nodemailer');

const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
const port = parseInt(process.env.SMTP_PORT || '465', 10);
const secure = process.env.SMTP_SECURE === 'true' || port === 465;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }
  return transporter;
}

async function verifyEmailConnection() {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log(`[Email Config] SMTP connection verified successfully (${host}:${port})`);
    return { success: true };
  } catch (error) {
    console.error(`[Email Config] SMTP connection verification failed:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getTransporter,
  verifyEmailConnection,
};
