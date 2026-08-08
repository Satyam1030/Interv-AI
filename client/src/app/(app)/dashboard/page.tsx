"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { fetchCurriculum, CurriculumData, fetchPerformance, PerformanceData } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthContext";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceAreaChart } from "@/components/dashboard/Charts";
import {
  Mic,
  BookOpen,
  Trophy,
  Flame,
  Target,
  Brain,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [perfData, setPerfData] = useState<PerformanceData | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPerformance(), fetchCurriculum()])
      .then(([perf, currData]) => {
        setPerfData(perf);
        setCurriculum(currData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass rounded-2xl p-6 h-32 animate-pulse bg-muted/40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 h-24 animate-pulse bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  const summary = perfData?.summary;
  const recentInterviews = perfData?.recentInterviews || [];
  const scoreHistory = perfData?.scoreHistory || [];
  const topicPerformance = perfData?.topicPerformance || [];
  const recommendedRevisionDays = perfData?.recommendedRevisionDays || [];

  const userName = user?.name || "Candidate";
  const totalInterviews = summary?.totalInterviews ?? 0;
  const totalScore = summary?.totalScore ?? 0;
  const avgScore = summary?.averageScore ?? 0;
  const bestScore = summary?.bestScore ?? 0;
  const latestScore = summary?.latestScore ?? 0;

  // Calculate readiness score strictly from database progress & average
  const completedDaysCount = curriculum?.days.filter((d) =>
    topicPerformance.some((tp) => tp.curriculumDay === d.day && tp.averageScore >= 75)
  ).length || 0;

  const readinessScore = totalInterviews > 0
    ? Math.min(100, Math.round((completedDaysCount * 2.0) + (avgScore * 0.4) + (totalInterviews * 1.5)))
    : Math.min(100, Math.round(completedDaysCount * 3.0) || 0);

  const latestInterview = recentInterviews[0];
  const weakestItem = topicPerformance.length > 0
    ? [...topicPerformance].sort((a, b) => a.averageScore - b.averageScore)[0]
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header (Section 10) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">
              AI Cohort — Single Source of Truth
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, <span className="text-gradient">{userName.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s how your AI interview preparation is progressing across{" "}
            <strong className="text-foreground">{totalInterviews} completed interviews</strong>.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Link href="/interview">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-glow-sm"
              >
                <Mic className="w-4 h-4" />
                Start Practice Interview
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
            <Link href="/performance">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 text-sm font-medium text-foreground hover:bg-accent/5 transition-colors">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                View Analytics
              </button>
            </Link>
          </div>
        </div>

        {/* Readiness display */}
        <div className="hidden sm:flex flex-col items-center gap-1 text-center bg-card px-5 py-3 rounded-2xl border border-border/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-1">{readinessScore}%</p>
          <p className="text-[11px] text-muted-foreground font-medium">AI Readiness Score</p>
        </div>
      </motion.div>

      {/* Metrics Grid (Identical to Performance Page) (Section 11) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Score"
          value={totalScore}
          subtitle={`cumulative across ${totalInterviews} sessions`}
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
          delay={0.08}
        />
        <MetricCard
          title="Best Score"
          value={bestScore}
          suffix="%"
          subtitle="personal record"
          icon={<Trophy className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-600"
          delay={0.16}
        />
        <MetricCard
          title="Total Interviews"
          value={totalInterviews}
          subtitle="completed sessions"
          icon={<Target className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
          delay={0.24}
        />
      </div>

      {/* Charts & Latest Interview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Compact Performance Progression Chart (Section 13) */}
        <div className="lg:col-span-2">
          <PerformanceAreaChart data={scoreHistory} />
        </div>

        {/* Latest Completed Interview Card (Section 12) */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Latest Completed Interview
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {latestInterview ? (
              <div className="space-y-3 mt-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    {latestInterview.jobRole || "AI Engineering"} Technical
                  </h3>
                  <span className="text-xl font-extrabold text-indigo-500">
                    {latestInterview.overallScore || 80}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed on {new Date(latestInterview.completedAt || latestInterview.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(latestInterview.topicsCovered || [7, 12, 22]).slice(0, 3).map((dayNum) => (
                    <span
                      key={dayNum}
                      className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground"
                    >
                      Day {dayNum} Topic
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No completed interviews yet. Click Start Interview to take your first session!
              </div>
            )}
          </div>

          {latestInterview && (
            <Link href={`/interview/result/${latestInterview.id}`} className="mt-4">
              <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border/80 text-xs font-semibold text-foreground hover:bg-accent/5 transition-colors">
                View Detailed Result <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Personalized Recommendations + Curriculum Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Personalized Recommendations Card (Section 16) */}
        <div className="glass rounded-2xl p-5 space-y-3 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold text-foreground">Recommended Next Step</h3>
          </div>

          {weakestItem ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Review Day {weakestItem.curriculumDay}: {weakestItem.topic}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your recent interviews show this is currently one of your weakest areas ({weakestItem.averageScore}% average score).
              </p>
              <Link href="/interview" className="inline-block pt-1">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors">
                  <Mic className="w-3.5 h-3.5" /> Practice Weak Topics
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Explore Curriculum Topics
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Start with Day 1 Prompt Engineering or Day 7 Vector Databases to establish your benchmark.
              </p>
              <Link href="/curriculum" className="inline-block pt-1">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-3.5 h-3.5" /> View Curriculum
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Compact Curriculum Progress (Section 18) */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">AI Cohort Progress</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedDaysCount} / 31 Days Completed
              </p>
            </div>
            <Link href="/curriculum">
              <button className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-semibold">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((completedDaysCount / 31) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-card border border-border/60">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Strongest</span>
              <span className="font-bold text-foreground text-xs">{summary?.strongestTopic || "Not enough data yet"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/60">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Needs Review</span>
              <span className="font-bold text-foreground text-xs">{summary?.weakestTopic || "Not enough data yet"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
