"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchInterviewHistory, InterviewRecord } from "@/lib/api";
import {
  Trophy,
  Calendar,
  MessageSquare,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewHistory()
      .then(setInterviews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Retrieving your interview history...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h1 className="text-xl font-bold text-foreground">Interview History</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Review your past OpenRouter AI practice sessions, turn evaluations, and feedback reports.
          </p>
        </div>
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-glow hover:opacity-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Start New Interview
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
          {error}
        </div>
      )}

      {interviews.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto text-2xl">
            💬
          </div>
          <h3 className="text-lg font-bold text-foreground">No Interviews Recorded Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t completed any practice interview sessions yet. Complete your first session to view turn-by-turn evaluations and scorecard reports.
          </p>
          <Link
            href="/interview"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            Start Your First Interview <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((inv, index) => {
            const dateStr = inv.startedAt || inv.completedAt
              ? new Date(inv.startedAt || inv.completedAt!).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recent";

            const score = inv.overallScore || inv.finalFeedback?.score || 0;

            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{dateStr}</span>
                    <span>·</span>
                    <span className="capitalize">{inv.jobRole || "AI Engineer"}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    Technical AI Practice Interview
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        inv.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      )}
                    >
                      {inv.status}
                    </span>
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      {inv.questionsCount || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                      Topics: {(inv.topicsCovered || []).map((t) => `Day ${t}`).join(", ") || "General"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end md:self-center">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="text-2xl font-bold text-foreground">{score}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">OpenRouter Score</p>
                  </div>

                  <Link
                    href={`/history/${inv.id}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/80 text-xs font-semibold text-foreground hover:bg-accent/10 transition-colors"
                  >
                    View Report
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
