"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchCurriculum, CurriculumData, CurriculumDay, Candidate } from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Zap, Layers } from "lucide-react";

const moduleColors = [
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
];

export default function CurriculumPage() {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("selectedCandidate");
    if (!stored) { router.replace("/login"); return; }
    setCandidate(JSON.parse(stored));
    fetchCurriculum()
      .then(setCurriculum)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const isDayCompleted = (day: number) => {
    return candidate?.missions?.find((m) => m.day === day)?.passed ?? false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!curriculum) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h1 className="text-xl font-bold text-foreground mb-1">
          {curriculum.cohort}
        </h1>
        <p className="text-sm text-muted-foreground">
          {curriculum.days.length}-day AI engineering program
        </p>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {candidate?.signals?.missionsCompleted ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {curriculum.modules.length}
            </p>
            <p className="text-xs text-muted-foreground">Modules</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {curriculum.days.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </div>
        </div>
      </motion.div>

      {/* Modules & Days */}
      {curriculum.modules.map((module, mi) => (
        <motion.div
          key={module.n}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: mi * 0.06 }}
          className="space-y-2"
        >
          {/* Module header */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                moduleColors[mi % moduleColors.length]
              )}
            >
              {module.n}
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-foreground">
                {module.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Days {module.days[0]}–{module.days[module.days.length - 1]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {module.days.filter(isDayCompleted).length}/{module.days.length} done
              </span>
            </div>
          </div>

          {/* Days */}
          <div className="ml-4 border-l-2 border-border/60 pl-4 space-y-2">
            {curriculum.days
              .filter((d) => module.days.includes(d.day))
              .map((day, di) => {
                const completed = isDayCompleted(day.day);
                const expanded = expandedDays.has(day.day);

                return (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: di * 0.04 + mi * 0.06 }}
                    className={cn(
                      "rounded-xl border overflow-hidden",
                      completed
                        ? "border-emerald-200/60 dark:border-emerald-800/30 bg-emerald-50/40 dark:bg-emerald-950/10"
                        : "border-border/60 bg-card"
                    )}
                  >
                    <button
                      onClick={() => toggleDay(day.day)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/5 transition-colors"
                    >
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">
                            Day {day.day}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full",
                              day.type === "build"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : day.type === "theory"
                                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            )}
                          >
                            {day.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {day.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="hidden sm:flex gap-1">
                          {day.tools.slice(0, 2).map((tool) => (
                            <span
                              key={tool}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                        {expanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded details */}
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 pt-0 border-t border-border/40"
                      >
                        <div className="pt-3">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Zap className="w-3 h-3" />
                            Objectives
                          </h4>
                          <ul className="space-y-1.5">
                            {day.objectives.map((obj, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-foreground"
                              >
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                                {obj}
                              </li>
                            ))}
                          </ul>
                          {day.tools.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Tools
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {day.tools.map((tool) => (
                                  <span
                                    key={tool}
                                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
