import { redis } from "../db/redis.db.js";

const BLACKLIST_PREFIX = "blacklist:";

export const blacklistToken = async (tokenHash, ttlSeconds) => {
  if (ttlSeconds <= 0) return;
  await redis.set(`${BLACKLIST_PREFIX}${tokenHash}`, "1", "EX", ttlSeconds);
};

export const isTokenBlacklisted = async (tokenHash) => {
  const result = await redis.get(`${BLACKLIST_PREFIX}${tokenHash}`);
  return result !== null;
};