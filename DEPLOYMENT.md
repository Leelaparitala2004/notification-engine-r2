**# Deployment Guide**



**## Live URLs**

**- \*\*MERN Frontend\*\*: https://notification-engine-r2.vercel.app**

**- \*\*MERN Backend\*\*: https://exquisite-harmony-production.up.railway.app**

**- \*\*Spring Boot Backend\*\*: https://web-production-205d9.up.railway.app**



**## Railway Deployment**

**1. Push code to GitHub**

**2. Connect Railway to GitHub**

**3. Add environment variables:**

   **- MONGODB\_URI**

   **- GROQ\_API\_KEY**

**4. Deploy**



**## Vercel Deployment**

**1. Connect Vercel to GitHub**

**2. Set root directory to `frontend`**

**3. Add VITE\_API\_URL**

**4. Deploy**



**## Verify Deployment**

**- Health check: https://exquisite-harmony-production.up.railway.app/api/v2/health**

**- Should return {"status":"ok","services":{"mongodb":"connected","groq":"configured"}}**

