**# Notification Prioritization Engine - MERN Stack**



**## 🚀 Live URLs**

**- \*\*Frontend\*\*: https://notification-engine-r2.vercel.app**

**- \*\*Backend\*\*: https://exquisite-harmony-production.up.railway.app**

**- \*\*Health Check\*\*: https://exquisite-harmony-production.up.railway.app/api/v2/health**



**## 📋 Project Overview**

**A full-stack notification prioritization system that classifies incoming notifications as NOW, LATER, or NEVER using a 6-stage decision pipeline with Groq AI integration.**



**## 🛠️ Tech Stack**

**- \*\*Database\*\*: MongoDB Atlas**

**- \*\*Backend\*\*: Express.js, Node.js**

**- \*\*Frontend\*\*: React, Vite, Material-UI**

**- \*\*AI\*\*: Groq LLaMA-3.3-70B**

**- \*\*Deployment\*\*: Railway (backend), Vercel (frontend)**



**## ✨ Features**

**- ✅ 6-stage decision pipeline (Expiry → Dedup → Rules → Fatigue → AI → Fallback)**

**- ✅ Real Groq AI integration with fallback**

**- ✅ Exact and near-duplicate detection**

**- ✅ Alert fatigue management with rate limits**

**- ✅ Dynamic rules engine (configurable via UI)**

**- ✅ Complete audit logging**

**- ✅ 7 mobile-first UI screens**

**- ✅ Fail-safe architecture with retry logic**



**## 🔧 Local Setup**



**### Backend Setup**

**```bash**

**cd backend**

**npm install**

**cp .env.example .env**

**# Edit .env with your credentials**

**npm run dev**

