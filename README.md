# ⚡ IntervAI — AI Technical Interviewer

> **Build the interviewer, not the interview.**

**IntervAI** is an autonomous AI-powered technical interviewer designed to simulate realistic technical interviews and evaluate candidates through adaptive, multi-turn conversations.

Instead of asking a fixed list of questions, IntervAI dynamically analyzes a candidate's responses and generates relevant follow-up questions around **implementation decisions, edge cases, system design, performance, latency, and technical trade-offs**.

It is built around the **31-Day Enterprise AI Cohort curriculum**, covering areas such as **RAG, Vector Databases, Prompt Engineering, Agentic AI, MCP, and AI Deployment**.

---

## 🌐 Live Demo

🚀 **Try IntervAI:**
https://interv-ai-xi.vercel.app/

📦 **GitHub Repository:**
https://github.com/Satyam1030/Interv-AI

---

## 🎯 Why IntervAI?

Traditional interview platforms generally rely on predefined question banks. This can make interviews repetitive and fails to adapt to the candidate's actual knowledge.

IntervAI solves this by introducing an **AI interviewer agent** that:

* Understands the candidate's previous responses
* Generates contextual follow-up questions
* Probes deeper into technical decisions
* Tests understanding of edge cases and trade-offs
* Evaluates the candidate after the interview
* Generates a structured performance report

The goal is to make technical interviews **more dynamic, realistic, and personalized**.

---

## ✨ Key Features

### 👤 Candidate Portal

Candidates can select their profile and view relevant learning information before starting an interview.

**Includes:**

* Candidate profile preview
* Learning signals
* Mission progress
* Missed/skipped learning missions
* Personalized interview context

---

### 🤖 Adaptive AI Interviewer

IntervAI uses **Google Gemini AI** to conduct multi-turn technical interviews.

The interviewer doesn't simply follow a predefined script. It analyzes the candidate's response and decides what should be asked next.

Example:

```text
Interviewer:
How would you implement a RAG pipeline?

Candidate:
I would use embeddings and store them in a vector database.

Interviewer:
Which embedding model would you choose and why?

Candidate:
I would use SentenceTransformers...

Interviewer:
How would you handle irrelevant retrieved documents?
```

This creates a more realistic interview experience.

---

### 🔍 Dynamic Probing

The AI interviewer can explore areas such as:

* Implementation choices
* Architecture decisions
* Edge cases
* Scalability
* Latency
* Reliability
* Security
* Model selection
* Vector database decisions
* System trade-offs

This helps determine whether a candidate **actually understands the technology** instead of simply memorizing definitions.

---

### 📊 AI Performance Evaluation

After the interview, IntervAI generates a structured scorecard containing:

| Section       | Description                              |
| ------------- | ---------------------------------------- |
| 📝 Summary    | Overall interview performance            |
| 💪 Strengths  | Areas where the candidate performed well |
| ⚠️ Gaps       | Concepts or skills requiring improvement |
| 🚀 Next Steps | Recommended areas for further learning   |

---

### 🧪 Live API Contract Tester

The project includes a built-in mechanism for validating the interview API against the expected contract.

It verifies the behavior of:

```http
POST /api/interview
```

including interview initialization, conversation turns, and interview completion.

---

### 🎨 Modern Glassmorphic UI

The frontend uses a modern glassmorphism-inspired interface with:

* Responsive layout
* Custom CSS design system
* Smooth interactions
* Candidate selection interface
* Interview conversation interface
* Structured feedback display
* Lucide icons

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Candidate      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │       + Vite        │
                    └──────────┬──────────┘
                               │
                         HTTP / REST
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │      Node.js        │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │   Gemini    │ │   Session   │ │  Candidate  │
        │     AI      │ │    State    │ │    Data     │
        └─────────────┘ └─────────────┘ └─────────────┘
                │
                ▼
        ┌─────────────────────┐
        │ Adaptive Interview  │
        │   + Evaluation      │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Structured Feedback │
        │ Summary / Strengths │
        │ Gaps / Next Steps   │
        └─────────────────────┘
```

---

# 🔄 Interview Workflow

```text
Candidate Selection
        │
        ▼
Candidate Profile Loaded
        │
        ▼
Interview Initialized
        │
        ▼
AI Generates Question
        │
        ▼
Candidate Responds
        │
        ▼
AI Analyzes Response
        │
        ▼
Follow-up / Deeper Question
        │
        ├───────────────┐
        │               │
        ▼               │
 More Questions? ───────┘
        │
       No
        │
        ▼
AI Evaluation
        │
        ▼
Performance Scorecard
        │
        ▼
