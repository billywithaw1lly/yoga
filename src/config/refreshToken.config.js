import jwt    from "jsonwebtoken";
import crypto from "crypto";

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};