const { getGroqClient } = require('../config/groq');

const SYSTEM_PROMPT = `You are a notification prioritization engine. 
Given a notification event, you must classify it as: "now", "later", or "never".
Rules:
- "now": urgent, time-sensitive, security, payments, critical system events
- "later": informational, can wait, non-critical updates
- "never": promotional spam, duplicates, irrelevant content, expired events

Respond ONLY with valid JSON in this exact format:
{
  "decision": "now" | "later" | "never",
  "confidence": 0.0-1.0,
  "reason": "brief explanation under 100 chars"
}`;

const groqScorer = {
  async score(notification) {
    try {
      const client = getGroqClient();

      const prompt = `Classify this notification:
Event Type: ${notification.event_type}
Priority Hint: ${notification.priority_hint}
Channel: ${notification.channel}
Message: ${notification.message.substring(0, 200)}
Source: ${notification.source}
Current Hour: ${new Date().getHours()}`;

      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');

      const parsed = JSON.parse(content);

      if (!['now', 'later', 'never'].includes(parsed.decision)) {
        throw new Error(`Invalid decision: ${parsed.decision}`);
      }

      return {
        success: true,
        decision: parsed.decision,
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
        reason: parsed.reason || 'Groq AI classification',
        mode: 'groq_ai'
      };

    } catch (error) {
      console.error('Groq scoring failed:', error.message);
      return {
        success: false,
        error: error.message,
        mode: 'fallback'
      };
    }
  }
};

module.exports = groqScorer;