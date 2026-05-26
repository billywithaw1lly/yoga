import { verifyAccessToken, hashToken } from "../config/accessToken.config.js";
import { isTokenBlacklisted }           from "../services/tokenBlacklist.services.js";

export const authenticate = async (req, res, next) => {
  try {
    // ✅ read from cookie instead of Authorization header
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided." });
    }

    // 1. Verify signature + expiry
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError"
          ? "Access token expired."
          : "Invalid token.",
      });
    }

    // 2. Check Redis blacklist
    const tokenHash   = hashToken(token);
    const blacklisted = await isTokenBlacklisted(tokenHash);
    if (blacklisted) {
      return res.status(401).json({ success: false, message: "Token revoked. Please log in again." });
    }

    // 3. Attach user
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};