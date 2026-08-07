"use client";

import { cn } from "@/lib/utils";

interface WaveformProps {
  isActive?: boolean;
  bars?: number;
  className?: string;
  color?: string;
}

export function VoiceWaveform({
  isActive = true,
  bars = 5,
  className,
}: WaveformProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-[3px]",
        className
      )}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-full bg-primary transition-all",
            isActive ? "wave-bar" : "h-[4px] opacity-40"
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            height: isActive ? undefined : "4px",
          }}
        />
      ))}
    </div>
  );
}
