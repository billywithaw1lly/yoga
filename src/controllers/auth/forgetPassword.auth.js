import { success } from "zod";
import {prisma} from "../../db/prisma.db.js"
import { generateOTP, generateOTPExpiry } from "../../services/otp.services.js";
import { sendResetOTPEmail } from "../../notification/email.notification.js";

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body

        if(!email){
            return res
                    .status(400)
                    .json({
                        success:false,
                        message:"email is required"
                    })
        }
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        // Don't reveal if email exists or not — security best practice
        if (!user) {
        return res.status(200).json({
                success: true,
                message: "If that email is registered, an OTP has been sent.",
            });
        }

        const otp = generateOTP();
        const resetOtpExpiry = generateOTPExpiry();

        await prisma.user.update({
            where: { id: user.id },
            data: { 
                resetOtp: otp, 
                resetOtpExpiry,
                resetToken: null,
                resetTokenExpiry: null
            }
        });


        await prisma.user.update({
            where : {id : user.id},
            data : {resetOtp : otp, resetOtpExpiry}
        })

        await sendResetOTPEmail(email, user.name, otp)

        return res
                .status(200)
                .json({
                    success:true,
                    message:"If that email is registered, an OTP has been sent."
                })
        
    } catch (error) {
        console.error("Forgot password error:", error);
        return res
                .status(500)
                .json({
                    success:false,
                    message:"internal server error"
                })
    }
}