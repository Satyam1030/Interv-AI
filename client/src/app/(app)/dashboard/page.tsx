"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Candidate, fetchCurriculum, CurriculumData } from "@/lib/api";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceAreaChart, TopicRadarChart } from "@/components/dashboard/Charts";
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
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedCandidate");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setCandidate(JSON.parse(stored));
    fetchCurriculum().then(setCurriculum).catch(console.error);
  }, [router]);

  if (!candidate) return null;

  const missions = candidate.missions ?? [];
  const completed = missions.filter((m) => m.passed).length;
  const firstTry = candidate.signals?.missionsFirstTry ?? 0;
  const commitDays = candidate.signals?.commitDays ?? 0;

  const recentDays = curriculum?.days.slice(0, 4) ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 flex items-start justify-between bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">
              AI Cohort — 31-Day Program
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()},{" "}
            <span className="text-gradient">{candidate.member.name.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ve completed{" "}
            <strong className="text-foreground">{completed} missions</strong>. Ready
            to prove it in an interview?
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Link href="/interview">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-glow-sm"
              >
                <Mic className="w-4 h-4" />
                Start Interview
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
            <Link href="/curriculum">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 text-sm font-medium text-foreground hover:bg-accent/5 transition-colors">
                <BookOpen className="w-4 h-4" />
                View Curriculum
              </button>
            </Link>
          </div>
        </div>
        {/* Streak display */}
        <div className="hidden sm:flex flex-col items-center gap-1 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{commitDays}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Missions Completed"
          value={completed}
          suffix=""
          subtitle="of 31 days"
          icon={<Target className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
          trend={12}
          delay={0}
        />
        <MetricCard
          title="First-Try Passes"
          value={firstTry}
          subtitle="missions"
          icon={<Brain className="w-5 h-5" />}
          gradient="from-blue-500 to-cyan-600"
          trend={5}
          delay={0.08}
        />
        <MetricCard
          title="Commit Days"
          value={commitDays}
          subtitle="consistency score"
          icon={<Flame className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-600"
          delay={0.16}
        />
        <MetricCard
          title="Avg Interview Score"
          value={78}
          suffix="/100"
          subtitle="across all sessions"
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="from-violet-500 to-purple-600"
          trend={8}
          delay={0.24}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerformanceAreaChart />
        <TopicRadarChart />
      </div>

      {/* Quick Actions + Upcoming Curriculum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              { href: "/interview", icon: Mic, label: "New Interview", desc: "Start a fresh session", color: "text-indigo-500" },
              { href: "/performance", icon: TrendingUp, label: "View Analytics", desc: "Check your scores", color: "text-emerald-500" },
              { href: "/leaderboard", icon: Trophy, label: "Leaderboard", desc: "See your ranking", color: "text-amber-500" },
              { href: "/curriculum", icon: BookOpen, label: "Study Topics", desc: "Review curriculum", color: "text-blue-500" },
            ].map(({ href, icon: Icon, label, desc, color }) => (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/5 transition-colors cursor-pointer group"
                >
                  <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0", color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{label}</p>
                    <p className="text-xs text-muted-foreground truncate">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Curriculum */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Curriculum Topics
            </h3>
            <Link href="/curriculum">
              <button className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentDays.map((day, i) => {
              const missionData = missions.find((m) => m.day === day.day);
              const passed = missionData?.passed;

              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 + 0.3 }}
                  className={cn(
                    "p-3.5 rounded-xl border transition-colors",
                    passed
                      ? "bg-emerald-50/50 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/30"
                      : "bg-card border-border/60 hover:bg-accent/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-bold text-muted-foreground">
                      Day {day.day}
                    </span>
                    {passed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                        ✓ Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground leading-tight">
                    {day.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {day.tools.slice(0, 2).join(", ")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
