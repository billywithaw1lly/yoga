import jwt    from "jsonwebtoken";
import crypto from "crypto";                    // was missing

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);      // throws if invalid/expired
};

export const getTokenTTL = (decodedToken) => {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(decodedToken.exp - now, 0);
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};