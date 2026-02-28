const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  conditions: {
    event_type: { type: [String], default: null },
    source: { type: [String], default: null },
    channel: { type: [String], default: null },
    priority_hint: { type: [String], default: null },
    hour_range: { type: [Number], default: null },
    user_id: { type: [String], default: null }
  },
  action: {
    type: String,
    required: true,
    enum: ['now', 'later', 'never']
  },
  priority: { type: Number, default: 50 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

ruleSchema.index({ priority: -1, is_active: 1 });

module.exports = mongoose.model('Rule', ruleSchema);
