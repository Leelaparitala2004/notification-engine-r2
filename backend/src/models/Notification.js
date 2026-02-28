const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  event_type: {
    type: String,
    required: true,
    enum: [
      'security_alert', 'payment', 'order_shipped', 'order_delivered',
      'message', 'reminder', 'promo', 'marketing', 'system', 'social',
      'news', 'update', 'other'
    ]
  },
  message: { type: String, required: true, maxlength: 2000 },
  priority_hint: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  channel: {
    type: String,
    enum: ['push', 'sms', 'email', 'in_app'],
    required: true
  },
  source: { type: String, default: 'unknown' },
  dedupe_key: { type: String, default: null },
  expires_at: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

notificationSchema.index({ user_id: 1, event_type: 1, createdAt: -1 });
notificationSchema.index({ dedupe_key: 1 }, { sparse: true });

module.exports = mongoose.model('Notification', notificationSchema);