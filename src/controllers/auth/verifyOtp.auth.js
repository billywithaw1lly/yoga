import { prisma } from "../../db/prisma.db.js";

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified." });
    }

    // Check OTP match
    if (user.verificationOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Mark verified and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified:      true,
        verificationOtp: null,
        otpExpiry:       null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};