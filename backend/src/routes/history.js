const express = require('express');
const router = express.Router();
const Decision = require('../models/Decision');

// GET /api/v2/history/:user_id - Get user's notification history
router.get('/:user_id', async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { limit = 50, page = 1, decision } = req.query;

    const filter = { user_id };
    if (decision) filter.decision = decision;

    const [decisions, total] = await Promise.all([
      Decision.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      Decision.countDocuments(filter)
    ]);

    res.json({
      user_id, 
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      decisions
    });
  } catch (err) { next(err); }
});

module.exports = router;