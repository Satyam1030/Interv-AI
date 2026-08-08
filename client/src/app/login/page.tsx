"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { loginUser, fetchCandidates, Candidate } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthContext";
import {
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Brain,
  Target,
  Mail,
  Lock,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const floatingStats = [
  { label: "Questions Asked", value: "12,843", icon: "💬" },
  { label: "Interviews Done", value: "2,391", icon: "🎯" },
  { label: "Avg Score", value: "82/100", icon: "⭐" },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (user) {
      if (!user.onboardingCompleted) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, router]);

  useEffect(() => {
    fetchCandidates()
      .then(setCandidates)
      .catch(() => setCandidates([]));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      login(data.token, data.user, data.curriculumProgress);
      if (!data.user.onboardingCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (c: Candidate) => {
    setLoading(true);
    setError(null);
    const demoEmail = `${c.member.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@intervai.ai`;
    try {
      const data = await loginUser(demoEmail, "password123");
      login(data.token, data.user, data.curriculumProgress);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden bg-aurora-mesh dark:bg-aurora-dark">
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
                topics, delivering realistic multi-turn technical conversations.
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

      {/* ── Right Panel (Auth Form) ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">IntervAI</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your IntervAI account to continue your practice
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-glow hover:opacity-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Drawer */}
          {candidates.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="w-full flex items-center justify-between p-3 rounded-xl glass border border-border/80 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Hackathon Reviewer? One-Click Demo Login
                </span>
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", showDemo && "rotate-90")} />
              </button>

              {showDemo && (
                <div className="mt-2 space-y-2">
                  {candidates.map((c) => (
                    <button
                      key={c.member.id}
                      onClick={() => handleDemoLogin(c)}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-card hover:bg-accent/10 border border-border/60 text-left text-xs transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{c.member.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.member.jobRole} · password123</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                        Demo Login →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create account link */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-semibold hover:underline"
              >
                Create Account & Onboard
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
