"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TurnMessage } from "@/lib/api";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  message: TurnMessage;
  index: number;
}

export function ChatBubble({ message, index }: ChatBubbleProps) {
  const isAI = message.role === "interviewer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        delay: index * 0.05,
      }}
      className={cn(
        "flex gap-3 max-w-[90%]",
        isAI ? "self-start flex-row" : "self-end flex-row-reverse"
      )}
    >
      {/* Avatar icon */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1",
          isAI
            ? "bg-gradient-to-br from-indigo-500 to-violet-600"
            : "bg-gradient-to-br from-emerald-500 to-teal-600"
        )}
      >
        {isAI ? (
          <Bot className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
          isAI
            ? "bg-card dark:bg-muted border border-border/60 text-foreground rounded-tl-sm"
            : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm"
        )}
      >
        {message.content}

        {!isAI && message.verdict && message.score !== undefined && (
          <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-white/80 font-medium">Gemini Turn Score:</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full font-bold text-[10px]",
                message.verdict === "STRONG"
                  ? "bg-emerald-400/30 text-emerald-100"
                  : message.verdict === "ADEQUATE"
                  ? "bg-amber-400/30 text-amber-100"
                  : "bg-rose-400/30 text-rose-100"
              )}
            >
              {message.verdict} ({message.score}/100)
            </span>
          </div>
        )}

        {message.topicDay && isAI && (
          <div className="mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground flex justify-between items-center">
            <span>Day {message.topicDay} topic</span>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gemini AI
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-3 self-start max-w-[90%]"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mt-1">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card dark:bg-muted border border-border/60 shadow-sm">
        <div className="flex items-center gap-1.5 h-5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
