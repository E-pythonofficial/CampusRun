const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // The 16-digit App Password
  },
});

// This line is a lifesaver for debugging:
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Mailer Config Error:", error);
  } else {
    console.log("✅ Mailer is ready to send emails");
  }
});

module.exports = transporter;