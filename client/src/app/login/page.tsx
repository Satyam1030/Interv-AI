"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCandidates, Candidate } from "@/lib/api";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Mic,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Brain,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const floatingStats = [
  { label: "Questions Asked", value: "12,843", icon: "💬" },
  { label: "Interviews Done", value: "2,391", icon: "🎯" },
  { label: "Avg Score", value: "82/100", icon: "⭐" },
];

export default function LoginPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCandidates()
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setFetching(false));
  }, []);

  const handleStart = async () => {
    if (!selected) return;
    setLoading(true);
    localStorage.setItem("selectedCandidate", JSON.stringify(selected));
    await new Promise((r) => setTimeout(r, 600));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden bg-aurora-mesh dark:bg-aurora-dark">
        {/* Animated mesh */}
        <div className="absolute inset-0 bg-aurora-mesh dark:bg-aurora-dark animate-aurora-shift bg-[length:400%_400%]" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 via-transparent to-violet-100/40 dark:from-indigo-950/40 dark:to-violet-950/40" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              IntervAI
            </span>
          </div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
                <Zap className="w-3 h-3" />
                AI-Powered Technical Interviews
              </div>
              <h1 className="text-5xl font-bold text-foreground leading-[1.1] tracking-tight mb-5">
                Practice interviews that know{" "}
                <span className="text-gradient">your curriculum</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our AI interviewer adapts in real-time to your completed cohort
                topics, delivering realistic multi-turn technical conversations
                that prepare you for production.
              </p>
            </motion.div>

            {/* Feature bullets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 space-y-3"
            >
              {[
                { icon: Brain, text: "Adaptive questioning based on your completed days" },
                { icon: Target, text: "Personalized scoring & gap analysis" },
                { icon: Shield, text: "Safe to practice — no judgment, only improvement" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">{text}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex gap-4"
          >
            {floatingStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
                className="glass rounded-2xl p-4 flex-1"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">IntervAI</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            Begin your session
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Select your profile to start a personalized AI interview
          </p>

          {/* Candidate Dropdown */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Select Candidate
            </label>
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm transition-all",
                  "bg-card hover:bg-accent/5 border-border/80",
                  open && "border-primary/50 ring-2 ring-primary/10",
                  fetching && "opacity-60 cursor-wait"
                )}
                disabled={fetching}
              >
                {fetching ? (
                  <span className="text-muted-foreground">
                    Loading candidates...
                  </span>
                ) : selected ? (
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {selected.member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground leading-none">
                        {selected.member.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selected.member.jobRole}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Choose a candidate...
                  </span>
                )}
                <motion.div
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{ transformOrigin: "top" }}
                    className="absolute top-full left-0 right-0 mt-1.5 glass-strong rounded-xl shadow-float z-50 overflow-hidden max-h-72 overflow-y-auto"
                  >
                    {candidates.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No candidates found. Make sure the server is running.
                      </div>
                    ) : (
                      candidates.map((c, i) => (
                        <motion.button
                          key={c.member.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => {
                            setSelected(c);
                            setOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-accent/10 transition-colors",
                            selected?.member.id === c.member.id &&
                              "bg-accent/10"
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {c.member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {c.member.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {c.member.jobRole} ·{" "}
                              {c.signals?.missionsCompleted ?? 0} missions
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                                c.member.status === "active"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {c.member.status}
                            </span>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Candidate info card */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      {
                        label: "Days Completed",
                        value: selected.signals?.missionsCompleted ?? 0,
                      },
                      {
                        label: "First Try",
                        value: selected.signals?.missionsFirstTry ?? 0,
                      },
                      {
                        label: "Commit Days",
                        value: selected.signals?.commitDays ?? 0,
                      },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="text-lg font-bold text-foreground">
                          {stat.value}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Education:
                      </span>{" "}
                      {selected.member.education}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            onClick={handleStart}
            disabled={!selected || loading}
            whileHover={selected ? { scale: 1.02 } : {}}
            whileTap={selected ? { scale: 0.98 } : {}}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-sm font-semibold transition-all",
              selected
                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-glow hover:shadow-glow hover:opacity-95"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Preparing Interview...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Begin AI Interview
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          <p className="text-xs text-muted-foreground text-center mt-5">
            Powered by Google Gemini AI · Questions tailored to your cohort
            progress
          </p>
        </motion.div>
      </div>
    </div>
  );
}