Strengths + Gaps + Next Steps
```

---

# 🛠️ Tech Stack

### Frontend

* **React 18**
* **Vite**
* **Lucide Icons**
* **Custom CSS Design System**

### Backend

* **Node.js**
* **Express.js**
* **Mongoose**
* **In-Memory Session Fallback**

### AI

* **Google Gemini API**
* `@google/generative-ai`

### Data

* 31-Day Enterprise AI Cohort Curriculum
* Candidate Profiles
* Interview Session Data

### Deployment

* **Vercel** for the deployed application

---

# 📁 Project Structure

```text
Interv-AI/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── package.json
│   └── ...
│
├── .gitignore
├── package.json
└── README.md
```

The repository is organized into separate **client** and **server** applications.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git
* Google Gemini API Key

---

## 1. Clone the Repository

```bash
git clone https://github.com/Satyam1030/Interv-AI.git

cd Interv-AI
```

---

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/intervai
JWT_SECRET=your_super_secret_jwt_key_here
OPENROUTER_API_KEY=your_OPENROUTER_API_KEY_here
NODE_ENV=development
```

> ⚠️ Never commit your API key to GitHub.

---

# ▶️ Run the Application

### Start Backend

```bash
cd server
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

Then open:

```text
http://localhost:3000
```

---

# 📡 API Documentation

## Start an Interview

```http
POST /api/interview
```

### Request

```json
{
  "sessionId": "abc-123",
  "candidate": {
    "name": "Candidate Name"
  }
}
```

### Response

```json
{
  "reply": "Welcome to your technical interview...",
  "done": false
}
```

---

## Continue the Interview

```http
POST /api/interview
```

### Request

```json
{
  "sessionId": "abc-123",
  "message": "I used SentenceTransformers with ChromaDB..."
}
```

### Response

```json
{
  "reply": "Why did you choose ChromaDB for this use case?",
  "done": false
}
```

---

## Complete Interview

Once the interview is completed, the API returns structured feedback:

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "Strong understanding of RAG concepts...",
    "strengths": [
      "Good understanding of vector databases",
      "Clear explanation of implementation choices"
    ],
    "gaps": [
      "Needs deeper understanding of retrieval optimization"
    ],
    "next": [
      "Study hybrid search",
      "Explore reranking techniques"
    ]
  }
}
```

---

# 🧠 AI Interview Topics

IntervAI is designed around modern AI engineering concepts, including:

```text
RAG
│
├── Embeddings
├── Vector Databases
├── Retrieval
└── Context Generation

Prompt Engineering
│
├── Prompt Design
├── Context Management
└── Structured Outputs

Agentic AI
│
├── AI Agents
├── Tool Usage
├── Planning
└── Decision Making

MCP
│
├── Model Context Protocol
├── Tools
└── External Resources

AI Deployment
│
├── APIs
├── Scalability
├── Latency
└── Production Systems
```

---

# 💡 What Makes IntervAI Different?

| Traditional Interview    | IntervAI                    |
| ------------------------ | --------------------------- |
| Fixed questions          | Adaptive questions          |
| Predefined question flow | AI-driven conversation      |
| Generic evaluation       | Candidate-specific feedback |
| Limited follow-ups       | Dynamic probing             |
| Manual assessment        | AI-generated scorecard      |
| Static experience        | Conversational experience   |

---

# 🎯 Project Objectives

The main objectives of IntervAI are to:

1. Automate technical interview processes.
2. Provide a realistic conversational interview experience.
3. Adapt questions based on candidate responses.
4. Identify technical strengths and knowledge gaps.
5. Provide actionable learning recommendations.
6. Demonstrate practical applications of Agentic AI.
7. Build an extensible architecture for AI-powered assessments.

---

# 🔮 Future Improvements

Potential future enhancements include:

* 🎙️ Voice-based interviews
* 👁️ Video interview support
* 📈 Candidate performance analytics
* ⭐ Numerical scoring and ranking
* 🧑‍💼 Interviewer/admin dashboard
* 📚 Personalized learning paths
* 🧠 Multiple AI model support
* 🔄 Interview history and progress tracking
* 🗄️ Persistent database-backed sessions
* 🛡️ Anti-cheating mechanisms
* 🌐 Multi-language interviews
* 📄 Resume-based interview generation
* 💻 Coding-round integration
* ⏱️ Real-time interview timer

---

# 🤝 Contributing

Contributions are welcome!

### 1. Fork the repository

```bash
git fork https://github.com/Satyam1030/Interv-AI
```

### 2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

### 4. Push the branch

```bash
git push origin feature/amazing-feature
```

### 5. Open a Pull Request

---

# 📜 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

### Satyam1030

Built as an AI-powered technical interview solution for the **31-Day Enterprise AI Cohort**.

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub!

**IntervAI — Build the interviewer, not the interview.**

