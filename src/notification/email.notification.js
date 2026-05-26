import nodemailer from "nodemailer"
import {configDotenv} from "dotenv"

configDotenv()

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendOTPEmail = async (to, name, otp) => {
  await transporter.sendMail({
    from:    `"Yoga App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email 🧘</h2>
        <p>Hi <b>${name}</b>, use the OTP below to verify your account.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                    background: #F3F4F6; padding: 20px; text-align: center;
                    border-radius: 8px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6B7280;">This code expires in <b>10 minutes</b>.</p>
        <p style="color: #6B7280;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};