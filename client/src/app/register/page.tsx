"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { useAuth } from "@/components/providers/AuthContext";
import {
  Brain,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (user) {
      const target = !user.onboardingCompleted ? "/onboarding" : "/dashboard";
      router.replace(target);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">IntervAI</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Create Your Account
          </h2>
          <p className="text-sm text-muted-foreground">
            Sign up to build your personalized AI Cohort curriculum profile and start practice interviews.
          </p>
        </div>

        {/* Clerk SSO Sign Up Button */}
        {isLoaded && !isSignedIn && Boolean(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "your_clerk_publishable_key_here" &&
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_")
        ) && (
          <div className="space-y-3">
            <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-card border border-border/80 text-foreground text-sm font-semibold hover:bg-accent/10 transition-all shadow-sm group"
              >
                <div className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                  C
                </div>
                <span>Sign up via Clerk (Google / SSO / Email)</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            </SignUpButton>
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
