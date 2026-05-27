import { prisma } from "../../db/prisma.db.js";
import { hashPassword } from "../../config/bcrypt.config.js"; // Assuming you have a hash helper

export const resetPassword = async (req, res) => {
    try {
        // 1. Get token from cookies, get passwords from body
        const { resetToken } = req.cookies; 
        const { newPassword, confirmPassword } = req.body;

        if (!resetToken) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized. Reset token missing or expired." 
            });
        }

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // 2. Find user by the token stored in the cookie
        const user = await prisma.user.findFirst({
            where: { resetToken },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid reset token." });
        }

        if (new Date() > user.resetTokenExpiry) {
            return res.status(400).json({ success: false, message: "Reset token expired. Please start again." });
        }

        // 3. Hash new password and update database
        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword, // Make sure this matches your Prisma schema field
                resetToken: null,             // Clear the token so it can't be reused
                resetTokenExpiry: null,
            }
        });

        // 4. Clear the cookie and return success
        return res
            .status(200)
            .clearCookie("resetToken")
            .json({
                success: true,
                message: "Password changed successfully"
            });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};