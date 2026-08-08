"use client";

import { useEffect, useState } from "react";
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
  Check,
  Key,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { getApiConfig, setOpenRouterKey } from "@/lib/api";

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
  const [hasOpenRouterKey, sethasOpenRouterKey] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [savingKey, setSavingKey] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    getApiConfig()
      .then((cfg) => sethasOpenRouterKey(cfg.hasOpenRouterKey))
      .catch(console.error);
  }, []);

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) return;
    setSavingKey(true);
    setSaveMessage(null);
    try {
      const res = await setOpenRouterKey(apiKeyInput.trim());
      if (res.success) {
        sethasOpenRouterKey(true);
        setApiKeyInput("");
        setSaveMessage("OpenRouter API Key saved successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (e) {
      setSaveMessage("Failed to save API Key. Please try again.");
    } finally {
      setSavingKey(false);
    }
  };

  const themes = [
    { value: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
    { value: "system", label: "System", icon: <Monitor className="w-4 h-4" /> },
  ];

  const sections = [
    {
      title: "OpenRouter API Integration",
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      content: (
        <div className="py-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                Integration Status:
              </span>
              <span
                className={cn(
                  "text-xs px-2.5 py-0.5 rounded-full font-semibold",
                  hasOpenRouterKey
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                )}
              >
                {hasOpenRouterKey ? "⚡ Active (OpenRouter Connected)" : "⚠️ Key Needed"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Model: OpenRouter-2.0-flash
            </span>
          </div>

          <div className="flex gap-2 items-center pt-1">
            <div className="relative flex-1">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={hasOpenRouterKey ? "Paste new key to update..." : "Paste your OpenRouter API Key..."}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border/80 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={handleSaveKey}
              disabled={savingKey || !apiKeyInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold disabled:opacity-50 transition-all flex-shrink-0"
            >
              {savingKey ? "Saving..." : "Save Key"}
            </button>
          </div>
          {saveMessage && (
            <p className={cn("text-xs font-medium", saveMessage.includes("successfully") ? "text-emerald-500" : "text-rose-500")}>
              {saveMessage}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Enter your API key from Google AI Studio. It powers live LLM questions, turn evaluation, dynamic probing, and structured final scorecards.
          </p>
        </div>
      ),
    },
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
      title: "AI Model & Behavior",
      icon: <Bot className="w-4 h-4" />,
      content: (
        <div>
          <SettingRow
            icon={<Cpu className="w-4 h-4" />}
            title="Active Model Engine"
            description="Automatic fallback across OpenRouter 2.0 Flash, 1.5 Flash, and 1.5 Pro"
            control={
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                OpenRouter-2.0-flash
              </span>
            }
          />
          <SettingRow
            icon={<Bot className="w-4 h-4" />}
            title="Verbose Follow-up Probing"
            description="AI probes edge cases and architecture trade-offs"
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
      title: "Privacy & Security",
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div>
          <SettingRow
            icon={<Shield className="w-4 h-4" />}
            title="Session Storage"
            description="Interview sessions and credentials stored locally"
            control={
              <span className="text-xs text-emerald-600 font-medium flex-shrink-0">
                Local Environment
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
          Manage your AI model keys, preferences, and workspace settings
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

