"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchCandidates, Candidate } from "@/lib/api";
import { cn, getInitials } from "@/lib/utils";
import { Trophy, Medal, Crown, TrendingUp, Users } from "lucide-react";

function computeScore(c: Candidate): number {
  const missions = c.signals?.missionsCompleted ?? 0;
  const firstTry = c.signals?.missionsFirstTry ?? 0;
  const commits = c.signals?.commitDays ?? 0;
  return Math.round(missions * 2 + firstTry * 3 + commits * 1.5);
}

export default function LeaderboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedCandidate");
    if (stored) {
      const c: Candidate = JSON.parse(stored);
      setCurrentId(c.member.id);
    }
    fetchCandidates()
      .then((cs) => {
        const sorted = [...cs].sort((a, b) => computeScore(b) - computeScore(a));
        setCandidates(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const podium = candidates.slice(0, 3);
  const rest = candidates.slice(3);

  const podiumColors = [
    "from-amber-400 to-yellow-500",
    "from-gray-400 to-slate-500",
    "from-orange-600 to-amber-700",
  ];
  const podiumHeights = ["h-24", "h-16", "h-12"];
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd visually

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ranked by missions, first-try passes & commit streak
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {candidates.length} candidates
        </div>
      </motion.div>

      {/* Podium */}
      {podium.length === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-end justify-center gap-4">
            {podiumOrder.map((rankIdx) => {
              const c = podium[rankIdx];
              if (!c) return null;
              const score = computeScore(c);
              const isFirst = rankIdx === 0;

              return (
                <motion.div
                  key={c.member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + rankIdx * 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  {/* Medal */}
                  <div className="flex flex-col items-center gap-1">
                    {isFirst && (
                      <motion.div
                        animate={{ rotate: [-5, 5, -5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Crown className="w-6 h-6 text-amber-400" />
                      </motion.div>
                    )}
                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-lg",
                        podiumColors[rankIdx]
                      )}
                    >
                      {getInitials(c.member.name)}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-foreground leading-none">
                        {c.member.name.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{score} pts</p>
                    </div>
                  </div>

                  {/* Podium base */}
                  <div
                    className={cn(
                      "w-20 rounded-t-lg bg-gradient-to-b flex items-center justify-center",
                      podiumColors[rankIdx],
                      podiumHeights[rankIdx]
                    )}
                  >
                    <span className="text-white font-bold text-lg">
                      {rankIdx + 1}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Rankings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-border/60">
          <h3 className="text-sm font-semibold text-foreground">All Rankings</h3>
        </div>
        <div className="divide-y divide-border/40">
          {candidates.map((c, i) => {
            const score = computeScore(c);
            const isCurrent = c.member.id === currentId;

            return (
              <motion.div
                key={c.member.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i + 0.3 }}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 transition-colors",
                  isCurrent
                    ? "bg-primary/5 dark:bg-primary/10"
                    : "hover:bg-accent/5"
                )}
              >
                {/* Rank */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    i === 0
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : i === 1
                      ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      : i === 2
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i + 1}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getInitials(c.member.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                    {c.member.name}
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.member.jobRole}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="text-center">
                    <p className="font-semibold text-foreground">
                      {c.signals?.missionsCompleted ?? 0}
                    </p>
                    <p>missions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">
                      {c.signals?.commitDays ?? 0}
                    </p>
                    <p>streak</p>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1.5 text-sm font-bold text-foreground flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  {score}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
