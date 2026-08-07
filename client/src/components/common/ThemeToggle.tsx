"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycles = ["light", "dark", "system"];
  const icons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    system: <Monitor className="w-4 h-4" />,
  };

  const next = () => {
    const i = cycles.indexOf(theme || "light");
    setTheme(cycles[(i + 1) % cycles.length]);
  };

  return (
    <button
      onClick={next}
      className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {icons[(theme as keyof typeof icons) || "light"]}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
