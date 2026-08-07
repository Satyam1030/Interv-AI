"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

function Counter({
  value,
  duration = 1.5,
  suffix = "",
  prefix = "",
  className,
}: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const start = 0;
    const end = value;
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  gradient?: string;
  delay?: number;
  className?: string;
}

export function MetricCard({
  title,
  value,
  suffix = "",
  prefix = "",
  subtitle,
  icon,
  trend,
  trendLabel,
  gradient = "from-indigo-500 to-violet-600",
  delay = 0,
  className,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "glass rounded-2xl p-5 cursor-default",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <Counter
              value={value}
              prefix={prefix}
              suffix={suffix}
              className="text-3xl font-bold text-foreground tracking-tight"
            />
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                trend >= 0 ? "text-emerald-600" : "text-rose-500"
              )}
            >
              <span>{trend >= 0 ? "↑" : "↓"}</span>
              <span>
                {Math.abs(trend)}% {trendLabel ?? "vs last week"}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm flex-shrink-0",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
