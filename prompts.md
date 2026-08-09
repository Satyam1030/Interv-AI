# ⚡ IntervAI — AI Usage & Prompt Log

> **Build the interviewer, not the interview.**
>
> A decorative record of the prompts used with **Google Antigravity** throughout the development of **IntervAI — The AI Technical Interviewer Agent**.

---

## 🧠 Project Overview

**IntervAI** is an autonomous AI technical interviewer designed for the **31-Day Enterprise AI Cohort**. It conducts realistic, multi-turn technical interviews tailored to a candidate's learning journey and assesses areas such as **RAG, Vector Databases, Prompt Engineering, Agentic AI, MCP, and AI Deployment**.

### ✨ Core Capabilities

- 🎯 Candidate selection and profile overview
- 🤖 Adaptive multi-turn AI interviews
- 🔄 Context-aware follow-up questions
- 🧪 Technical probing and deeper questioning
- 📊 Structured candidate scorecards
- 📝 Actionable performance feedback
- 🧩 Interview API and session management
- 💎 Modern glassmorphic interface

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | React 18, Vite, Lucide Icons, Custom CSS |
| ⚙️ Backend | Node.js, Express, Mongoose |
| 🧠 AI Engine | Google Gemini API |
| 💾 Data Foundation | 31-Day AI Cohort Curriculum & Candidate Profiles |
| 🧑‍💻 AI Development Tool | Google Antigravity |

---

# 🚀 AI Development Prompt Log

This document records the major prompts used with **Google Antigravity** during different stages of development.

---

# 🟣 Phase 1 — Project Ideation & Requirement Analysis

### 01 · Project Concept

> I want to build an autonomous AI technical interviewer for candidates participating in a 31-Day Enterprise AI Cohort. The system should conduct realistic technical interviews instead of using a fixed questionnaire. It should evaluate topics such as RAG, vector databases, prompt engineering, agentic AI, MCP, and AI deployment. Suggest a complete project concept, user flow, and core features.

**🎯 Purpose:** Define the overall project concept and requirements.

---

### 02 · Feature Identification

> Analyze the proposed AI technical interviewer project and identify the essential features required for a strong working prototype. Include candidate selection, candidate profiles, adaptive multi-turn interviews, contextual follow-up questions, technical probing, evaluation, scorecards, and interview completion.

**🎯 Purpose:** Convert the initial idea into implementable features.

---

### 03 · User Flow

> Design the complete user journey for an autonomous technical interview platform. Start from candidate selection and continue through interview initialization, question generation, candidate responses, adaptive follow-up questions, interview completion, evaluation, and final feedback.

**🎯 Purpose:** Establish the application workflow.

---

### 04 · Technical Requirements

> Convert this AI interviewer concept into technical requirements. Identify frontend requirements, backend requirements, AI integration requirements, session management, API endpoints, candidate data requirements, interview state management, and evaluation output structure.

**🎯 Purpose:** Translate product requirements into development requirements.

---

# 🔵 Phase 2 — Architecture & Technology Selection

### 05 · Technology Stack

> Suggest a practical technology stack for building this autonomous AI interviewer as a web application. Prefer React and Vite for the frontend and Node.js with Express for the backend. Include an appropriate database/session strategy and Google Gemini API integration.

**🎯 Purpose:** Establish the project's technology stack.

---

### 06 · System Architecture

> Design the system architecture for IntervAI. Explain how the React frontend, Express backend, Gemini API, candidate profiles, interview sessions, and evaluation system should communicate with each other. Keep the architecture simple enough for a hackathon implementation.

**🎯 Purpose:** Design the overall application architecture.

---

### 07 · Backend Architecture

> Create a backend architecture for an Express.js application that exposes an interview API. The backend should manage candidate information, interview sessions, conversation history, Gemini API communication, interview completion, and structured feedback.

**🎯 Purpose:** Plan the backend implementation.

---

### 08 · API Contract

