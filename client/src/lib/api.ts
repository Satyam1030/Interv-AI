export interface Candidate {
  member: {
    id: string;
    name: string;
    jobRole: string;
    yearsExperience: number;
    education: string;
    status: string;
  };
  missions: {
    day: number;
    title: string;
    passed?: boolean;
    skipped?: boolean;
    attempts?: number;
  }[];
  signals: {
    commitDays: number;
    missionsCompleted: number;
    missionsFirstTry: number;
  };
}

export interface TurnMessage {
  role: "interviewer" | "candidate";
  content: string;
  timestamp?: Date | string;
  topicDay?: number;
}

export interface Feedback {
  score?: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface Session {
  sessionId: string;
  candidate: Candidate;
  turnHistory: TurnMessage[];
  coveredDays: number[];
  questionCount: number;
  currentTopicDay: number;
  isComplete: boolean;
  feedback?: Feedback;
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  isGeminiActive?: boolean;
  coveredDays?: number[];
  currentTopicDay?: number;
  questionCount?: number;
  lastTurnScore?: number;
  lastTurnVerdict?: "STRONG" | "ADEQUATE" | "WEAK";
  feedback?: Feedback;
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface CurriculumData {
  cohort: string;
  modules: { n: number; title: string; days: number[] }[];
  days: CurriculumDay[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

const BASE = "/api";

export async function fetchCandidates(): Promise<Candidate[]> {
  const res = await fetch(`${BASE}/candidates`);
  if (!res.ok) throw new Error("Failed to fetch candidates");
  const data = await res.json();
  return data.candidates;
}

export async function fetchCurriculum(): Promise<CurriculumData> {
  const res = await fetch(`${BASE}/curriculum`);
  if (!res.ok) throw new Error("Failed to fetch curriculum");
  return res.json();
}

export async function startInterview(
  sessionId: string,
  candidate: Candidate
): Promise<InterviewResponse> {
  const res = await fetch(`${BASE}/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, candidate }),
  });
  if (!res.ok) throw new Error("Failed to start interview");
  return res.json();
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<InterviewResponse> {
  const res = await fetch(`${BASE}/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function fetchSession(sessionId: string): Promise<Session | null> {
  try {
    const res = await fetch(`${BASE}/interview/${sessionId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.session;
  } catch {
    return null;
  }
}

export async function runContractTest(): Promise<unknown> {
  const res = await fetch(`${BASE}/test-suite/run`, { method: "POST" });
  return res.json();
}

export async function getApiConfig(): Promise<{ hasGeminiKey: boolean; model: string }> {
  try {
    const res = await fetch(`${BASE}/config`);
    if (!res.ok) return { hasGeminiKey: false, model: "gemini-2.0-flash" };
    return res.json();
  } catch {
    return { hasGeminiKey: false, model: "gemini-2.0-flash" };
  }
}

export async function setGeminiKey(apiKey: string): Promise<{ success: boolean; hasGeminiKey: boolean }> {
  const res = await fetch(`${BASE}/config/key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  if (!res.ok) throw new Error("Failed to update API Key");
  return res.json();
}
