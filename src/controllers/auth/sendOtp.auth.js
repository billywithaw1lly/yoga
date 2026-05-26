import { prisma }       from "../../db/prisma.db.js";
import { sendOTPEmail } from "../../notification/email.notification.js";
import { generateOTP, generateOTPExpiry } from "../../services/otp.services.js";

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified." });
    }

    const otp       = generateOTP();
    const otpExpiry = generateOTPExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data:  { verificationOtp: otp, otpExpiry },
    });

    await sendOTPEmail(email, user.name, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};