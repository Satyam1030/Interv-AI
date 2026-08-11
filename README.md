# ⚡ IntervAI — Autonomous AI Technical Interviewer

<div align="center">

> **Build the interviewer, not the interview.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://interv-ai-xi.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Satyam1030/Interv-AI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![AI Engine](https://img.shields.io/badge/AI_Engine-OpenRouter_API-7C3AED?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js_16_%7C_React_19-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_%7C_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://expressjs.com/)

---

**IntervAI** is an autonomous, context-aware AI technical interviewer powered by **OpenRouter API**. It conducts dynamic, multi-turn technical interviews to evaluate software engineers across real-world system architecture, implementation trade-offs, and edge cases.

Built around the **31-Day Enterprise AI Cohort** curriculum, IntervAI assesses concepts such as **RAG Pipelines, Vector Databases, Prompt Engineering, Agentic Workflows, Model Context Protocol (MCP), Observability, and Guardrails**.

[Live Demo](https://interv-ai-xi.vercel.app/) • [Key Features](#-key-features) • [System Architecture](#%EF%B8%8F-system-architecture) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Getting Started](#-getting-started) • [API Docs](#-api-documentation)

---

</div>

## 🌐 Live Demo & Repository

- 🚀 **Deployed Web Application:** [https://interv-ai-xi.vercel.app/](https://interv-ai-xi.vercel.app/)
- 📦 **GitHub Repository:** [https://github.com/Satyam1030/Interv-AI](https://github.com/Satyam1030/Interv-AI)

---

## 🎯 Why IntervAI?

Traditional technical interview platforms rely on static question banks or automated multiple-choice tests. They fail to assess how an engineer thinks, makes trade-offs, or handles edge cases in production.

**IntervAI changes this by deploying an AI interviewer agent that:**

* 🧠 **Adapts dynamically** to candidate responses in real time.
* 🔍 **Probes deep** into technical trade-offs, edge cases, latency, and scalability.
* 🎯 **Tailors question sets** based on the candidate's learning history and completed/skipped missions.
* 📊 **Evaluates every turn** using quantitative scores and technical criteria.
* 📝 **Generates executive performance scorecards** complete with Strengths, Knowledge Gaps, and Next Steps.

---

## ✨ Key Features

### 🤖 1. Adaptive AI Interviewer (Powered by OpenRouter API)
Instead of following a fixed questionnaire script, IntervAI uses **OpenRouter API** (featuring models such as `inclusionai/ling-3.0-tiny:free`) to run multi-turn technical conversations. The interviewer analyzes technical depth, detects incomplete logic, and asks relevant follow-up questions.

### 👤 2. Candidate Portal & Mission Telemetry
Candidates are initialized with personalized context derived from their cohort performance:
* Completed vs. skipped/struggled learning missions.
* Target curriculum focus areas (prioritizing topics requiring validation).
* Customized introductory and scenario-based technical prompts.

### 🔍 3. Dynamic Probing & Trade-off Analysis
IntervAI evaluates candidates across key architectural vectors:
* **System Design & RAG Architecture:** Vector indexing, chunking strategies, embeddings, hybrid search.
* **Prompt Engineering:** Structured output schemas, system instructions, guardrails.
* **Agentic Workflows & MCP:** Tool orchestration, state persistence, protocol integrations.
* **Operational Readiness:** Latency budgets, OpenTelemetry instrumentation, fallback strategies.

### 📊 4. Decision-Grade Candidate Scorecard
Upon completing the multi-turn session, IntervAI delivers a structured evaluation matrix:
* **Overall Score (0–100):** Weighted combination of Technical Depth (40%), Reasoning (25%), Communication (15%), and Problem Solving (20%).
* **Detailed Breakdown:** Granular sub-scores for technical capabilities.
* **Actionable Feedback:** Key Demonstrated Strengths, Critical Gaps, and Recommended Next Steps.

### 🛡️ 5. Dual Engine & Graceful Fallbacks
* **OpenRouter AI Engine:** Active when `OPENROUTER_API_KEY` is configured.
* **Heuristic Engine Fallback:** In-memory score calculation and rule-based questioning ensures zero-downtime execution even during API key absence or rate limits.

---

## 🏗️ System Architecture

```text
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            Candidate / User                             │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                             Client (Frontend)                           │
 │             Next.js 16 + React 19 + Tailwind CSS + Radix UI             │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
                                REST API (HTTP)
                                      │
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                             Server (Backend)                            │
 │                        Node.js + Express.js API                         │
 └───────────┬────────────────────────┬───────────────────────┬────────────┘
             │                        │                       │
             ▼                        ▼                       ▼
 ┌───────────────────────┐┌───────────────────────┐┌───────────────────────┐
 │    OpenRouter API     ││   Session & State     ││   Cohort Curriculum   │
 │ (AI Intelligence)     ││ (MongoDB / In-Memory) ││   & Candidate Data    │
 └───────────┬───────────┘└───────────────────────┘└───────────────────────┘
             │
             ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                   Interview & Evaluation Engine                         │
 │   • Turn Evaluation  • Dynamic Probing  • Scorecard Generation          │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Interview Workflow

```text
                     Candidate Selection & Profile Load
                                     │
                                     ▼
                    Target Curriculum Modules Identified
                                     │
                                     ▼
                      Session Initialized (Turn 1)
                                     │
                                     ▼
                   OpenRouter AI Generates Tailored Question
                                     │
                                     ▼
                        Candidate Submits Answer
                                     │
                                     ▼
                   OpenRouter Evaluates Answer & Score
                                     │
                                     ▼
                        Is Interview Complete?
                        ├── No  ──► Probe Deeper / Next Topic ──► (Loop)
                        └── Yes ──► Generate Executive Scorecard
                                     │
                                     ▼
                      Display Strengths, Gaps & Next Steps
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router) & React 19
- **Styling:** Tailwind CSS v4, Custom Design System
- **Components & UI:** Radix UI Primitives, Lucide Icons, Framer Motion
- **Form & Validation:** React Hook Form, Zod
- **Authentication:** Clerk (`@clerk/nextjs`)

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database / Storage:** MongoDB with Mongoose (with In-Memory Session Fallback)
- **Authentication & Security:** JWT, bcryptjs, `@clerk/express`

### AI & Intelligence Engine
- **Provider:** **OpenRouter API** (`https://openrouter.ai/api/v1/chat/completions`)
- **Default Model:** `inclusionai/ling-3.0-tiny:free` (configurable)
- **Integration:** Native Fetch API with JSON cleaning and resilient fallbacks

---

## 📁 Project Structure

```text
Interv-AI/
├── client/                      # Next.js 16 Frontend Application
│   ├── src/                     # Source components, pages, and hooks
│   ├── public/                  # Static assets
│   ├── package.json             # Frontend dependencies
│   └── next.config.ts           # Next.js configuration
│
├── server/                      # Express.js Backend Application
│   ├── controllers/             # Request handlers
│   ├── data/                    # Cohort curriculum & candidate JSON data
│   │   ├── candidates.json      # Candidate profiles & mission histories
│   │   └── curriculum.json      # 31-Day Enterprise AI curriculum breakdown
│   ├── middleware/              # Auth & error handling middlewares
│   ├── models/                  # Mongoose models for candidates & sessions
│   ├── routes/                  # REST API routes (e.g. /api/interview)
│   ├── services/                # OpenRouter AI Interview Agent Service
│   │   └── interviewAgentService.js
│   ├── server.js                # Server entry point
│   └── package.json             # Backend dependencies
│
├── .gitignore                   # Git ignore patterns
├── package.json                 # Workspace root scripts
├── prompts.md                   # Complete AI Development Prompt Log
└── README.md                    # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have installed:
* **Node.js** (v18.x or higher)
* **npm** (v9.x or higher)
* **Git**
* **OpenRouter API Key** (Get one at [openrouter.ai/keys](https://openrouter.ai/keys))

---

### 1. Clone the Repository

```bash
git clone https://github.com/Satyam1030/Interv-AI.git
cd Interv-AI
```

### 2. Install Dependencies

You can install all dependencies for both client and server from the root directory:

```bash
npm run install:all
```

*Or install them individually:*

```bash
# Install Server Dependencies
cd server && npm install

# Install Client Dependencies
cd ../client && npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenRouter AI Key (Required for live OpenRouter model calls)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Database & Security (Optional / Pre-configured fallbacks)
MONGODB_URI=mongodb://127.0.0.1:27017/intervai
JWT_SECRET=your_super_secret_jwt_key_here
```

> ⚠️ **Security Warning:** Never commit your `.env` file or private API keys to GitHub.

---

## ▶️ Running the Application

### Option A: Concurrent Development (Recommended)

From the root directory, run server and client concurrently:

```bash
# Terminal 1: Backend Server
npm run dev:server

# Terminal 2: Frontend Client
npm run dev:client
```

### Option B: Individual Service Launch

**Start Backend:**
```bash
cd server
npm start
```
*Backend runs on: `http://localhost:5000`*

**Start Frontend:**
```bash
cd client
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## 📡 API Documentation

### 1. Start or Continue Interview Turn

```http
POST /api/interview
```

#### Request (Initialization / Turn 1)

```json
{
  "sessionId": "session-1723400000000",
  "candidate": {
    "member": {
      "id": "cand-01",
      "name": "Satyam",
      "jobRole": "AI Engineer"
    }
  }
}
```

#### Response (Interviewer Question)

```json
{
  "reply": "Welcome Satyam! As an AI Engineer, let's start with Day 7 (Vector DB & Indexing). How did you structure your embedding pipeline and what trade-offs influenced your choice of vector index?",
  "done": false,
  "isOpenRouterActive": true
}
```

#### Request (Candidate Response / Subsequent Turn)

```json
{
  "sessionId": "session-1723400000000",
  "message": "I used SentenceTransformers to generate 384-dimensional embeddings and indexed them using HNSW in ChromaDB for fast approximate nearest neighbor search..."
}
```

#### Response (Interview Complete & Executive Feedback)

When the interview reaches completion criteria (e.g. 8+ questions across 4+ topics), `done` is set to `true`:

```json
{
  "reply": "Thank you, Satyam! That completes our technical interview session...",
  "done": true,
  "isOpenRouterActive": true,
  "feedback": {
    "score": 88,
    "technical": 90,
    "reasoning": 85,
    "communication": 88,
    "problemSolving": 87,
    "summary": "Satyam demonstrated strong conceptual and practical engineering clarity across key AI cohort modules...",
    "strengths": [
      "Clear architectural reasoning for vector indexing and HNSW parameters",
      "Effective application of structured prompt validation"
    ],
    "gaps": [
      "Could provide deeper operational metrics on token streaming latency"
    ],
    "next": [
      "Implement end-to-end tracing with OpenTelemetry for production vector retrieval"
    ]
  }
}
```

---

## 🧠 AI Cohort Curriculum Coverage

IntervAI evaluates candidate competency across the 31-Day Enterprise AI Cohort:

| Day Range | Topic Area | Focus Concepts |
|---|---|---|
| **Days 1–5** | Foundations & Prompting | Zero-shot/few-shot prompting, structured output schemas, system instructions |
| **Days 6–10** | RAG & Vector Databases | Embeddings, HNSW/IVF indexing, Chunking strategies, Retrieval optimization |
| **Days 11–15** | Fine-Tuning & Quantization | PEFT, LoRA/QLoRA, Model distillation, Inference latency optimization |
| **Days 16–20** | Agentic AI & MCP | Tool calling, Model Context Protocol, Multi-agent orchestration, State management |
| **Days 21–25** | Evaluation & Guardrails | LLM-as-a-Judge, Prompt injection defense, Output validation, Hallucination reduction |
| **Days 26–31** | Production AI & Observability | OpenTelemetry, Token budgets, Streaming endpoints, Cost & rate-limit scaling |

---

## 💡 Traditional Interviews vs. IntervAI

| Feature | Traditional Technical Interview | IntervAI (Powered by OpenRouter) |
|---|---|---|
| **Question Source** | Static, fixed question banks | Dynamic, AI-generated context-aware questions |
| **Adaptability** | Rigid sequence | Probes deeper based on previous candidate answers |
| **Coverage** | Generic algorithms or trivia | Real-world cohort missions, system design, & trade-offs |
| **Evaluation** | Subjective / delayed feedback | Real-time score calculation & structured report |
| **Scaling** | Time-intensive for senior engineers | Instant, 24/7 scalable interview execution |

---

## 🔮 Future Roadmap

- 🎙️ **Voice & Audio Interface:** Speech-to-text and text-to-speech candidate interaction.
- 💻 **Live Coding Sandbox:** Interactive code runner for evaluating live script submissions.
- 📊 **Recruiter & Admin Analytics:** Dashboard for viewing aggregate candidate score distributions.
- 🛡️ **Proctoring & Anti-Cheat:** Code similarity and candidate behavior verifiers.

---

## 🤝 Contributing

Contributions are warmly welcomed!

1. **Fork the Repository**
2. **Create a Feature Branch:** `git checkout -b feature/amazing-feature`
3. **Commit Your Changes:** `git commit -m "Add amazing feature"`
4. **Push to Branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Author & Acknowledgments

**Satyam (Satyam1030)**
* Built for the **31-Day Enterprise AI Cohort**
* AI Intelligence powered by [OpenRouter API](https://openrouter.ai/)

<div align="center">

**IntervAI — Build the interviewer, not the interview.**

</div>
