import { prisma }               from "../../db/prisma.db.js";
import { generateAccessToken }  from "../../config/accessToken.config.js";
import { generateRefreshToken } from "../../config/refreshToken.config.js";
import { hashPassword }         from "../../config/bcrypt.config.js";
import { sendOTPEmail }         from "../../notification/email.notification.js";
import { generateOTP, generateOTPExpiry } from "../../services/otp.services.js";

export const userRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.validatedData;

    // ✅ check duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = await hashPassword(password);
    const otp            = generateOTP();
    const otpExpiry      = generateOTPExpiry();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash:    hashedPassword,
        verificationOtp: otp,
        otpExpiry,
        isVerified:      false,
      },
    });

    await sendOTPEmail(email, name, otp);

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure:   false,
      sameSite: "strict",
      maxAge:   15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure:   false,
      sameSite: "strict",
      maxAge:   1000 * 60 * 60 * 24 * 7,
    });

    return res.status(201).json({
      success: true,
      message: "User registered. Please check your email for the OTP.",
      data: {
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        level:     user.level,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};