import { prisma }               from "../../db/prisma.db.js";
import { verifyPassword }       from "../../config/bcrypt.config.js";
import { generateAccessToken }  from "../../config/accessToken.config.js";
import { generateRefreshToken } from "../../config/refreshToken.config.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isCorrect = await verifyPassword(password, user.passwordHash);
    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      accessToken,
      data: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};