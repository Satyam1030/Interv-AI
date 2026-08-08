export interface User {
  id: string;
  name: string;
  email: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  onboardingCompleted: boolean;
  authProvider?: string;
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
  isOpenRouterActive?: boolean;
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

async function safeFetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new Error(`Server Error (${res.status}): ${text.substring(0, 150)}`);
      }
    }
  }
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return safeFetchJson(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
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
  return safeFetchJson(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateProfile(data: { name: string; jobRole: string; yearsExperience: number; education: string }) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${BASE}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update profile");
  }
  return res.json();
}

export async function syncClerkUser(payload: {
  clerkId?: string;
  email: string;
  name?: string;
  imageUrl?: string;
}): Promise<AuthResponse> {
  return safeFetchJson(`${BASE}/auth/clerk-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(): Promise<{ user: User; curriculumProgress: CurriculumProgressItem[] }> {
  return safeFetchJson(`${BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
}

export async function submitOnboarding(payload: {
  items: CurriculumProgressItem[];
  name?: string;
  jobRole?: string;
  yearsExperience?: number;
  education?: string;
}): Promise<{ success: boolean; user: User; curriculumProgress: CurriculumProgressItem[] }> {
  return safeFetchJson(`${BASE}/auth/onboarding`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function fetchCandidates(): Promise<Candidate[]> {
  const data = await safeFetchJson(`${BASE}/candidates`);
  return data.candidates;
}

export async function fetchCurriculum(): Promise<CurriculumData> {
  return safeFetchJson(`${BASE}/curriculum`);
}

export async function startInterview(
  sessionId: string,
  candidate: Candidate
): Promise<InterviewResponse> {
  return safeFetchJson(`${BASE}/interview`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ sessionId, candidate }),
  });
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<InterviewResponse> {
  return safeFetchJson(`${BASE}/interview`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ sessionId, message }),
  });
}

export async function fetchInterviewHistory(): Promise<InterviewRecord[]> {
  const data = await safeFetchJson(`${BASE}/history`, {
    headers: getAuthHeaders(),
  });
  return data.interviews || [];
}

export async function fetchInterviewDetail(interviewId: string): Promise<InterviewDetailReport> {
  return safeFetchJson(`${BASE}/history/${interviewId}`, {
    headers: getAuthHeaders(),
  });
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return safeFetchJson(`${BASE}/history/dashboard/stats`, {
    headers: getAuthHeaders(),
  });
}

export async function runContractTest(): Promise<unknown> {
  return safeFetchJson(`${BASE}/test-suite/run`, { method: "POST" });
}

export async function getApiConfig(): Promise<{ hasOpenRouterKey: boolean; model: string }> {
  try {
    return await safeFetchJson(`${BASE}/config`);
  } catch {
    return { hasOpenRouterKey: false, model: "OpenRouter-2.0-flash" };
  }
}

export async function setOpenRouterKey(apiKey: string): Promise<{ success: boolean; hasOpenRouterKey: boolean }> {
  return safeFetchJson(`${BASE}/config/key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
}

export async function fetchPerformance(): Promise<PerformanceData> {
  return safeFetchJson(`${BASE}/performance`, {
    headers: getAuthHeaders(),
  });
}

export async function completeInterview(sessionId: string): Promise<InterviewDetailReport> {
  return safeFetchJson(`${BASE}/interviews/${sessionId}/complete`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
}

export async function fetchInterviewResult(sessionId: string): Promise<InterviewDetailReport> {
  return safeFetchJson(`${BASE}/interviews/${sessionId}`, {
    headers: getAuthHeaders(),
  });
}
