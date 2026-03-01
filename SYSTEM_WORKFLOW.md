**# System Workflow Documentation**



**## 6-Stage Pipeline**



**### Stage 1: Expiry Check**

**- Checks if notification has expired**

**- If expired → Decision: "never"**



**### Stage 2: Deduplication**

**- Exact match (SHA-256 hash)**

**- Near-duplicate (MD5 hash)**

**- If duplicate → Decision: "never"**



**### Stage 3: Rule Engine**

**- Evaluates against active rules**

**- First matching rule determines action**



**### Stage 4: Fatigue Check**

**- Rate limits per channel**

**- Event type cooldowns**

**- If limited → Decision: "later"**



**### Stage 5: AI Scoring**

**- Groq LLaMA-3.3-70B**

**- 3 retry attempts with backoff**

**- Returns decision with confidence**



**### Stage 6: Fallback**

**- Rule-based if AI fails**

**- Critical events → "now"**

**- Promotional → "never"**

**- Default → "later"**

