import nodemailer from 'nodemailer';

export async function handler(event) {
  try {
    const { to, subject, body } = JSON.parse(event.body);

    // Set up transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: process.env.SENDEREMAIL,
        pass: process.env.SENDERPASSWORD,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: body,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
