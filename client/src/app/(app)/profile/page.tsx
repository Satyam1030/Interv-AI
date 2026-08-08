"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateProfile } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthContext";
import { getInitials, cn } from "@/lib/utils";
import {
  User,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Target,
  Flame,
  Brain,
  Star,
  Award,
  Edit2,
  Save,
  X
} from "lucide-react";

const badges = [
  { id: "fast-learner", label: "Fast Learner", desc: "10+ first-try passes", icon: "⚡", color: "from-amber-400 to-yellow-500", unlocked: true },
  { id: "consistent", label: "Consistent", desc: "15+ commit days", icon: "🔥", color: "from-orange-500 to-red-500", unlocked: true },
  { id: "completionist", label: "Completionist", desc: "25+ missions done", icon: "🏆", color: "from-indigo-500 to-violet-600", unlocked: false },
  { id: "ai-expert", label: "AI Expert", desc: "Score 90+ in interview", icon: "🤖", color: "from-cyan-500 to-blue-600", unlocked: false },
  { id: "rag-master", label: "RAG Master", desc: "Complete RAG module", icon: "🔍", color: "from-emerald-500 to-teal-600", unlocked: true },
  { id: "vector-guru", label: "Vector Guru", desc: "Complete Vectors module", icon: "🧮", color: "from-violet-500 to-purple-600", unlocked: false },
];

export default function ProfilePage() {
  const { user, curriculumProgress, token, login } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    jobRole: "",
    yearsExperience: 0,
    education: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        jobRole: user.jobRole || "",
        yearsExperience: user.yearsExperience || 0,
        education: user.education || ""
      });
    }
  }, [user]);

  if (!user) return null;

  const completed = curriculumProgress.filter(p => p.status === "COMPLETED").length;
  const firstTry = curriculumProgress.filter(p => p.status === "COMPLETED" && (p.attempts || 1) === 1).length;
  const commitDays = completed;
  
  const missions = curriculumProgress.map(p => ({
    day: p.curriculumDay,
    passed: p.status === "COMPLETED",
    skipped: p.status === "SKIPPED",
    attempts: p.attempts || 1
  }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateProfile({ ...formData, yearsExperience: Number(formData.yearsExperience) });
      if (token) {
        login(token, res.user, curriculumProgress);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-5 relative">
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            className="absolute top-0 right-0 p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow flex-shrink-0"
          >
            {getInitials(user.name)}
          </motion.div>
          <div className="flex-1 w-full">
            {isEditing ? (
              <div className="space-y-3 mt-2">
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-semibold"
                  placeholder="Your Name"
                />
                <input 
                  type="text" 
                  value={formData.jobRole}
                  onChange={e => setFormData({ ...formData, jobRole: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm"
                  placeholder="Job Role"
                />
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={formData.education}
                    onChange={e => setFormData({ ...formData, education: e.target.value })}
                    className="flex-1 bg-card border border-border rounded-lg px-3 py-1.5 text-sm"
                    placeholder="Education"
                  />
                  <input 
                    type="number" 
                    value={formData.yearsExperience}
                    onChange={e => setFormData({ ...formData, yearsExperience: Number(e.target.value) })}
                    className="w-24 bg-card border border-border rounded-lg px-3 py-1.5 text-sm"
                    placeholder="Years"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground pr-10">{user.name}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">{user.jobRole}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {user.education}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Briefcase className="w-3.5 h-3.5" />
                    {user.yearsExperience} years experience
                  </div>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    active
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Missions Done", value: completed, max: 31, icon: <Target className="w-5 h-5" />, color: "text-emerald-500" },
          { label: "First Try", value: firstTry, max: completed, icon: <Brain className="w-5 h-5" />, color: "text-blue-500" },
          { label: "Day Streak", value: commitDays, max: 31, icon: <Flame className="w-5 h-5" />, color: "text-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 text-center">
            <div className={cn("w-8 h-8 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2", stat.color)}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Mission History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Mission History
        </h3>
        <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-[repeat(31,1fr)] gap-1.5">
          {missions.map((mission, i) => (
            <motion.div
              key={mission.day}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 + 0.2 }}
              title={`Day ${mission.day}: ${mission.passed ? "Passed" : mission.skipped ? "Skipped" : "Failed"}`}
              className={cn(
                "aspect-square rounded-md",
                mission.passed
                  ? "bg-emerald-500"
                  : mission.skipped
                  ? "bg-muted"
                  : "bg-rose-400/60"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            Passed
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-rose-400/60" />
            Failed
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            Skipped
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          Achievement Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className={cn(
                "p-3.5 rounded-xl border transition-all",
                badge.unlocked
                  ? "border-border/60 bg-card hover:shadow-soft"
                  : "border-border/30 bg-muted/30 opacity-50 grayscale"
              )}
            >
              <div className="text-2xl mb-1.5">{badge.icon}</div>
              <p className="text-xs font-semibold text-foreground">{badge.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
              {badge.unlocked && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Unlocked
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
