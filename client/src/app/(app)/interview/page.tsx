"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Candidate,
  TurnMessage,
  Feedback,
  fetchCurriculum,
  startInterview,
  sendMessage,
  getApiConfig,
  setGeminiKey,
  CurriculumData,
} from "@/lib/api";
import { AIAvatar } from "@/components/interview/AIAvatar";
import { ChatBubble, ThinkingIndicator } from "@/components/interview/ChatBubble";
import { ProgressPanel } from "@/components/interview/ProgressPanel";
import { ScoreCircle, FeedbackSection } from "@/components/feedback/ScoreCircle";
import { cn, generateSessionId } from "@/lib/utils";
import {
  Send,
  RotateCcw,
  Trophy,
  Download,
  Key,
  Sparkles,
} from "lucide-react";

type AvatarState = "idle" | "thinking" | "speaking" | "evaluating";

export default function InterviewPage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<TurnMessage[]>([]);
  const [input, setInput] = useState("");
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [coveredDays, setCoveredDays] = useState<number[]>([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [inlineKey, setInlineKey] = useState<string>("");
  const [savingKey, setSavingKey] = useState<boolean>(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check API config
  useEffect(() => {
    getApiConfig()
      .then((cfg) => setHasGeminiKey(cfg.hasGeminiKey))
      .catch(console.error);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const stored = localStorage.getItem("selectedCandidate");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const c: Candidate = JSON.parse(stored);
    setCandidate(c);
    const sid = generateSessionId(c.member.id);
    setSessionId(sid);
    fetchCurriculum().then(setCurriculum).catch(console.error);
  }, [router]);

  const beginInterview = useCallback(async () => {
    if (!candidate || !sessionId) return;
    setStarted(true);
    setIsLoading(true);
    setAvatarState("thinking");
    setError(null);
    try {
      const response = await startInterview(sessionId, candidate);
      setAvatarState("speaking");
      setMessages([
        {
          role: "interviewer",
          content: response.reply,
          timestamp: new Date().toISOString(),
        },
      ]);
      setQuestionCount(response.questionCount || 1);
      if (response.coveredDays) setCoveredDays(response.coveredDays);
      if (response.currentTopicDay) setCurrentDay(response.currentTopicDay);
      setTimeout(() => setAvatarState("idle"), 1500);
    } catch (e) {
      setError("Failed to connect to the AI interviewer. Make sure the server is running.");
      setStarted(false);
    } finally {
      setIsLoading(false);
    }
  }, [candidate, sessionId]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || isDone) return;

    const userMsg: TurnMessage = {
      role: "candidate",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setAvatarState("thinking");

    try {
      await new Promise((r) => setTimeout(r, 400));
      setAvatarState("evaluating");
      const response = await sendMessage(sessionId, trimmed);

      await new Promise((r) => setTimeout(r, 300));
      setAvatarState("speaking");

      const aiMsg: TurnMessage = {
        role: "interviewer",
        content: response.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setQuestionCount(response.questionCount || messages.length + 1);
      if (response.coveredDays) setCoveredDays(response.coveredDays);
      if (response.currentTopicDay) setCurrentDay(response.currentTopicDay);

      if (response.done) {
        setIsDone(true);
        setAvatarState("evaluating");
        if (response.feedback) {
          setFeedback(response.feedback);
        }
      } else {
        setTimeout(() => setAvatarState("idle"), 1500);
      }
    } catch (e) {
      setError("Connection error. Please try again.");
      setAvatarState("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setInput("");
    setAvatarState("idle");
    setIsLoading(false);
    setCoveredDays([]);
    setCurrentDay(0);
    setQuestionCount(0);
    setIsDone(false);
    setFeedback(null);
    setStarted(false);
    setError(null);
    if (candidate) {
      const sid = generateSessionId(candidate.member.id);
      setSessionId(sid);
    }
  };

  if (!candidate) return null;

  const totalScore =
    feedback?.score ??
    (feedback
      ? Math.round(
          (feedback.strengths.length / Math.max(feedback.strengths.length + feedback.gaps.length, 1)) * 100
        )
      : 0);

  return (
    <div className="max-w-6xl mx-auto h-full">
      {isDone && feedback ? (
        /* ─── Feedback Screen ─── */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="glass rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-foreground">
                  Interview Complete!
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Here&apos;s your personalized feedback
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(JSON.stringify(feedback, null, 2))
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/80 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Interview
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score */}
            <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
              <ScoreCircle score={totalScore} />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {candidate.member.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {questionCount} questions answered
                </p>
              </div>
            </div>

            {/* Feedback Sections */}
            <div className="lg:col-span-2">
              <FeedbackSection feedback={feedback} summary={feedback.summary} />
            </div>
          </div>
        </motion.div>
      ) : (
        /* ─── Interview Arena ─── */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 h-full">
          {/* Main panel */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            {/* AI + chat area */}
            <div className="glass rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden" style={{ maxHeight: "calc(100vh - 200px)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">
                    AI Interview Session
                  </span>
                </div>
                <div className="flex gap-2">
                  {started && !isDone && (
                    <button
                      onClick={handleRestart}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restart
                    </button>
                  )}
                </div>
              </div>

              {/* Avatar + Messages */}
              <div ref={feedRef} className="flex-1 overflow-y-auto px-5 py-4">
                {!started ? (
                  /* Start screen */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center gap-5 py-8"
                  >
                    <AIAvatar state="idle" />
                    <div className="text-center max-w-md">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
                          hasGeminiKey
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                        )}>
                          <Sparkles className="w-3.5 h-3.5" />
                          {hasGeminiKey ? "Gemini 2.0 Flash Connected" : "Gemini API Key Optional"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground mb-2">
                        Ready to interview{" "}
                        {candidate.member.name.split(" ")[0]}?
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        The AI interviewer will adapt in real-time to your{" "}
                        {candidate.signals?.missionsCompleted ?? 0} completed
                        cohort missions, evaluate your technical depth per turn, and output a full evaluation scorecard.
                      </p>

                      {!hasGeminiKey && (
                        <div className="mb-5 p-3 rounded-xl bg-card border border-border/80 text-left">
                          <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-amber-500" />
                            Add Gemini API Key for Live LLM Responses:
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={inlineKey}
                              onChange={(e) => setInlineKey(e.target.value)}
                              placeholder="Paste Google Gemini API Key..."
                              className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                              disabled={savingKey || !inlineKey.trim()}
                              onClick={async () => {
                                setSavingKey(true);
                                try {
                                  await setGeminiKey(inlineKey.trim());
                                  setHasGeminiKey(true);
                                  setInlineKey("");
                                } catch (e) {
                                  console.error(e);
                                } finally {
                                  setSavingKey(false);
                                }
                              }}
                              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
                            >
                              {savingKey ? "Saving..." : "Save Key"}
                            </button>
                          </div>
                        </div>
                      )}

                      {error && (
                        <p className="text-sm text-rose-500 mb-4 text-center">
                          {error}
                        </p>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={beginInterview}
                        className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-glow"
                      >
                        🎤 Start Interview
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  /* Chat feed */
                  <div className="flex flex-col gap-4">
                    {messages.length > 0 && (
                      <div className="flex justify-center py-2">
                        <AIAvatar state={avatarState} />
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <ChatBubble key={i} message={msg} index={i} />
                    ))}
                    <AnimatePresence>
                      {isLoading && <ThinkingIndicator />}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Input area */}
              {started && !isDone && (
                <div className="px-4 py-4 border-t border-border/60">
                  <div className="flex gap-3 items-end">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                      disabled={isLoading}
                      rows={3}
                      className={cn(
                        "flex-1 resize-none text-sm px-4 py-3 rounded-xl border border-border/80 bg-card text-foreground placeholder:text-muted-foreground/60",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    />
                    <motion.button
                      whileHover={!isLoading && input.trim() ? { scale: 1.05 } : {}}
                      whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className={cn(
                        "p-3 rounded-xl text-white transition-all flex-shrink-0",
                        input.trim() && !isLoading
                          ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow-sm"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 pl-1">
                    Press Enter to send · Shift+Enter for newline
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="hidden lg:block">
            <ProgressPanel
              coveredDays={coveredDays}
              currentDay={currentDay}
              questionCount={questionCount}
              curriculumDays={curriculum?.days ?? []}
            />
          </div>
        </div>
      )}
    </div>
  );
}
