"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchPerformance, PerformanceData } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthContext";
import { PerformanceAreaChart, TopicRadarChart } from "@/components/dashboard/Charts";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  Brain,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Award,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  ChevronRight,
  Zap,
  Mic,
  Activity,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

export default function PerformancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformance()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="glass rounded-2xl p-6 h-28 animate-pulse bg-muted/40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 h-24 animate-pulse bg-muted/30" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 h-64 animate-pulse bg-muted/30" />
          <div className="glass rounded-2xl p-5 h-64 animate-pulse bg-muted/30" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto glass rounded-2xl p-8 text-center space-y-4">
        <p className="text-sm text-rose-500 font-medium">{error || "Could not load performance data."}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const { summary, scoreHistory, topicPerformance, dimensionPerformance, recentInterviews, recentActivity, strengths, weaknesses } = data;

  const candidateName = user?.name || "Candidate";
  const candidateRole = user?.jobRole || "AI Engineer";

  const total = summary.totalInterviews || 0;
  const totalScore = summary.totalScore || 0;
  const avgScore = summary.averageScore || 0;
  const bestScore = summary.bestScore || 0;
  const latestScore = summary.latestScore || 0;
  const latestTrend = summary.latestScoreTrend;

  // Empty State for zero interviews (Section 25)
  if (total === 0) {
    return (
      <div className="max-w-3xl mx-auto glass rounded-2xl p-10 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white mx-auto shadow-lg">
          <Mic className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">No Practice Interviews Yet</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            Complete your first live AI technical interview to begin building your database-backed performance analytics, skill radar, and topic mastery.
          </p>
        </div>
        <Link href="/interview" className="inline-block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-glow"
          >
            <Mic className="w-4 h-4" /> Start First Practice Interview
          </motion.button>
        </Link>
      </div>
    );
  }

  const dimensions = dimensionPerformance && dimensionPerformance.length > 0
    ? dimensionPerformance
    : [
        { dimension: "Technical Depth", score: summary.technicalAverage || avgScore, key: "tech" },
        { dimension: "Reasoning & Logic", score: summary.reasoningAverage || avgScore, key: "reas" },
        { dimension: "Communication", score: summary.communicationAverage || avgScore, key: "comm" },
        { dimension: "Problem Solving", score: summary.problemSolvingAverage || avgScore, key: "prob" },
      ];

  const radarChartData = topicPerformance.map((t) => ({
    topic: t.topic.split(" ")[0],
    score: t.averageScore,
  }));

  const trendText = latestTrend !== null && latestTrend !== undefined
    ? (latestTrend >= 0 ? `+${latestTrend}% from previous interview` : `${latestTrend}% from previous interview`)
    : "Not enough data yet";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-glow-sm">
            {getInitials(candidateName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{candidateName}</h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                Single Source of Truth
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{candidateRole}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card px-4 py-2.5 rounded-2xl border border-border/60">
          <Trophy className="w-6 h-6 text-amber-500" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-foreground leading-none">{avgScore}%</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                {trendText}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Database Average Score</p>
          </div>
        </div>
      </motion.div>

      {/* Top 4 Primary Metric Cards (Sections 2 & 3) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Score"
          value={totalScore}
          subtitle={`cumulative across ${total} interviews`}
          icon={<Activity className="w-5 h-5" />}
          gradient="from-indigo-500 to-blue-600"
          delay={0}
        />
        <MetricCard
          title="Average Score"
          value={avgScore}
          suffix="%"
          subtitle="database average"
          icon={<Brain className="w-5 h-5" />}
          gradient="from-violet-500 to-purple-600"
          delay={0.07}
        />
        <MetricCard
          title="Best Score"
          value={bestScore}
          suffix="%"
          subtitle="personal record"
          icon={<Trophy className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-600"
          delay={0.14}
        />
        <MetricCard
          title="Total Interviews"
          value={total}
          subtitle="completed sessions"
          icon={<Target className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
          delay={0.21}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerformanceAreaChart data={scoreHistory} />
        <TopicRadarChart data={radarChartData.length > 0 ? radarChartData : undefined} />
      </div>

      {/* Strongest & Weakest Topics Summary (Section 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-5 border-l-4 border-l-emerald-500 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Strongest Topic</p>
            <p className="text-base font-bold text-foreground mt-0.5">{summary.strongestTopic}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-5 border-l-4 border-l-amber-500 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Weakest Topic</p>
            <p className="text-base font-bold text-foreground mt-0.5">{summary.weakestTopic}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* Skill Proficiency Breakdown (Database-Backed Topic Performance) (Section 7) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          Skill & Topic Performance (Database-Driven)
        </h3>

        {topicPerformance.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No topic performance records found. Complete a practice interview to populate live topic metrics.
          </div>
        ) : (
          <div className="space-y-4">
            {topicPerformance.map((item, i) => (
              <div key={item.topic} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground font-semibold">
                    Day {item.curriculumDay}: {item.topic}{" "}
                    <span className="text-[10px] text-muted-foreground font-normal">({item.attempts} attempts)</span>
                  </span>
                  <span className="font-bold text-foreground">{item.averageScore}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.averageScore}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Technical Dimensions + Strengths / Weaknesses (Section 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dimensions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Technical Performance Dimensions
          </h3>
          <div className="space-y-3">
            {dimensions.map((dim: { dimension: string; score: number }) => (
              <div key={dim.dimension} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">{dim.dimension}</span>
                  <span className="font-bold text-foreground">{dim.score}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600" style={{ width: `${dim.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            AI Evaluated Strengths & Growth Areas
          </h3>
          <div className="space-y-2 text-xs">
            {strengths.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/50">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </div>
            ))}
            {weaknesses.slice(0, 2).map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Sessions List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Recent Completed Interviews
          </h3>
          <Link href="/history" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            View All History <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {recentInterviews.map((inv) => (
            <Link key={inv.id} href={`/interview/result/${inv.id}`}>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 hover:bg-accent/5 transition-colors group cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {new Date(inv.completedAt || inv.startedAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {inv.questionsCount} questions • {inv.topicsCovered?.length || 1} topics covered
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg", (inv.overallScore || 0) >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400")}>
                    {inv.overallScore || 80}%
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
