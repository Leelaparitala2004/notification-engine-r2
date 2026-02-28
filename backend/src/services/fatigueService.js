const counters = new Map();

const CHANNEL_LIMITS = {
  push: 20,
  sms: 5,
  email: 10,
  in_app: 50
};

const GLOBAL_LIMIT = 30;

const COOLDOWNS_MS = {
  promo: 6 * 60 * 60 * 1000,
  marketing: 12 * 60 * 60 * 1000,
  reminder: 15 * 60 * 1000
};

function getOrCreate(key, windowMs) {
  const now = Date.now();
  if (!counters.has(key) || now > counters.get(key).resetAt) {
    counters.set(key, { count: 0, resetAt: now + windowMs, lastSeen: null });
  }
  return counters.get(key);
}

const fatigueService = {
  check(notification) {
    const { user_id, channel, event_type } = notification;
    const now = Date.now();

    if (COOLDOWNS_MS[event_type]) {
      const cooldownKey = `cooldown:${user_id}:${event_type}`;
      const entry = counters.get(cooldownKey);
      if (entry && now < entry.resetAt) {
        const waitMin = Math.ceil((entry.resetAt - now) / 60000);
        return { limited: true, reason: `${event_type}_cooldown`, waitMinutes: waitMin };
      }
    }

    const channelKey = `channel:${user_id}:${channel}`;
    const channelCounter = getOrCreate(channelKey, 60 * 60 * 1000);
    if (channelCounter.count >= (CHANNEL_LIMITS[channel] || 20)) {
      return { limited: true, reason: `${channel}_hourly_limit` };
    }

    const globalKey = `global:${user_id}`;
    const globalCounter = getOrCreate(globalKey, 60 * 60 * 1000);
    if (globalCounter.count >= GLOBAL_LIMIT) {
      return { limited: true, reason: 'global_hourly_limit' };
    }

    return { limited: false };
  },

  register(notification) {
    const { user_id, channel, event_type } = notification;
    const now = Date.now();

    const channelKey = `channel:${user_id}:${channel}`;
    const channelCounter = getOrCreate(channelKey, 60 * 60 * 1000);
    channelCounter.count++;

    const globalKey = `global:${user_id}`;
    const globalCounter = getOrCreate(globalKey, 60 * 60 * 1000);
    globalCounter.count++;

    if (COOLDOWNS_MS[event_type]) {
      const cooldownKey = `cooldown:${user_id}:${event_type}`;
      counters.set(cooldownKey, {
        count: 1,
        resetAt: now + COOLDOWNS_MS[event_type],
        lastSeen: now
      });
    }
  }
};

module.exports = fatigueService;