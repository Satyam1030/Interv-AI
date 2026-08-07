import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        card: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)",
        glow: "0 0 30px rgba(99,102,241,0.2)",
        "glow-sm": "0 0 15px rgba(99,102,241,0.15)",
        float: "0 10px 40px rgba(0,0,0,0.12)",
        elevated: "0 20px 60px rgba(0,0,0,0.15)",
      },
      keyframes: {
        "shimmer-slide": {
          to: { transform: "translateX(100%)" },
        },
        "spin-around": {
          "0%": { transform: "translateZ(0) rotate(0)" },
          "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
          "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
          "100%": { transform: "translateZ(0) rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "aurora-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)", height: "0" },
          to: { opacity: "1", transform: "translateY(0)", height: "auto" },
        },
        thinking: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        wave: "wave 1.2s ease-in-out infinite",
        "aurora-shift": "aurora-shift 6s ease infinite",
        "fade-up": "fade-up 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "thinking-1": "thinking 1.4s ease-in-out infinite",
        "thinking-2": "thinking 1.4s ease-in-out 0.2s infinite",
        "thinking-3": "thinking 1.4s ease-in-out 0.4s infinite",
        shimmer: "shimmer-slide 1.5s linear infinite",
      },
      backgroundImage: {
        "aurora-mesh":
          "radial-gradient(at 40% 20%, hsla(240,80%,95%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(260,80%,95%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(230,80%,96%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(280,80%,96%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(240,80%,97%,1) 0px, transparent 50%)",
        "aurora-dark":
          "radial-gradient(at 40% 20%, hsla(240,30%,12%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(260,30%,10%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(230,30%,11%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(280,25%,10%,1) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
export default config;
