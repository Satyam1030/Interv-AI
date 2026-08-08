"use client";

import { useAuth } from "@/components/providers/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Brain } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (!user.onboardingCompleted && pathname !== "/onboarding") {
        router.replace("/onboarding");
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow animate-pulse">
          <Brain className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verifying secure session...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