> Design the API contract for POST /api/interview. It should support starting an interview, continuing an existing conversation, and returning a final evaluation when the interview is complete. Define the request and response JSON structures.

**🎯 Purpose:** Define the communication contract between frontend and backend.

---

# 🟢 Phase 3 — AI Interviewer & Prompt Engineering

### 09 · Interviewer Persona

> Create a system prompt for an AI technical interviewer. The interviewer should behave like an experienced technical interviewer, ask one question at a time, analyze candidate responses, avoid unnecessary repetition, and maintain a professional but conversational tone.

**🎯 Purpose:** Establish the AI interviewer's personality and behavior.

---

### 10 · Curriculum-Aware Interviewing

> Modify the interviewer prompt so that the AI conducts interviews based on the candidate's learning journey and curriculum. The interviewer should assess topics including RAG, vector databases, prompt engineering, agentic AI, MCP, and AI deployment.

**🎯 Purpose:** Make interviews relevant to the candidate's learning path.

---

### 11 · Adaptive Question Generation

> Implement an adaptive interview strategy where the next question depends on the candidate's previous answer. If the candidate demonstrates strong understanding, increase the difficulty. If the answer is incomplete, ask a clarifying or foundational follow-up question.

**🎯 Purpose:** Make the interview dynamic rather than a fixed sequence.

---

### 12 · Technical Probing

> Instruct the AI interviewer to probe candidates about implementation decisions, edge cases, latency, scalability, reliability, alternatives, and system trade-offs whenever relevant to their answer. Avoid asking unrelated questions.

**🎯 Purpose:** Improve the depth of technical assessment.

---

### 13 · Multi-Turn Interview

> Configure the AI interviewer to conduct a minimum of 8 meaningful conversation turns while covering at least 4 curriculum days. Maintain context from previous answers and ensure that each new question builds logically on the interview conversation.

**🎯 Purpose:** Implement the required multi-turn interview behavior.

---

### 14 · Prevent Repetition

> Add logic to the interviewer prompt that prevents the AI from repeatedly asking the same question. Before generating the next question, consider the previous questions and candidate responses and select a new but relevant assessment area.

**🎯 Purpose:** Improve interview quality and conversational consistency.

---

# 🟠 Phase 4 — Candidate Evaluation

### 15 · Response Analysis

> Analyze each candidate response for technical correctness, depth of understanding, reasoning quality, use of appropriate terminology, implementation awareness, and ability to explain trade-offs. Use this analysis to determine the next appropriate interview question.

**🎯 Purpose:** Connect candidate responses with adaptive questioning.

---

### 16 · Final Evaluation

> Create a final candidate evaluation system for the AI interviewer. After the required interview turns are completed, generate a concise summary of the candidate's overall performance and identify their strongest and weakest technical areas.

**🎯 Purpose:** Generate the final assessment.

---

### 17 · Structured Scorecard

> Return the final interview evaluation using exactly these fields: summary, strengths, gaps, and next. The summary should describe overall performance, strengths should contain demonstrated technical capabilities, gaps should identify areas requiring improvement, and next should recommend learning priorities.

**🎯 Purpose:** Produce a consistent machine-readable scorecard.

---

### 18 · Actionable Feedback

> Make the final candidate feedback actionable. Instead of generic statements such as "improve your AI knowledge", identify specific technical concepts or skills that the candidate should study based on weaknesses demonstrated during the interview.

**🎯 Purpose:** Improve the usefulness of candidate feedback.

---

# 🟡 Phase 5 — Frontend Development

### 19 · Candidate Portal

> Build a modern candidate portal for IntervAI using React and Vite. Include candidate selection, candidate profile information, learning signals, and missed or skipped mission highlights. Create a clean interface suitable for an AI interview platform.

**🎯 Purpose:** Develop the candidate-facing interface.

---

### 20 · Interview Interface

> Create the main interview interface for IntervAI. Display the AI interviewer's messages and candidate responses in a conversational layout. Include a text input, send button, interview progress information, and appropriate loading states.

**🎯 Purpose:** Build the core interview UI.

