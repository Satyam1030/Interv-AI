"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Candidate } from "@/lib/api";
import { getInitials, cn } from "@/lib/utils";
import {
  User,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Target,
  Flame,
  Brain,
  Star,
  Award,
} from "lucide-react";

const badges = [
  { id: "fast-learner", label: "Fast Learner", desc: "10+ first-try passes", icon: "⚡", color: "from-amber-400 to-yellow-500", unlocked: true },
  { id: "consistent", label: "Consistent", desc: "15+ commit days", icon: "🔥", color: "from-orange-500 to-red-500", unlocked: true },
  { id: "completionist", label: "Completionist", desc: "25+ missions done", icon: "🏆", color: "from-indigo-500 to-violet-600", unlocked: false },
  { id: "ai-expert", label: "AI Expert", desc: "Score 90+ in interview", icon: "🤖", color: "from-cyan-500 to-blue-600", unlocked: false },
  { id: "rag-master", label: "RAG Master", desc: "Complete RAG module", icon: "🔍", color: "from-emerald-500 to-teal-600", unlocked: true },
  { id: "vector-guru", label: "Vector Guru", desc: "Complete Vectors module", icon: "🧮", color: "from-violet-500 to-purple-600", unlocked: false },
];

export default function ProfilePage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedCandidate");
    if (!stored) { router.replace("/login"); return; }
    setCandidate(JSON.parse(stored));
  }, [router]);

  if (!candidate) return null;

  const completed = candidate.signals?.missionsCompleted ?? 0;
  const firstTry = candidate.signals?.missionsFirstTry ?? 0;
  const commitDays = candidate.signals?.commitDays ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-start gap-5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow flex-shrink-0"
          >
            {getInitials(candidate.member.name)}
          </motion.div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{candidate.member.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{candidate.member.jobRole}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <GraduationCap className="w-3.5 h-3.5" />
                {candidate.member.education}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" />
                {candidate.member.yearsExperience} years experience
              </div>
            </div>
            <div className="mt-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium",
                  candidate.member.status === "active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {candidate.member.status}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Missions Done", value: completed, max: 31, icon: <Target className="w-5 h-5" />, color: "text-emerald-500" },
          { label: "First Try", value: firstTry, max: completed, icon: <Brain className="w-5 h-5" />, color: "text-blue-500" },
          { label: "Day Streak", value: commitDays, max: 31, icon: <Flame className="w-5 h-5" />, color: "text-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 text-center">
            <div className={cn("w-8 h-8 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2", stat.color)}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Mission History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Mission History
        </h3>
        <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-[repeat(31,1fr)] gap-1.5">
          {candidate.missions?.map((mission, i) => (
            <motion.div
              key={mission.day}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 + 0.2 }}
              title={`Day ${mission.day}: ${mission.passed ? "Passed" : mission.skipped ? "Skipped" : "Failed"}`}
              className={cn(
                "aspect-square rounded-md",
                mission.passed
                  ? "bg-emerald-500"
                  : mission.skipped
                  ? "bg-muted"
                  : "bg-rose-400/60"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            Passed
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-rose-400/60" />
            Failed
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            Skipped
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          Achievement Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className={cn(
                "p-3.5 rounded-xl border transition-all",
                badge.unlocked
                  ? "border-border/60 bg-card hover:shadow-soft"
                  : "border-border/30 bg-muted/30 opacity-50 grayscale"
              )}
            >
              <div className="text-2xl mb-1.5">{badge.icon}</div>
              <p className="text-xs font-semibold text-foreground">{badge.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
              {badge.unlocked && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Unlocked
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
