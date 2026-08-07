"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let listeners: Array<(toasts: Toast[]) => void> = [];
let toastQueue: Toast[] = [];

export function toast(message: string, type: Toast["type"] = "info") {
  const id = Date.now().toString();
  toastQueue = [...toastQueue, { id, message, type }];
  listeners.forEach((l) => l([...toastQueue]));
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    listeners.forEach((l) => l([...toastQueue]));
  }, 4000);
}

export function Toaster() {
  const [toasts, setToasts] = useToasts();

  const remove = (id: string) => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    listeners.forEach((l) => l([...toastQueue]));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-float glass-strong min-w-[280px] max-w-[360px]"
          >
            {t.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
            {t.type === "error" && <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
            {t.type === "info" && <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />}
            <p className="text-sm text-foreground flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToasts(): [Toast[], (t: Toast[]) => void] {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const handler = (t: Toast[]) => setToasts(t);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);
  return [toasts, setToasts];
}
