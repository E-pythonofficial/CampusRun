export const sendEmail = async (options) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'CampusRun', email: 'campusrunner1@gmail.com' },
        to: [{ email: options.to || options.email }],
        subject: options.subject,
        htmlContent: options.html || `<p>${options.message}</p>`,
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Email send failed');
    
    console.log("✅ Email sent to:", options.to || options.email);
  } catch (error) {
    console.error("❌ Brevo Error:", error.message);
    throw error;
  }
};