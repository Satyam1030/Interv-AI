"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/components/providers/AuthContext";
import { Bell, Search, LogOut } from "lucide-react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back" },
  "/interview": { title: "Interview Arena", subtitle: "Live technical interview" },
  "/history": { title: "Interview History", subtitle: "Past sessions & evaluations" },
  "/performance": { title: "Performance", subtitle: "Analytics & insights" },
  "/curriculum": { title: "Curriculum", subtitle: "31-day AI engineering program" },
  "/leaderboard": { title: "Leaderboard", subtitle: "Global rankings" },
  "/profile": { title: "Profile", subtitle: "Your information" },
  "/settings": { title: "Settings", subtitle: "Preferences & configuration" },
};

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const page = pageTitles[pathname] ?? { title: "IntervAI", subtitle: "AI Interview Platform" };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "AI";

  return (
    <header className="h-14 bg-[var(--background)]/80 dark:bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]/60 flex items-center px-6 gap-4 sticky top-0 z-20">
      {/* Page title */}
      <div className="flex-1">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="text-sm font-semibold text-foreground leading-none">
            {page.title}
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {page.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {initials}
          </div>
          <span className="text-xs font-semibold text-foreground hidden sm:inline">
            {user?.name || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
