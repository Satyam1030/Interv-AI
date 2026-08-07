"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchCandidates, Candidate } from "@/lib/api";
import { cn, getInitials } from "@/lib/utils";
import { History, Clock, MessageSquare, TrendingUp } from "lucide-react";

// In a real app this would come from the DB; for now we simulate it
const mockSessions = [
  {
    id: "s1",
    date: new Date(Date.now() - 1000 * 60 * 30),
    questions: 8,
    score: 84,
    topics: ["RAG", "Prompting"],
    duration: "18 min",
  },
  {
    id: "s2",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    questions: 8,
    score: 79,
    topics: ["Vectors", "MCP"],
    duration: "22 min",
  },
  {
    id: "s3",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    questions: 8,
    score: 91,
    topics: ["Agents", "Deploy"],
    duration: "15 min",
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedCandidate");
    if (!stored) { router.replace("/login"); return; }
    setCandidate(JSON.parse(stored));
  }, [router]);

  if (!candidate) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5"
      >
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Interview History
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {candidate.member.name}'s past sessions
        </p>
      </motion.div>

      {mockSessions.map((session, i) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 + 0.1 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Clock className="w-3.5 h-3.5" />
                {session.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <span>·</span>
                {session.duration}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {session.topics.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div
              className={cn(
                "text-2xl font-bold px-3 py-1.5 rounded-xl",
                session.score >= 85
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : session.score >= 70
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}
            >
              {session.score}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-3.5 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {session.questions} questions
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Score: {session.score}/100
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
