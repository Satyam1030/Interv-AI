"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const mockHistory = [
  { date: "Week 1", score: 62 },
  { date: "Week 2", score: 71 },
  { date: "Week 3", score: 68 },
  { date: "Week 4", score: 79 },
  { date: "Week 5", score: 84 },
  { date: "Week 6", score: 81 },
  { date: "Week 7", score: 91 },
];

const radarData = [
  { topic: "RAG", score: 88 },
  { topic: "Vectors", score: 72 },
  { topic: "Prompting", score: 95 },
  { topic: "Agents", score: 67 },
  { topic: "MCP", score: 78 },
  { topic: "Deploy", score: 83 },
];

export function PerformanceAreaChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Score Trend
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Interview performance over time
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={mockHistory}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-border/40"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[40, 100]}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#scoreGrad)"
            dot={{ fill: "#6366f1", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function TopicRadarChart({ data = radarData }: { data?: typeof radarData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Topic Coverage
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Skill proficiency by subject
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data}>
          <PolarGrid stroke="currentColor" className="text-border/40" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
