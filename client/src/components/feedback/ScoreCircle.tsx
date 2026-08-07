"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowRight, Trophy, Star } from "lucide-react";
import { Feedback } from "@/lib/api";

interface ScoreCircleProps {
  score: number;
  label?: string;
}

export function ScoreCircle({ score, label = "Overall Score" }: ScoreCircleProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "url(#success-gradient)"
      : score >= 60
      ? "url(#warning-gradient)"
      : "url(#danger-gradient)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="success-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="warning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="danger-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted/40"
          />
          {/* Progress arc */}
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            transform="rotate(-90 90 90)"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

interface FeedbackSectionProps {
  feedback: Feedback;
  summary?: string;
}

export function FeedbackSection({ feedback, summary }: FeedbackSectionProps) {
  const sections = [
    {
      label: "Strengths",
      items: feedback.strengths,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      accent: "emerald",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-800/40",
      text: "text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Areas to Improve",
      items: feedback.gaps,
      icon: <XCircle className="w-4 h-4 text-amber-500" />,
      accent: "amber",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-200 dark:border-amber-800/40",
      text: "text-amber-700 dark:text-amber-400",
    },
    {
      label: "Next Steps",
      items: feedback.next,
      icon: <ArrowRight className="w-4 h-4 text-violet-500" />,
      accent: "violet",
      bg: "bg-violet-50 dark:bg-violet-950/20",
      border: "border-violet-200 dark:border-violet-800/40",
      text: "text-violet-700 dark:text-violet-400",
    },
  ];

  return (
    <div className="space-y-4">
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm text-foreground">Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </motion.div>
      )}

      {sections.map((section, si) => (
        <motion.div
          key={section.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * si + 0.2 }}
          className={cn(
            "rounded-2xl border p-5",
            section.bg,
            section.border
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            {section.icon}
            <h3 className={cn("font-semibold text-sm", section.text)}>
              {section.label}
            </h3>
          </div>
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i + 0.3 * si + 0.4 }}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span
                  className={cn(
                    "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0",
                    section.accent === "emerald"
                      ? "bg-emerald-500"
                      : section.accent === "amber"
                      ? "bg-amber-500"
                      : "bg-violet-500"
                  )}
                />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
