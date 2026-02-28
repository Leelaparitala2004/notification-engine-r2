const Rule = require('../models/Rule');

function isHourInRange(hour, range) {
  if (!range || range.length !== 2) return false;
  const [start, end] = range;
  if (start <= end) {
    return hour >= start && hour <= end;
  } else {
    return hour >= start || hour <= end;
  }
}

function matchesCondition(notification, conditions) {
  const currentHour = new Date().getHours();

  if (conditions.event_type?.length) {
    if (!conditions.event_type.includes(notification.event_type)) return false;
  }
  if (conditions.source?.length) {
    if (!conditions.source.includes(notification.source)) return false;
  }
  if (conditions.channel?.length) {
    if (!conditions.channel.includes(notification.channel)) return false;
  }
  if (conditions.priority_hint?.length) {
    if (!conditions.priority_hint.includes(notification.priority_hint)) return false;
  }
  if (conditions.user_id?.length) {
    if (!conditions.user_id.includes(notification.user_id)) return false;
  }
  if (conditions.hour_range) {
    if (!isHourInRange(currentHour, conditions.hour_range)) return false;
  }

  return true;
}

const ruleEngine = {
  async evaluate(notification) {
    const rules = await Rule.find({ is_active: true }).sort({ priority: -1 });

    for (const rule of rules) {
      if (matchesCondition(notification, rule.conditions)) {
        return {
          matched: true,
          action: rule.action,
          ruleName: rule.name,
          ruleId: rule._id
        };
      }
    }

    return { matched: false };
  }
};

module.exports = ruleEngine;