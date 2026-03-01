**# Architecture Decisions**



**## 1. Near-Duplicate Detection**

**\*\*Decision\*\*: Use SHA-256 for exact matches, MD5 for near-duplicates**

**\*\*Why\*\*: Fast O(1) lookup, catches similar notifications**



**## 2. AI Processing**

**\*\*Decision\*\*: Synchronous with fallback**

**\*\*Why\*\*: Simple, predictable response times**



**## 3. Database**

**\*\*Decision\*\*: MongoDB for both stacks**

**\*\*Why\*\*: Flexible schema, same model across stacks**



**## 4. Failure Handling**

**\*\*Decision\*\*: 3 retries with exponential backoff**

**\*\*Why\*\*: Handles transient failures without overload**



**## 5. LATER Queue**

**\*\*Decision\*\*: Scheduled job every 5 minutes**

**\*\*Why\*\*: Simple, no additional infrastructure**

