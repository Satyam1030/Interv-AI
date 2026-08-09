# Prompts Used to Create IntervAI

The following are the core prompts used to generate the frontend and backend of the IntervAI application.

## 1. Project Initialization & Structure

**Prompt:**
> "Create a full-stack project structure for an AI technical interviewer app called 'IntervAI'. Use a React + Vite frontend (in a `client` folder) and a Node.js + Express backend (in a `server` folder). I want to use modern CSS (glassmorphism UI) for the frontend and integrate with the Google Gemini API on the backend. Provide the initialization commands and basic `package.json` for both."

## 2. Backend Server & Gemini Integration

**Prompt:**
> "Write the Express backend code (`server/index.js`). It needs to have a `POST /api/interview` endpoint. The backend should maintain conversation state (using an in-memory session or MongoDB) and use the Google Gemini API (`@google/generative-ai`) to conduct a multi-turn technical interview based on a candidate's profile. The response should be in JSON format: `{ \"reply\": \"...\", \"done\": false }`."

**Prompt:**
> "Update the Gemini API prompt in the backend to ensure the AI acts as a strict technical interviewer. It should ask one question at a time, probe for edge cases, and challenge the candidate's implementation choices regarding RAG, Vector Databases, and Agentic AI. If the interview has gone on for at least 8 turns, the AI should return `{ \"done\": true }` and provide a structured scorecard with `summary`, `strengths`, `gaps`, and `next`."

## 3. Frontend UI - Glassmorphic Design

**Prompt:**
> "Create a glassmorphic design system using CSS variables (`client/src/index.css`). Include styles for a dark-themed UI with semi-transparent backgrounds, blur effects (`backdrop-filter: blur()`), and subtle borders. I want it to feel premium and futuristic."

## 4. Candidate Selection & Login Screen

**Prompt:**
> "Build a Candidate Portal login page (`client/src/app/login/page.tsx`). It should feature a slide-down candidate selection bar showcasing candidate profiles, learning signals, and their missed/skipped hackathon missions. Use Lucide React for icons. The user should be able to select a candidate and start the interview."

## 5. Chat Interface

**Prompt:**
> "Create the main interview chat interface. It needs to display the message history (differentiating between the candidate and the AI interviewer). Add a text input area that allows the candidate to type their response and send it to the backend `POST /api/interview` endpoint. Handle loading states gracefully while waiting for Gemini to respond."

## 6. Scorecard & Feedback View

**Prompt:**
> "Once the interview is marked as `done: true`, display a final performance scorecard component. This component should visually parse and present the structured feedback from the backend, clearly separating the 'Summary', 'Strengths', 'Knowledge Gaps', and 'Next Steps'."
