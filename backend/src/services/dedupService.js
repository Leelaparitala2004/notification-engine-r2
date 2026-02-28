const crypto = require('crypto');

const dedupCache = new Map();
const EXACT_TTL_MS = 60 * 60 * 1000;
const NEAR_TTL_MS = 5 * 60 * 1000;

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, val] of dedupCache.entries()) {
    if (now > val.expiresAt) dedupCache.delete(key);
  }
}

setInterval(cleanExpiredCache, 5 * 60 * 1000);

function getExactHash(notification) {
  const str = `${notification.user_id}|${notification.event_type}|${notification.message}|${notification.channel}`;
  return crypto.createHash('sha256').update(str).digest('hex');
}

function getNearHash(notification) {
  const str = `${notification.user_id}|${notification.event_type}|${notification.source}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

const dedupService = {
  async check(notification) {
    const now = Date.now();

    if (notification.dedupe_key) {
      const key = `dedup_key:${notification.dedupe_key}`;
      if (dedupCache.has(key) && now < dedupCache.get(key).expiresAt) {
        return { isDuplicate: true, reason: 'explicit_dedupe_key' };
      }
    }

    const exactHash = getExactHash(notification);
    const exactKey = `exact:${exactHash}`;
    if (dedupCache.has(exactKey) && now < dedupCache.get(exactKey).expiresAt) {
      return { isDuplicate: true, reason: 'exact_duplicate' };
    }

    const nearHash = getNearHash(notification);
    const nearKey = `near:${nearHash}`;
    if (dedupCache.has(nearKey) && now < dedupCache.get(nearKey).expiresAt) {
      return { isDuplicate: true, reason: 'near_duplicate' };
    }

    return { isDuplicate: false };
  },

  register(notification) {
    const now = Date.now();

    if (notification.dedupe_key) {
      dedupCache.set(`dedup_key:${notification.dedupe_key}`, { expiresAt: now + EXACT_TTL_MS });
    }

    const exactHash = getExactHash(notification);
    dedupCache.set(`exact:${exactHash}`, { expiresAt: now + EXACT_TTL_MS });

    const nearHash = getNearHash(notification);
    dedupCache.set(`near:${nearHash}`, { expiresAt: now + NEAR_TTL_MS });
  }
};

module.exports = dedupService;