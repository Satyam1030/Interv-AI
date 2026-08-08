import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthContext";
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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkValid = Boolean(
    publishableKey &&
    publishableKey !== "your_clerk_publishable_key_here" &&
    publishableKey.startsWith("pk_")
  );

  if (isClerkValid) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
          <body>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange={false}
            >
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
