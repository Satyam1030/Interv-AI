import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "IntervAI – AI Technical Interview Platform",
  description:
    "Personalized AI-powered technical interview preparation for the AI Cohort program. Practice with a real AI interviewer that knows your curriculum.",
  keywords: "AI interview, technical interview, AI cohort, RAG, vector databases, prompt engineering",
  openGraph: {
    title: "IntervAI – AI Technical Interview Platform",
    description: "Practice technical interviews with an AI that knows your curriculum",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
