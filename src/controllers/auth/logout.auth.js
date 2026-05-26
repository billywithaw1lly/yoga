import { prisma }                              from "../../db/prisma.db.js";
import { blacklistToken }                      from "../../services/tokenBlacklist.services.js";
import { verifyAccessToken, hashToken, getTokenTTL } from "../../config/accessToken.config.js";

export const logout = async (req, res) => {
  try {
    // ✅ read from cookie instead of header
    const token = req.cookies?.accessToken;

    if (!token) {
    return res.status(401).json({ success: false, message: "No token provided." });
    }

    // 1. Blacklist the access token in Redis
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      decoded = null;
    }

    if (decoded) {
      const tokenHash = hashToken(token);
      const ttl       = getTokenTTL(decoded);
      await blacklistToken(tokenHash, ttl);
    }

    // 2. Delete refresh token from DB
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const refreshHash = hashToken(refreshToken);
      await prisma.refreshToken.deleteMany({
        where: { tokenHash: refreshHash },
      });
    }

    // 3. Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};