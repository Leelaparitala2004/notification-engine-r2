const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');

const Notification = require('../models/Notification');
const Decision = require('../models/Decision');
const dedupService = require('./dedupService');
const fatigueService = require('./fatigueService');
const ruleEngine = require('./ruleEngine');
const groqScorer = require('./groqScorer');

function getScheduledTime() {
  const hour = new Date().getHours();
  const now = dayjs();
  if (hour < 9) return now.startOf('day').add(9, 'hour').toDate();
  if (hour < 15) return now.startOf('day').add(15, 'hour').toDate();
  return now.add(1, 'day').startOf('day').add(9, 'hour').toDate();
}

function fallbackScore(notification) {
  const urgentTypes = ['security_alert', 'payment', 'system'];
  const laterTypes = ['order_shipped', 'order_delivered', 'message', 'update'];
  const neverTypes = ['promo', 'marketing'];

  if (urgentTypes.includes(notification.event_type) || notification.priority_hint === 'critical') {
    return { decision: 'now', confidence: 0.75, reason: '[Fallback] Critical event type or priority', mode: 'fallback' };
  }
  if (neverTypes.includes(notification.event_type) && notification.priority_hint === 'low') {
    return { decision: 'never', confidence: 0.70, reason: '[Fallback] Low-priority promotional content', mode: 'fallback' };
  }
  if (laterTypes.includes(notification.event_type)) {
    return { decision: 'later', confidence: 0.65, reason: '[Fallback] Informational event, defer delivery', mode: 'fallback' };
  }
  return { decision: 'later', confidence: 0.50, reason: '[Fallback] Default defer', mode: 'fallback' };
}

const classifierService = {
  async classify(input) {
    const event_id = input.event_id || uuidv4();
    const pipelineStages = [];

    const notification = {
      event_id,
      user_id: input.user_id,
      event_type: input.event_type,
      message: input.message,
      priority_hint: input.priority_hint || 'medium',
      channel: input.channel,
      source: input.source || 'unknown',
      dedupe_key: input.dedupe_key || null,
      expires_at: input.expires_at ? new Date(input.expires_at) : null,
      metadata: input.metadata || {}
    };

    // Stage 1: Expiry Check
    if (notification.expires_at && new Date() > notification.expires_at) {
      pipelineStages.push({ stage: 'expiry_check', result: 'never', detail: 'Notification expired' });
      return this._saveAndReturn(notification, {
        decision: 'never', reason: 'Notification has expired',
        confidence: 1.0, mode: 'rule_based',
        suppression_reason: 'expired', scheduled_at: null
      }, pipelineStages);
    }
    pipelineStages.push({ stage: 'expiry_check', result: 'pass', detail: 'Not expired' });

    // Stage 2: Dedup Check
    const dedupResult = await dedupService.check(notification);
    if (dedupResult.isDuplicate) {
      pipelineStages.push({ stage: 'dedup_check', result: 'never', detail: dedupResult.reason });
      return this._saveAndReturn(notification, {
        decision: 'never', reason: `Duplicate notification (${dedupResult.reason})`,
        confidence: 1.0, mode: 'rule_based',
        suppression_reason: 'duplicate', scheduled_at: null
      }, pipelineStages);
    }
    pipelineStages.push({ stage: 'dedup_check', result: 'pass', detail: 'No duplicate found' });

    // Stage 3: Rule Engine
    const ruleResult = await ruleEngine.evaluate(notification);
    if (ruleResult.matched) {
      pipelineStages.push({ stage: 'rule_engine', result: ruleResult.action, detail: `Rule: ${ruleResult.ruleName}` });
      const scheduled_at = ruleResult.action === 'later' ? getScheduledTime() : null;
      dedupService.register(notification);
      if (ruleResult.action !== 'never') fatigueService.register(notification);
      return this._saveAndReturn(notification, {
        decision: ruleResult.action,
        reason: `Rule matched: "${ruleResult.ruleName}"`,
        confidence: 0.95, mode: 'rule_based',
        suppression_reason: ruleResult.action === 'never' ? 'rule' : null,
        scheduled_at
      }, pipelineStages);
    }
    pipelineStages.push({ stage: 'rule_engine', result: 'pass', detail: 'No rule matched' });

    // Stage 4: Fatigue Check
    const fatigueResult = fatigueService.check(notification);
    if (fatigueResult.limited) {
      pipelineStages.push({ stage: 'fatigue_check', result: 'later', detail: fatigueResult.reason });
      const scheduled_at = getScheduledTime();
      return this._saveAndReturn(notification, {
        decision: 'later',
        reason: `Alert fatigue limit reached (${fatigueResult.reason}). Deferred, not dropped.`,
        confidence: 0.90, mode: 'rule_based',
        suppression_reason: 'rate_limit', scheduled_at
      }, pipelineStages);
    }
    pipelineStages.push({ stage: 'fatigue_check', result: 'pass', detail: 'Within limits' });

    // Stage 5: Groq AI Scoring
    const aiResult = await groqScorer.score(notification);
    let finalDecision;

    if (aiResult.success) {
      pipelineStages.push({ stage: 'groq_ai', result: aiResult.decision, detail: `Confidence: ${aiResult.confidence}` });
      finalDecision = {
        decision: aiResult.decision, reason: `Groq AI: ${aiResult.reason}`,
        confidence: aiResult.confidence, mode: 'groq_ai',
        suppression_reason: aiResult.decision === 'never' ? 'ai_decision' : null,
        scheduled_at: aiResult.decision === 'later' ? getScheduledTime() : null
      };
    } else {
      // Stage 6: Fallback
      const fb = fallbackScore(notification);
      pipelineStages.push({ stage: 'fallback', result: fb.decision, detail: `Groq failed: ${aiResult.error}` });
      finalDecision = {
        decision: fb.decision, reason: fb.reason,
        confidence: fb.confidence, mode: 'fallback',
        suppression_reason: fb.decision === 'never' ? 'ai_decision' : null,
        scheduled_at: fb.decision === 'later' ? getScheduledTime() : null
      };
    }

    dedupService.register(notification);
    if (finalDecision.decision !== 'never') fatigueService.register(notification);
    return this._saveAndReturn(notification, finalDecision, pipelineStages);
  },

  async _saveAndReturn(notification, result, pipelineStages) {
    await Notification.findOneAndUpdate(
      { event_id: notification.event_id },
      notification,
      { upsert: true, new: true }
    );

    const decision = await Decision.findOneAndUpdate(
      { event_id: notification.event_id },
      {
        event_id: notification.event_id,
        user_id: notification.user_id,
        decision: result.decision,
        reason: result.reason,
        confidence: result.confidence,
        scheduled_at: result.scheduled_at,
        processing_mode: result.mode,
        pipeline_stages: pipelineStages,
        suppression_reason: result.suppression_reason
      },
      { upsert: true, new: true }
    );

    return {
      event_id: notification.event_id,
      user_id: notification.user_id,
      decision: result.decision,
      reason: result.reason,
      confidence: result.confidence,
      scheduled_at: result.scheduled_at,
      processing_mode: result.mode,
      pipeline_stages: pipelineStages,
      created_at: decision.createdAt
    };
  }
};

module.exports = classifierService;