---

### 21 · Visual Design

> Design IntervAI using a modern glassmorphic visual style. Use a professional AI-product aesthetic, clean typography, subtle gradients, cards, appropriate spacing, and responsive layouts. Avoid making the interface unnecessarily complex.

**🎯 Purpose:** Establish the visual design system.

---

### 22 · Responsive UI

> Make the entire IntervAI frontend responsive for desktop, tablet, and mobile screens. Ensure that the candidate selection interface, interview conversation, buttons, cards, and feedback sections remain usable at different screen sizes.

**🎯 Purpose:** Improve usability across devices.

---

# 🔴 Phase 6 — Backend & Gemini Integration

### 23 · Gemini API Integration

> Integrate the Google Gemini API into the Node.js/Express backend. The backend should receive candidate information and conversation messages, send the appropriate context to Gemini, and return the generated interviewer response to the frontend.

**🎯 Purpose:** Connect the AI engine to the application.

---

### 24 · Session Management

> Implement interview session management using a unique sessionId. Store the conversation context so that every Gemini request has access to the relevant previous questions and candidate responses. Include a high-performance in-memory fallback if the database is unavailable.

**🎯 Purpose:** Maintain conversation continuity.

---

### 25 · Error Handling

> Add robust error handling to the interview API. Handle missing candidate information, invalid requests, unavailable Gemini responses, API failures, expired sessions, and malformed AI responses without crashing the application.

**🎯 Purpose:** Improve application reliability.

---

# 🟤 Phase 7 — Testing & Debugging

### 26 · API Testing

> Create test scenarios for POST /api/interview covering interview initialization, normal conversation turns, invalid requests, multiple turns, and interview completion. Verify that the API returns the expected reply, done status, and feedback structure.

**🎯 Purpose:** Validate the API implementation.

---

### 27 · Interview Flow Testing

> Test the complete IntervAI interview flow from candidate selection through interview completion. Identify problems with session persistence, repeated questions, incorrect interview termination, missing context, and invalid evaluation responses.

**🎯 Purpose:** Identify end-to-end issues.

---

### 28 · Debugging

> Review the current IntervAI implementation and identify potential bugs or inconsistencies between the frontend, Express backend, Gemini API integration, session handling, and interview state. Suggest fixes without changing features that already work correctly.

**🎯 Purpose:** Assist with debugging and stabilization.

---

### 29 · Edge Case Testing

> Identify edge cases for the autonomous technical interviewer, including very short answers, extremely long answers, incorrect technical answers, candidate skipping a question, API timeout, Gemini failure, repeated responses, empty messages, and interview termination.

**🎯 Purpose:** Improve robustness.

---

# ⚙️ Phase 8 — Final Refinement & Documentation

### 30 · Performance Improvements

> Review the IntervAI application for unnecessary API calls, inefficient state updates, excessive prompt context, and frontend performance issues. Suggest practical optimizations that maintain the quality of the AI interview.

**🎯 Purpose:** Improve application performance.

---

### 31 · Code Quality

> Review the project structure and identify opportunities to improve code readability, maintainability, modularity, naming conventions, error handling, and separation of frontend, backend, and AI logic.

**🎯 Purpose:** Improve code quality.

---

### 32 · README Generation

> Generate a professional README for IntervAI explaining the project concept, key features, technology stack, installation instructions, environment variables, application startup commands, API contract, and interview completion response.

**🎯 Purpose:** Prepare project documentation.

---

### 33 · Final Project Review

> Perform a final review of the IntervAI project against its intended requirements. Check the adaptive multi-turn interview, dynamic probing, structured scorecard, candidate portal, Gemini integration, API contract, frontend usability, error handling, and overall project completeness. Identify any remaining issues that should be fixed before submission.

**🎯 Purpose:** Perform final quality assurance before submission.

---

# 📊 Prompt Usage Summary

