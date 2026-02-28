const express = require('express');
const router = express.Router();
const Decision = require('../models/Decision');
const dayjs = require('dayjs');

// GET /api/v2/metrics - Get system metrics
router.get('/', async (req, res, next) => {
  try {
    const since24h = dayjs().subtract(24, 'hour').toDate();

    const [totals, byMode, bySuppressionReason, hourlyTrend] = await Promise.all([
      // Total decisions breakdown
      Decision.aggregate([
        { $group: { _id: '$decision', count: { $sum: 1 } } }
      ]),

      // By processing mode
      Decision.aggregate([
        { $group: { _id: '$processing_mode', count: { $sum: 1 } } }
      ]),

      // By suppression reason
      Decision.aggregate([
        { $match: { suppression_reason: { $ne: null } } },
        { $group: { _id: '$suppression_reason', count: { $sum: 1 } } }
      ]),

      // Hourly trend (last 24h)
      Decision.aggregate([
        { $match: { createdAt: { $gte: since24h } } },
        {
          $group: {
            _id: {
              hour: { $hour: '$createdAt' },
              decision: '$decision'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.hour': 1 } }
      ])
    ]);

    const decisionMap = {};
    totals.forEach(t => { decisionMap[t._id] = t.count; });

    res.json({
      totals: {
        now: decisionMap.now || 0,
        later: decisionMap.later || 0,
        never: decisionMap.never || 0,
        total: Object.values(decisionMap).reduce((a, b) => a + b, 0)
      },
      by_processing_mode: byMode.reduce((a, m) => ({ ...a, [m._id]: m.count }), {}),
      by_suppression_reason: bySuppressionReason.reduce((a, m) => ({ ...a, [m._id]: m.count }), {}),
      hourly_trend_24h: hourlyTrend,
      generated_at: new Date().toISOString()
    });
  } catch (err) { next(err); }
});

module.exports = router;