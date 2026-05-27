import { prisma } from "../../db/prisma.db.js";
import crypto from "crypto";

export const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Validate OTP and Expiry
        if (!user || user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        if (new Date() > user.resetOtpExpiry) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        // Generate a secure, random reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        
        // Give them 15 minutes to complete the password reset
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); 

        // Update DB: Save the token, and clear out the old OTP so it can't be reused
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
                resetOtp: null,
                resetOtpExpiry: null
            }
        });

        // Set the token in an HTTP-only cookie
        return res
            .status(200)
            .cookie("resetToken", resetToken, {
                httpOnly: true,       // Prevents JavaScript from reading the cookie (XSS protection)
                secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
                sameSite: "strict",   // CSRF protection
                maxAge: 15 * 60 * 1000 // 15 minutes
            })
            .json({
                success: true,
                message: "OTP verified. You can now reset your password."
            });

    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};