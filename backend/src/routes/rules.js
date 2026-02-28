const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Rule = require('../models/Rule');

const ruleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  conditions: Joi.object({
    event_type: Joi.array().items(Joi.string()).optional(),
    source: Joi.array().items(Joi.string()).optional(),
    channel: Joi.array().items(Joi.string()).optional(),
    priority_hint: Joi.array().items(Joi.string()).optional(),
    hour_range: Joi.array().items(Joi.number()).length(2).optional(),
    user_id: Joi.array().items(Joi.string()).optional()
  }).required(),
  action: Joi.string().valid('now', 'later', 'never').required(),
  priority: Joi.number().min(0).max(100).default(50),
  is_active: Joi.boolean().default(true)
});

// GET all rules
router.get('/', async (req, res, next) => {
  try {
    const rules = await Rule.find().sort({ priority: -1, createdAt: -1 });
    res.json({ total: rules.length, rules });
  } catch (err) { next(err); }
});

// POST create new rule
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = ruleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const rule = await Rule.create(value);
    res.status(201).json({ message: 'Rule created', rule });
  } catch (err) { next(err); }
});

// PUT update rule
router.put('/:id', async (req, res, next) => {
  try {
    const rule = await Rule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json({ message: 'Rule updated', rule });
  } catch (err) { next(err); }
});

// DELETE rule
router.delete('/:id', async (req, res, next) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json({ message: 'Rule deleted', id: req.params.id });
  } catch (err) { next(err); }
});

module.exports = router;