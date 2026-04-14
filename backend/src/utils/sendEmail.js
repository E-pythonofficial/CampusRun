import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your gmail
      pass: process.env.EMAIL_PASS, // Your Gmail App Password (16 digits)
    },
  });

  const mailOptions = {
    from: '"CampusRun" <noreply@campusrun.com>',
    to: options.email,
    subject: options.subject,
    text: options.message, // Plain text fallback
    html: options.html,    // This allows the clickable button
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent to:", options.email);
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    throw error; // Throw so the controller knows it failed
  }
};