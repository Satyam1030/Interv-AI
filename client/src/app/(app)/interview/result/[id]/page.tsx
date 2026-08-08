"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchInterviewResult, InterviewDetailReport, QuestionRecord } from "@/lib/api";
import { ScoreCircle, FeedbackSection } from "@/components/feedback/ScoreCircle";
import {
  Trophy,
  BarChart3,
  RotateCcw,
  LayoutDashboard,
  Brain,
  MessageSquare,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InterviewResultPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [report, setReport] = useState<InterviewDetailReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) return;
    fetchInterviewResult(interviewId)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Retrieving final evaluation scorecard from database...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto glass rounded-2xl p-8 text-center space-y-4">
        <p className="text-sm text-rose-500 font-medium">{error || "Interview result not found."}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { interview, messages, questions } = report;
  const fb = interview.finalFeedback;

  const overall = interview.overallScore || fb?.score || 80;
  const tech = interview.technicalScore || fb?.technical || overall;
  const reas = interview.reasoningScore || fb?.reasoning || overall;
  const comm = interview.communicationScore || fb?.communication || overall;
  const prob = interview.problemSolvingScore || fb?.problemSolving || overall;

  const dimensions = [
    { label: "Technical Depth", score: tech, weight: "40%", color: "from-indigo-500 to-blue-600" },
    { label: "Reasoning & Logic", score: reas, weight: "25%", color: "from-violet-500 to-purple-600" },
    { label: "Communication", score: comm, weight: "15%", color: "from-emerald-500 to-teal-600" },
    { label: "Problem Solving", score: prob, weight: "20%", color: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 bg-gradient-to-r from-indigo-50/60 to-violet-50/60 dark:from-indigo-950/30 dark:to-violet-950/30 text-center space-y-2"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Interview Successfully Completed & Saved
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Interview Complete
        </h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Candidate: <span className="font-semibold text-foreground">{interview.candidateName}</span> ({interview.jobRole})
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link href="/performance">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-glow-sm"
            >
              <BarChart3 className="w-4 h-4" /> View Performance
            </motion.button>
          </Link>
          <Link href="/interview">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 text-xs font-bold text-foreground hover:bg-accent/5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Retry Interview
            </motion.button>
          </Link>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Score Overview + Technical Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4"
        >
          <ScoreCircle score={overall} />
          <div>
            <p className="text-xs text-muted-foreground">Weighted Overall Score</p>
            <p className="text-xs font-semibold text-foreground mt-1">
              {interview.questionsCount || messages.length} Questions Assessed
            </p>
          </div>
        </motion.div>

        {/* Technical Dimensions Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 glass rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            Technical Dimensions Breakdown
          </h2>

          <div className="space-y-3.5">
            {dimensions.map((dim, i) => (
              <div key={dim.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">
                    {dim.label} <span className="text-[10px] text-muted-foreground">({dim.weight})</span>
                  </span>
                  <span className="font-bold text-foreground">{dim.score}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", dim.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Topics Covered & Question Breakdown */}
      {questions && questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Topic Performance Breakdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {questions.map((q: QuestionRecord, i: number) => (
              <div
                key={q.id || i}
                className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-500">Day {q.curriculumDay}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full font-bold text-[10px]",
                      q.overallScore >= 85
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : q.overallScore >= 70
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}
                  >
                    {q.overallScore}%
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground line-clamp-1">{q.topic}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{q.evaluation || q.question}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gemini Executive Feedback */}
      {fb && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FeedbackSection feedback={fb} summary={fb.summary} />
        </motion.div>
      )}
    </div>
  );
}
