import express from 'express'

import {userRegistration} from "../controllers/auth/register.auth.js"

import { validate } from '../middlewares/validation.middleware.js'
import { loginSchema } from '../schema/auth/login.schema.js'

import { registrationSchama } from '../schema/auth/registration.schema.js'
import { loginUser } from '../controllers/auth/login.auth.js';
import { logout } from '../controllers/auth/logout.auth.js';
import { authenticate } from '../middlewares/auth.middleware.js'
import { verifyOTP }  from "../controllers/auth/verifyEmailOtp.auth.js";
import { resendOTP }  from "../controllers/auth/resendOtp.auth.js";
import { sendOTP } from "../controllers/auth/sendOtp.auth.js";
import { deleteUser } from "../controllers/auth/deleteUser.auth.js"
import { forgotPassword } from '../controllers/auth/forgetPassword.auth.js'
import { verifyResetOTP } from '../controllers/auth/verifyResetOTP.auth.js'
import { resetPassword } from '../controllers/auth/resetPassword.auth.js'

const router = express.Router();

router.post("/register", validate(registrationSchama), userRegistration)
router.post("/login", validate(loginSchema), loginUser)
router.post("/logout",   authenticate, logout);
router.post("/verify-otp",  verifyOTP);
router.post("/resend-otp",  resendOTP);
router.post("/send-otp", sendOTP);
router.post("/forgot-password",   forgotPassword);
router.post("/verify-reset-otp",  verifyResetOTP);
router.post("/reset-password",    resetPassword);

router.delete("/delete-user", authenticate, deleteUser);

export default router