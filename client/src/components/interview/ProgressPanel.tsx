"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Zap } from "lucide-react";
import { CurriculumDay } from "@/lib/api";

interface ProgressPanelProps {
  coveredDays: number[];
  currentDay: number;
  questionCount: number;
  maxQuestions?: number;
  curriculumDays?: CurriculumDay[];
  lastTurnScore?: number;
  lastTurnVerdict?: "STRONG" | "ADEQUATE" | "WEAK";
}

export function ProgressPanel({
  coveredDays,
  currentDay,
  questionCount,
  maxQuestions = 8,
  curriculumDays = [],
  lastTurnScore,
  lastTurnVerdict,
}: ProgressPanelProps) {
  const progress = (questionCount / maxQuestions) * 100;

  const coveredTopics = curriculumDays.filter((d) =>
    coveredDays.includes(d.day)
  );
  const currentTopic = curriculumDays.find((d) => d.day === currentDay);

  const displayScore = lastTurnScore !== undefined
    ? lastTurnScore
    : Math.min(100, Math.round((coveredDays.length / Math.max(questionCount, 1)) * 85));

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Interview Progress */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Progress</h3>
          <span className="text-xs font-bold text-primary">
            {questionCount}/{maxQuestions}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {Math.max(0, maxQuestions - questionCount)} questions remaining
        </p>
      </div>

      {/* Current Topic */}
      {currentTopic && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Current Topic
            </h3>
          </div>
          <p className="text-xs font-medium text-primary">
            Day {currentTopic.day}
          </p>
          <p className="text-sm text-foreground mt-0.5">{currentTopic.title}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {currentTopic.tools.slice(0, 3).map((tool) => (
              <span
                key={tool}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Covered Topics */}
      <div className="glass rounded-2xl p-4 flex-1 overflow-hidden">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Covered Today
        </h3>
        <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
          {coveredTopics.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Topics covered will appear here
            </p>
          ) : (
            coveredTopics.map((day, i) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground leading-tight">
                    Day {day.day}: {day.title}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Score Estimate */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-foreground">
              OpenRouter Score
            </h3>
          </div>
          {lastTurnVerdict && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full font-bold text-[10px]",
                lastTurnVerdict === "STRONG"
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : lastTurnVerdict === "ADEQUATE"
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
              )}
            >
              {lastTurnVerdict}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-3xl font-bold text-gradient">
            {displayScore}
          </span>
          <span className="text-sm text-muted-foreground mb-1">/100</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time turn evaluation by OpenRouter AI
        </p>
      </div>
    </div>
  );
}
