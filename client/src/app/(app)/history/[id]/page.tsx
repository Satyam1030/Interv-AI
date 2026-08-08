"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchInterviewDetail, InterviewDetailReport } from "@/lib/api";
import { ScoreCircle, FeedbackSection } from "@/components/feedback/ScoreCircle";
import {
  ArrowLeft,
  Calendar,
  Bot,
  User,
  Sparkles,
  Trophy,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [report, setReport] = useState<InterviewDetailReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) return;
    fetchInterviewDetail(interviewId)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Loading detailed Gemini evaluation report...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto glass rounded-2xl p-8 text-center space-y-4">
        <p className="text-sm text-rose-500 font-medium">{error || "Report not found."}</p>
        <Link
          href="/history"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
      </div>
    );
  }

  const { interview, messages } = report;
  const feedback = interview.finalFeedback;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Interview History
        </Link>
        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify(report, null, 2))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export JSON Report
        </button>
      </div>

      {/* Overview Card */}
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {new Date(interview.startedAt || (interview as any).createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Interview Evaluation Report
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Candidate: <span className="font-semibold text-foreground">{interview.candidateName}</span> ({interview.jobRole})
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card px-4 py-2.5 rounded-2xl border border-border/60">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-xl font-bold text-foreground leading-none">
              {interview.overallScore || feedback?.score || 80}%
            </p>
            <p className="text-[10px] text-muted-foreground">Overall Gemini Score</p>
          </div>
        </div>
      </div>

      {/* Score & Gemini Feedback Sections */}
      {feedback && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
            <ScoreCircle score={interview.overallScore || feedback.score || 80} />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{interview.candidateName}</p>
              <p className="text-xs text-muted-foreground">{interview.questionsCount} questions evaluated</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <FeedbackSection feedback={feedback} summary={feedback.summary} />
          </div>
        </div>
      )}

      {/* Full Q&A Transcript */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Complete Interview Transcript & Evaluation
          </h2>
          <span className="text-xs text-muted-foreground">{messages.length} exchanges</span>
        </div>

        <div className="space-y-4 pt-2">
          {messages.map((msg, i) => {
            const isAI = msg.role === "interviewer";
            return (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 max-w-[95%]",
                  isAI ? "self-start flex-row" : "self-end flex-row-reverse ml-auto"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1",
                    isAI
                      ? "bg-gradient-to-br from-indigo-500 to-violet-600"
                      : "bg-gradient-to-br from-emerald-500 to-teal-600"
                  )}
                >
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm flex-1",
                    isAI
                      ? "bg-card dark:bg-muted border border-border/60 text-foreground rounded-tl-sm"
                      : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm"
                  )}
                >
                  {msg.content}

                  {!isAI && msg.verdict && msg.score !== undefined && (
                    <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                      <span className="text-white/80 font-medium">Turn Score:</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full font-bold text-[10px]",
                          msg.verdict === "STRONG"
                            ? "bg-emerald-400/30 text-emerald-100"
                            : msg.verdict === "ADEQUATE"
                            ? "bg-amber-400/30 text-amber-100"
                            : "bg-rose-400/30 text-rose-100"
                        )}
                      >
                        {msg.verdict} ({msg.score}/100)
                      </span>
                    </div>
                  )}

                  {msg.topicDay && isAI && (
                    <div className="mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground flex justify-between items-center">
                      <span>Day {msg.topicDay} topic</span>
                      <span className="text-[10px] text-emerald-500 font-semibold">Gemini AI</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
