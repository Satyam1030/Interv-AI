"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  BellOff,
  Bot,
  Cpu,
  Shield,
  ChevronRight,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";

function SettingRow({
  icon,
  title,
  description,
  control,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border/40 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {control}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0",
        value ? "bg-primary" : "bg-border"
      )}
      style={{ height: "22px" }}
    >
      <motion.div
        animate={{ x: value ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [aiVerbose, setAiVerbose] = useState(true);

  const themes = [
    { value: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
    { value: "system", label: "System", icon: <Monitor className="w-4 h-4" /> },
  ];

  const sections = [
    {
      title: "Appearance",
      icon: <Sun className="w-4 h-4" />,
      content: (
        <div className="py-3">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Theme
          </p>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                  theme === t.value
                    ? "border-primary/50 bg-primary/5 text-primary"
                    : "border-border/80 text-muted-foreground hover:bg-accent/5"
                )}
              >
                {t.icon}
                {t.label}
                {theme === t.value && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "AI Model",
      icon: <Bot className="w-4 h-4" />,
      content: (
        <div>
          <SettingRow
            icon={<Cpu className="w-4 h-4" />}
            title="AI Model"
            description="Powered by Google Gemini Flash"
            control={
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
                gemini-flash
              </span>
            }
          />
          <SettingRow
            icon={<Bot className="w-4 h-4" />}
            title="Verbose Responses"
            description="AI provides detailed follow-up context"
            control={<Toggle value={aiVerbose} onChange={setAiVerbose} />}
          />
        </div>
      ),
    },
    {
      title: "Notifications",
      icon: <Bell className="w-4 h-4" />,
      content: (
        <div>
          <SettingRow
            icon={<Bell className="w-4 h-4" />}
            title="Push Notifications"
            description="Get notified about session reminders"
            control={<Toggle value={notifications} onChange={setNotifications} />}
          />
          <SettingRow
            icon={<BellOff className="w-4 h-4" />}
            title="Sound Effects"
            description="Play sounds during interview transitions"
            control={<Toggle value={sounds} onChange={setSounds} />}
          />
        </div>
      ),
    },
    {
      title: "Privacy & Data",
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div>
          <SettingRow
            icon={<Shield className="w-4 h-4" />}
            title="Session Storage"
            description="Interview sessions stored locally only"
            control={
              <span className="text-xs text-emerald-600 font-medium flex-shrink-0">
                Local only
              </span>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5"
      >
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your preferences and account settings
        </p>
      </motion.div>

      {sections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 + 0.1 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              {section.icon}
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              {section.title}
            </h2>
          </div>
          {section.content}
        </motion.div>
      ))}
    </div>
  );
}
