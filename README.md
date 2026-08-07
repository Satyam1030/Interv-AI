# ⚡ IntervAI - The AI Technical Interviewer Agent

> **Build the interviewer, not the interview.**

IntervAI is an autonomous AI technical interviewer built for the 31-Day Enterprise AI Cohort. It conducts realistic, multi-turn technical interviews tailored to each candidate's learning journey, assessing their understanding of RAG, Vector Databases, Prompt Engineering, Agentic AI, MCP, and AI Deployment.

---

## ✨ Features

- **Candidate Portal & Login**: Slide-down candidate selection bar featuring candidate profile previews, learning signals, and missed/skipped mission highlights.
- **Adaptive Multi-Turn Interview Agent**: Powered by Google Gemini AI, conducting >= 8 turns across >= 4 curriculum days.
- **Dynamic Probing & Follow-ups**: Challenges candidate implementation choices, edge cases, latency, and system trade-offs.
- **Structured Performance Scorecards**: Produces actionable evaluation reports matching the hackathon technical specification (`summary`, `strengths`, `gaps`, `next`).
- **Live Spec Contract Tester**: Built-in automated tester validating compliance against `POST /api/interview`.
- **Glassmorphic UI**: Built with React, Vite, and custom CSS design system.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Custom CSS Design System
- **Backend**: Node.js, Express, Mongoose (with high-performance In-Memory Session fallback)
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **Data Foundation**: 31-Day AI Cohort Curriculum & Candidate Profiles

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `server/.env` file:

```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Run Application

```bash
# Start Backend API Server (Port 5000)
cd server
npm start

# Start Frontend App (Port 3000)
cd client
npm run dev
```

Visit `http://localhost:3000` to launch IntervAI!

---

## 📡 API Contract (`POST /api/interview`)

### Start Interview
```json
POST /api/interview
{
  "sessionId": "abc-123",
  "candidate": { ...candidate.json }
}
```
**Response**: `{ "reply": "Welcome...", "done": false }`

### Conversation Turn
```json
POST /api/interview
{
  "sessionId": "abc-123",
  "message": "I used SentenceTransformers with ChromaDB..."
}
```
**Response**: `{ "reply": "...", "done": false }`

### Interview Completion
**Response**:
```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": ["..."],
    "gaps": ["..."],
    "next": ["..."]
  }
}
```

---

## 📜 License

MIT License
