const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema({
  event_id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  decision: {
    type: String,
    required: true,
    enum: ['now', 'later', 'never']
  },
  reason: { type: String, required: true },
  confidence: { type: Number, min: 0, max: 1, default: null },
  scheduled_at: { type: Date, default: null },
  processing_mode: {
    type: String,
    enum: ['groq_ai', 'rule_based', 'fallback'],
    default: 'rule_based'
  },
  pipeline_stages: [{
    stage: String,
    result: String,
    detail: String
  }],
  suppression_reason: {
    type: String,
    enum: ['duplicate', 'rate_limit', 'rule', 'expired', 'ai_decision', null],
    default: null
  }
}, { timestamps: true });

decisionSchema.index({ user_id: 1, createdAt: -1 });
decisionSchema.index({ decision: 1, createdAt: -1 });

module.exports = mongoose.model('Decision', decisionSchema);