| Development Phase | Prompts | Focus |
|---|:---:|---|
| 🟣 Ideation & Requirements | 01–04 | Concept, features, workflow, requirements |
| 🔵 Architecture | 05–08 | Stack, architecture, backend, API |
| 🟢 AI Interviewer | 09–14 | Persona, adaptive questioning, probing |
| 🟠 Evaluation | 15–18 | Analysis, scorecards, feedback |
| 🟡 Frontend | 19–22 | Portal, interview UI, design, responsiveness |
| 🔴 Backend & AI | 23–25 | Gemini, sessions, error handling |
| 🟤 Testing | 26–29 | API, flow, debugging, edge cases |
| ⚙️ Final Refinement | 30–33 | Optimization, quality, docs, QA |

### 🔢 Total Documented Prompts: **33**

---

# 🤖 AI Contribution Breakdown

### 💡 Ideation
- Project concept generation
- Feature brainstorming
- User-flow planning
- Requirement decomposition

### 🏗️ Architecture
- Technology selection
- System architecture
- Backend structure
- API contract design

### 🧠 AI Intelligence
- Interviewer persona
- Curriculum-aware questioning
- Adaptive questioning
- Technical probing
- Candidate response analysis
- Evaluation generation

### 🎨 Frontend
- Candidate portal
- Interview interface
- Glassmorphic UI
- Responsive design

### ⚙️ Backend
- Gemini API integration
- Session management
- Error handling
- API behavior

### 🧪 Quality Assurance
- Test-case generation
- Edge-case identification
- Debugging assistance
- End-to-end review

### 📚 Documentation
- README generation
- Project explanation
- Final quality review

---

# 🔍 AI-Generated vs Human-Controlled Work

| Area | AI Assistance | Human Responsibility |
|---|:---:|:---:|
| 💡 Ideation | ✅ | ✅ Final concept |
| 📋 Requirements | ✅ | ✅ Final requirements |
| 🏗️ Architecture | ✅ | ✅ Final architecture |
| 🧠 Prompt Engineering | ✅ | ✅ Prompt selection/refinement |
| 💻 Code Development | ✅ | ✅ Review & integration |
| 🎨 UI/UX | ✅ | ✅ Final design decisions |
| 🔌 API Integration | ✅ | ✅ Implementation & testing |
| 🧪 Testing | ✅ | ✅ Test execution |
| 🐛 Debugging | ✅ | ✅ Final fixes |
| 📖 Documentation | ✅ | ✅ Final review |
| 🚀 Deployment | Assistance | Final execution |

---

# 🛡️ AI Validation Process

AI-generated suggestions were **not accepted blindly**. The development process followed these validation steps:

1. 🔎 Review AI-generated suggestions.
2. 🧩 Compare them against project requirements.
3. 💻 Implement appropriate changes.
4. 🧪 Test the implementation.
5. 🔄 Iterate when the output did not meet requirements.
6. ✅ Validate API responses and interview behavior.
7. 👨‍💻 Manually review final code and UI.
8. 🚀 Integrate only validated changes into the final project.

---

# 📜 AI Usage Declaration

> **Declaration**
>
> Google Antigravity was used as an AI-assisted development environment throughout the development lifecycle of **IntervAI**. Prompts were used for ideation, requirement analysis, architecture planning, implementation guidance, prompt engineering, UI development, Gemini API integration, debugging, testing, optimization, and documentation.
>
> The **Google Gemini API** was additionally integrated into the final application as the AI engine responsible for conducting autonomous technical interviews, adaptive questioning, dynamic probing, and structured candidate evaluation.
>
> AI-generated suggestions and code were reviewed, modified where necessary, tested, and validated before being incorporated into the project. The development team remains responsible for the final implementation, functionality, testing, accuracy, and presentation of IntervAI.

---

<div align="center">

### ⚡ IntervAI

**Build the interviewer, not the interview.**

*AI-assisted development powered by Google Antigravity*  
*AI interview intelligence powered by Google Gemini*

---

**33 Prompts • 8 Development Phases • 1 Autonomous Interviewer**

</div>
