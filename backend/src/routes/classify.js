const express = require('express');
const router = express.Router();
const Joi = require('joi');
const classifierService = require('../services/classifierService');

const notificationSchema = Joi.object({
  event_id: Joi.string().uuid().optional(),
  user_id: Joi.string().required(),
  event_type: Joi.string().valid(
    'security_alert', 'payment', 'order_shipped', 'order_delivered',
    'message', 'reminder', 'promo', 'marketing', 'system', 'social',
    'news', 'update', 'other'
  ).required(),
  message: Joi.string().max(2000).required(),
  priority_hint: Joi.string().valid('critical', 'high', 'medium', 'low').default('medium'),
  channel: Joi.string().valid('push', 'sms', 'email', 'in_app').required(),
  source: Joi.string().default('unknown'),
  dedupe_key: Joi.string().optional(),
  expires_at: Joi.date().iso().optional(),
  metadata: Joi.object().optional()
});

// POST /api/v2/classify - single notification
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = notificationSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await classifierService.classify(value);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v2/classify/bulk - multiple notifications (up to 100)
router.post('/bulk', async (req, res, next) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'events must be a non-empty array' });
    }
    if (events.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 events per bulk request' });
    }

    const validated = events.map(e => {
      const { error, value } = notificationSchema.validate(e);
      if (error) throw new Error(`Event validation failed: ${error.details[0].message}`);
      return value;
    });

    const results = await Promise.all(validated.map(e => classifierService.classify(e)));
    const summary = {
      total: results.length,
      now: results.filter(r => r.decision === 'now').length,
      later: results.filter(r => r.decision === 'later').length,
      never: results.filter(r => r.decision === 'never').length
    };

    res.status(200).json({ summary, results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;