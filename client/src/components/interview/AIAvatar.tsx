"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { VoiceWaveform } from "@/components/common/VoiceWaveform";
import { Bot, Loader2, Eye, Sparkles } from "lucide-react";

type AvatarState = "idle" | "thinking" | "speaking" | "evaluating";

interface AIAvatarProps {
  state: AvatarState;
  className?: string;
}

const stateConfig = {
  idle: {
    label: "IntervAI",
    sublabel: "Ready",
    icon: <Bot className="w-8 h-8 text-white" />,
    gradient: "from-indigo-500 via-violet-500 to-purple-600",
    glow: "shadow-indigo-400/40",
    ring: "border-indigo-400/30",
  },
  thinking: {
    label: "Analyzing",
    sublabel: "Processing your response...",
    icon: <Loader2 className="w-8 h-8 text-white animate-spin" />,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    glow: "shadow-blue-400/40",
    ring: "border-blue-400/30",
  },
  speaking: {
    label: "Speaking",
    sublabel: "Asking next question...",
    icon: null,
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    glow: "shadow-violet-400/40",
    ring: "border-violet-400/30",
  },
  evaluating: {
    label: "Evaluating",
    sublabel: "Scoring your answer...",
    icon: <Eye className="w-8 h-8 text-white" />,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    glow: "shadow-amber-400/40",
    ring: "border-amber-400/30",
  },
};

export function AIAvatar({ state, className }: AIAvatarProps) {
  const config = stateConfig[state];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Avatar Ring */}
      <div className="relative">
        {/* Animated rings */}
        {(state === "idle" || state === "speaking") && (
          <>
            <motion.div
              className={cn(
                "absolute inset-0 rounded-full border-2 opacity-30",
                config.ring
              )}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={cn(
                "absolute inset-0 rounded-full border-2 opacity-20",
                config.ring
              )}
              animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </>
        )}

        {/* Main avatar circle */}
        <motion.div
          className={cn(
            "relative w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl",
            config.gradient,
            config.glow,
            "shadow-2xl"
          )}
          animate={
            state === "idle"
              ? { scale: [1, 1.02, 1] }
              : state === "thinking"
              ? { scale: [1, 0.98, 1] }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Shine overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />

          {/* Content */}
          <div className="relative z-10">
            {state === "speaking" ? (
              <VoiceWaveform bars={5} isActive />
            ) : (
              config.icon
            )}
          </div>

          {state === "idle" && (
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Label */}
      <div className="text-center">
        <motion.p
          key={config.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-sm text-foreground"
        >
          {config.label}
        </motion.p>
        <motion.p
          key={config.sublabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground mt-0.5"
        >
          {config.sublabel}
        </motion.p>
      </div>
    </div>
  );
}
