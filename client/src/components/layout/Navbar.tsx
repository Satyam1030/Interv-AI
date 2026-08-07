"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Bell, Search } from "lucide-react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back" },
  "/interview": { title: "Interview Arena", subtitle: "Live technical interview" },
  "/interview/history": { title: "History", subtitle: "Past sessions" },
  "/performance": { title: "Performance", subtitle: "Analytics & insights" },
  "/curriculum": { title: "Curriculum", subtitle: "31-day AI engineering program" },
  "/leaderboard": { title: "Leaderboard", subtitle: "Global rankings" },
  "/profile": { title: "Profile", subtitle: "Your information" },
  "/settings": { title: "Settings", subtitle: "Preferences & configuration" },
};

export function Navbar() {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { title: "IntervAI", subtitle: "AI Interview Platform" };

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
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
        <ThemeToggle />
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold ml-1">
          AI
        </div>
      </div>
    </header>
  );
}
