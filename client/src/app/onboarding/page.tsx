"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchCurriculum,
  CurriculumData,
  CurriculumDay,
  CurriculumProgressItem,
  submitOnboarding,
} from "@/lib/api";
import { useAuth } from "@/components/providers/AuthContext";
import { useClerk } from "@clerk/nextjs";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Zap,
  Sliders,
  Star,
  Check,
  RotateCcw,
  Briefcase,
  GraduationCap,
  Clock,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DayStatus = "COMPLETED" | "ATTEMPTED" | "SKIPPED" | "NOT_STARTED";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const { signOut } = useClerk();

  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [jobRole, setJobRole] = useState("AI Engineer");
  const [yearsExperience, setYearsExperience] = useState(3);
  const [education, setEducation] = useState("Computer Science");

  const handleSignOut = async () => {
    if (user?.authProvider === 'clerk') {
      await signOut();
    }
    logout();
    router.push("/login");
  };

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user]);

  // Status mapping per day
  const [statuses, setStatuses] = useState<Record<number, DayStatus>>({});
  // Learning signals per day
  const [signals, setSignals] = useState<
    Record<
      number,
      {
        experienceLevel: string;
        practicalExperience: string;
        attempts: number;
        confidence: number;
      }
    >
  >({});

  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [activeTabModule, setActiveTabModule] = useState<number>(1);

  useEffect(() => {
    fetchCurriculum()
      .then((data) => {
        setCurriculum(data);
        // Default initial statuses
        const initStatus: Record<number, DayStatus> = {};
        const initSignals: Record<number, any> = {};

        data.days.forEach((d) => {
          // Pre-populate core milestones as completed for quick onboarding demo
          if ([1, 2, 7, 8, 12].includes(d.day)) {
            initStatus[d.day] = "COMPLETED";
            initSignals[d.day] = {
              experienceLevel: "Comfortable",
              practicalExperience: "Built a project",
              attempts: 1,
              confidence: 4,
            };
          } else {
            initStatus[d.day] = "NOT_STARTED";
            initSignals[d.day] = {
              experienceLevel: "Familiar",
              practicalExperience: "Only studied",
              attempts: 1,
              confidence: 3,
            };
          }
        });

        setStatuses(initStatus);
        setSignals(initSignals);
      })
      .catch((e) => setError("Failed to load curriculum data: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (dayNum: number, newStatus: DayStatus) => {
    setStatuses((prev) => ({ ...prev, [dayNum]: newStatus }));
  };

  const handleSignalChange = (dayNum: number, key: string, value: any) => {
    setSignals((prev) => ({
      ...prev,
      [dayNum]: {
        ...(prev[dayNum] || {
          experienceLevel: "Familiar",
          practicalExperience: "Built a project",
          attempts: 1,
          confidence: 3,
        }),
        [key]: value,
      },
    }));
  };

  const handleCompleteOnboarding = async () => {
    if (!curriculum) return;
    setSubmitting(true);
    setError(null);

    const items: CurriculumProgressItem[] = curriculum.days.map((d) => {
      const sig = signals[d.day] || {
        experienceLevel: "Familiar",
        practicalExperience: "Built a project",
        attempts: 1,
        confidence: 3,
      };
      return {
        curriculumDay: d.day,
        topic: d.title,
        status: statuses[d.day] || "NOT_STARTED",
        experienceLevel: sig.experienceLevel,
        practicalExperience: sig.practicalExperience,
        attempts: sig.attempts,
        confidence: sig.confidence,
      };
    });

    try {
      const res = await submitOnboarding({ items, name, jobRole, yearsExperience, education });
      if (user) {
        const token = localStorage.getItem("auth_token") || "";
        login(token, res.user, res.curriculumProgress);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save onboarding.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow animate-pulse">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading 31-Day AI Cohort Curriculum...
        </p>
      </div>
    );
  }

  if (!curriculum) return null;

  const completedCount = Object.values(statuses).filter((s) => s === "COMPLETED").length;
  const attemptedCount = Object.values(statuses).filter((s) => s === "ATTEMPTED").length;
  const skippedCount = Object.values(statuses).filter((s) => s === "SKIPPED").length;

  const currentModule = curriculum.modules.find((m) => m.n === activeTabModule) || curriculum.modules[0];
  const moduleDays = curriculum.days.filter((d) => currentModule.days.includes(d.day));

  return (
    <div className="min-h-screen bg-[var(--background)] py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Build Your Interview Profile
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Your 31-Day AI Cohort Journey
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Tell us what you&apos;ve completed in the AI Cohort so our OpenRouter AI interviewer can tailor every session to your tech stack.
          </p>

          {/* Quick stats summary bar */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-6 pt-6 border-t border-border/60">
            <div>
              <p className="text-2xl font-bold text-emerald-500">{completedCount}</p>
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{attemptedCount}</p>
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Attempted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-500">{skippedCount}</p>
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Skipped</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="glass rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Profile</h2>
              <p className="text-sm text-muted-foreground">Tell us a bit about your background</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <select
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                >
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Years of Experience
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Education
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Computer Science at Stanford"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Module Nav Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {curriculum.modules.map((m) => {
            const daysInMod = m.days;
            const completedInMod = daysInMod.filter((d) => statuses[d] === "COMPLETED").length;

            return (
              <button
                key={m.n}
                onClick={() => setActiveTabModule(m.n)}
                className={cn(
                  "flex-shrink-0 px-4 py-3 rounded-2xl text-xs font-semibold transition-all border text-left",
                  activeTabModule === m.n
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-glow"
                    : "glass text-muted-foreground hover:text-foreground border-border/60"
                )}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span>Module {m.n}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    activeTabModule === m.n ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {completedInMod}/{m.days.length}
                  </span>
                </div>
                <div className="font-bold truncate max-w-[150px]">{m.title}</div>
              </button>
            );
          })}
        </div>

        {/* Curriculum Days Timeline */}
        <div className="space-y-4">
          {moduleDays.map((day) => {
            const status = statuses[day.day] || "NOT_STARTED";
            const isExpanded = expandedDay === day.day;
            const sig = signals[day.day] || {
              experienceLevel: "Familiar",
              practicalExperience: "Built a project",
              attempts: 1,
              confidence: 3,
            };

            return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "glass rounded-2xl p-5 border transition-all",
                  status === "COMPLETED" && "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10",
                  status === "ATTEMPTED" && "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/10",
                  status === "SKIPPED" && "border-indigo-500/40 bg-indigo-500/5 dark:bg-indigo-950/10",
                  status === "NOT_STARTED" && "border-border/60"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                        status === "COMPLETED"
                          ? "bg-emerald-500 text-white"
                          : status === "ATTEMPTED"
                          ? "bg-amber-500 text-white"
                          : status === "SKIPPED"
                          ? "bg-indigo-500 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      D{day.day}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          {day.type}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{day.tools.join(", ")}</span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{day.title}</h3>
                    </div>
                  </div>

                  {/* Status Selection Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: "COMPLETED", label: "Completed", icon: CheckCircle2, color: "emerald" },
                      { id: "ATTEMPTED", label: "Attempted", icon: AlertCircle, color: "amber" },
                      { id: "SKIPPED", label: "Skipped", icon: RotateCcw, color: "indigo" },
                      { id: "NOT_STARTED", label: "Not Started", icon: HelpCircle, color: "slate" },
                    ].map((st) => {
                      const active = status === st.id;
                      const Icon = st.icon;

                      return (
                        <button
                          key={st.id}
                          onClick={() => handleStatusChange(day.day, st.id as DayStatus)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                            active
                              ? st.id === "COMPLETED"
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                : st.id === "ATTEMPTED"
                                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                : st.id === "SKIPPED"
                                ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                                : "bg-slate-700 text-white border-slate-700 shadow-sm"
                              : "bg-card hover:bg-accent/10 border-border/80 text-muted-foreground"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {st.label}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                      className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details & Learning Signals */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border/60 space-y-4"
                    >
                      {/* Objectives */}
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          Mission Objectives:
                        </p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-1">
                          {day.objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Learning signals for completed/attempted days */}
                      {(status === "COMPLETED" || status === "ATTEMPTED") && (
                        <div className="p-4 rounded-xl bg-card border border-border/80 space-y-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Sliders className="w-3.5 h-3.5 text-amber-500" />
                            Fine-tune Learning Signals:
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            {/* Experience level */}
                            <div>
                              <label className="block text-[10px] text-muted-foreground font-medium mb-1">
                                Experience Level
                              </label>
                              <select
                                value={sig.experienceLevel}
                                onChange={(e) => handleSignalChange(day.day, "experienceLevel", e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs"
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Familiar">Familiar</option>
                                <option value="Comfortable">Comfortable</option>
                                <option value="Advanced">Advanced</option>
                              </select>
                            </div>

                            {/* Practical experience */}
                            <div>
                              <label className="block text-[10px] text-muted-foreground font-medium mb-1">
                                Practical Depth
                              </label>
                              <select
                                value={sig.practicalExperience}
                                onChange={(e) => handleSignalChange(day.day, "practicalExperience", e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs"
                              >
                                <option value="Only studied">Only studied</option>
                                <option value="Built a project">Built a project</option>
                                <option value="Used in a real project">Used in a real project</option>
                                <option value="Can explain confidently">Can explain confidently</option>
                              </select>
                            </div>

                            {/* Attempts */}
                            <div>
                              <label className="block text-[10px] text-muted-foreground font-medium mb-1">
                                Mission Attempts
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={sig.attempts}
                                onChange={(e) => handleSignalChange(day.day, "attempts", Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs"
                              />
                            </div>

                            {/* Confidence 1-5 */}
                            <div>
                              <label className="block text-[10px] text-muted-foreground font-medium mb-1">
                                Confidence (1–5)
                              </label>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleSignalChange(day.day, "confidence", star)}
                                    className="p-0.5"
                                  >
                                    <Star
                                      className={cn(
                                        "w-4 h-4",
                                        star <= sig.confidence
                                          ? "text-amber-500 fill-amber-500"
                                          : "text-muted-foreground/40"
                                      )}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Floating Submit Bar */}
        <div className="glass rounded-2xl p-4 flex items-center justify-between sticky bottom-6 z-40 border-primary/30 shadow-float">
          <div>
            <p className="text-sm font-bold text-foreground">
              Ready to generate your candidate profile?
            </p>
            <p className="text-xs text-muted-foreground">
              {completedCount} topics completed · {attemptedCount} attempted
            </p>
          </div>

          <button
            onClick={handleCompleteOnboarding}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-glow hover:opacity-95 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                Save & Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
