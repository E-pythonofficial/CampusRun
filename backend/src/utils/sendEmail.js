export const sendEmail = async ({ to, email, subject, html, message }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is missing");
    }

    const recipient = to || email;

    if (!recipient) {
      throw new Error("Recipient email is missing");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "CampusRun",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: recipient,
          },
        ],
        subject,
        htmlContent: html || `<p>${message || ""}</p>`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API response:", data);

      throw new Error(
        data.message || `Brevo request failed with status ${response.status}`
      );
    }

    console.log("✅ Brevo email sent:", data.messageId);
    console.log("📧 Recipient:", recipient);

    return data;
  } catch (error) {
    console.error("❌ Email service error:", error.message);
    throw error;
  }
};