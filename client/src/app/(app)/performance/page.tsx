"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Candidate } from "@/lib/api";
import { PerformanceAreaChart, TopicRadarChart } from "@/components/dashboard/Charts";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Brain, Target, Flame, TrendingUp, Calendar, Award } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

export default function PerformancePage() {
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
  const firstTryRate = completed > 0 ? Math.round((firstTry / completed) * 100) : 0;

  const skills = [
    { name: "RAG & Retrieval", level: 82, color: "from-indigo-500 to-blue-600" },
    { name: "Vector Databases", level: 71, color: "from-cyan-500 to-teal-600" },
    { name: "Prompt Engineering", level: 94, color: "from-violet-500 to-purple-600" },
    { name: "Agentic AI", level: 65, color: "from-amber-500 to-orange-600" },
    { name: "MCP Protocol", level: 78, color: "from-rose-500 to-pink-600" },
    { name: "AI Deployment", level: 83, color: "from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-glow">
            {getInitials(candidate.member.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{candidate.member.name}</h1>
            <p className="text-sm text-muted-foreground">{candidate.member.jobRole}</p>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Completed" value={completed} subtitle="missions" icon={<Target className="w-5 h-5" />} gradient="from-emerald-500 to-teal-600" delay={0} />
        <MetricCard title="First-Try Rate" value={firstTryRate} suffix="%" subtitle="pass rate" icon={<Brain className="w-5 h-5" />} gradient="from-blue-500 to-cyan-600" delay={0.07} />
        <MetricCard title="Streak" value={commitDays} subtitle="commit days" icon={<Flame className="w-5 h-5" />} gradient="from-amber-500 to-orange-600" delay={0.14} />
        <MetricCard title="Avg Score" value={79} suffix="/100" subtitle="interview avg" icon={<TrendingUp className="w-5 h-5" />} gradient="from-violet-500 to-purple-600" delay={0.21} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerformanceAreaChart />
        <TopicRadarChart />
      </div>

      {/* Skill Bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          Skill Proficiency
        </h3>
        <div className="space-y-4">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.06 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">{skill.name}</span>
                <span className="text-xs font-bold text-muted-foreground">{skill.level}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full bg-gradient-to-r", skill.color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.06, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* History Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {[
            { date: "Today", score: 84, topics: "RAG, Prompting", questions: 8 },
            { date: "Yesterday", score: 79, topics: "Vectors, MCP", questions: 8 },
            { date: "3 days ago", score: 91, topics: "Agents, Deploy", questions: 8 },
          ].map((session, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-xl border border-border/60 hover:bg-accent/5 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{session.date}</p>
                <p className="text-xs text-muted-foreground">{session.topics}</p>
              </div>
              <div className="text-xs text-muted-foreground">{session.questions} Qs</div>
              <div className={cn(
                "text-sm font-bold px-2 py-0.5 rounded-lg",
                session.score >= 85
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              )}>
                {session.score}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
