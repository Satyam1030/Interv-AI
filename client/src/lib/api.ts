export interface User {
  id: string;
  name: string;
  email: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  onboardingCompleted: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  curriculumProgress?: CurriculumProgressItem[];
}

export interface CurriculumProgressItem {
  id?: string;
  userId?: string;
  curriculumDay: number;
  topic: string;
  status: "COMPLETED" | "ATTEMPTED" | "SKIPPED" | "NOT_STARTED";
  experienceLevel?: string;
  practicalExperience?: string;
  attempts?: number;
  confidence?: number;
}

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
  score?: number;
  verdict?: "STRONG" | "ADEQUATE" | "WEAK";
  feedback?: string;
}

export interface Feedback {
  score?: number;
  technical?: number;
  reasoning?: number;
  communication?: number;
  problemSolving?: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface QuestionRecord {
  id?: string;
  interviewId?: string;
  sequenceNumber: number;
  curriculumDay: number;
  topic: string;
  question: string;
  candidateAnswer?: string;
  technicalScore?: number;
  reasoningScore?: number;
  communicationScore?: number;
  overallScore: number;
  evaluation?: string;
  strengths?: string;
  weaknesses?: string;
  isFollowUp?: boolean;
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
  interviewId?: string;
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

export interface InterviewRecord {
  id: string;
  userId: string;
  candidateName: string;
  jobRole: string;
  startedAt: string;
  completedAt?: string;
  status: "IN_PROGRESS" | "COMPLETED";
  overallScore: number;
  technicalScore?: number;
  reasoningScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  questionsCount: number;
  correctAnswers?: number;
  partialAnswers?: number;
  incorrectAnswers?: number;
  difficulty: string;
  topicsCovered: number[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  finalFeedback?: Feedback;
}

export interface InterviewDetailReport {
  interview: InterviewRecord;
  messages: {
    id: string;
    sequence: number;
    role: "interviewer" | "candidate";
    content: string;
    topicDay?: number;
    score?: number;
    verdict?: string;
    timestamp: string;
  }[];
  questions?: QuestionRecord[];
}

export interface DashboardStats {
  userName: string;
  jobRole: string;
  readinessScore: number;
  totalInterviews: number;
  avgScore: number;
  bestScore: number;
  completedDaysCount: number;
  attemptedDaysCount: number;
  recentInterviews: InterviewRecord[];
  curriculumProgress: CurriculumProgressItem[];
}

export interface ScoreHistoryPoint {
  id: string;
  label: string;
  date: string;
  score: number;
  technical: number;
  reasoning: number;
  communication: number;
  problemSolving: number;
}

export interface TopicPerformanceItem {
  id?: string;
  topic: string;
  curriculumDay: number;
  attempts: number;
  questionsAnswered: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
  technicalAverage: number;
  reasoningAverage: number;
  communicationAverage: number;
  lastInterviewedAt?: string;
}

export interface PerformanceSummary {
  totalScore?: number;
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
  latestScoreTrend?: number | null;
  avgScoreTrend?: number | null;
  technicalAverage: number;
  reasoningAverage: number;
  communicationAverage: number;
  problemSolvingAverage: number;
  strongestTopic: string;
  weakestTopic: string;
  totalQuestions: number;
}

export interface DimensionPerformanceItem {
  dimension: string;
  score: number;
  key?: string;
}

export interface PerformanceData {
  summary: PerformanceSummary;
  scoreHistory: ScoreHistoryPoint[];
  topicPerformance: TopicPerformanceItem[];
  dimensionPerformance?: DimensionPerformanceItem[];
  recentInterviews: InterviewRecord[];
  recentActivity?: { id: string; title: string; score: number; timestamp: string; topics?: number[] }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  recommendedRevisionDays?: CurriculumProgressItem[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

const BASE = "/api";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  jobRole?: string;
  yearsExperience?: number;
  education?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function fetchCurrentUser(): Promise<{ user: User; curriculumProgress: CurriculumProgressItem[] }> {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch user");
  return data;
}

export async function submitOnboarding(payload: {
  items: CurriculumProgressItem[];
  jobRole?: string;
  yearsExperience?: number;
  education?: string;
}): Promise<{ success: boolean; user: User; curriculumProgress: CurriculumProgressItem[] }> {
  const res = await fetch(`${BASE}/auth/onboarding`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit onboarding");
  return data;
}

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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify({ sessionId, message }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function fetchInterviewHistory(): Promise<InterviewRecord[]> {
  const res = await fetch(`${BASE}/history`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch interview history");
  const data = await res.json();
  return data.interviews || [];
}

export async function fetchInterviewDetail(interviewId: string): Promise<InterviewDetailReport> {
  const res = await fetch(`${BASE}/history/${interviewId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch interview detail");
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${BASE}/history/dashboard/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
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

export async function fetchPerformance(): Promise<PerformanceData> {
  const res = await fetch(`${BASE}/performance`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch performance data");
  return res.json();
}

export async function completeInterview(sessionId: string): Promise<InterviewDetailReport> {
  const res = await fetch(`${BASE}/interviews/${sessionId}/complete`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to complete interview");
  return res.json();
}

export async function fetchInterviewResult(sessionId: string): Promise<InterviewDetailReport> {
  const res = await fetch(`${BASE}/interviews/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch interview result");
  return res.json();
}
