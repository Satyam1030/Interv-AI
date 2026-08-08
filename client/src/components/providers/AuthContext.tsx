"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, CurriculumProgressItem, fetchCurrentUser, syncClerkUser } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

interface AuthContextType {
  user: User | null;
  token: string | null;
  curriculumProgress: CurriculumProgressItem[];
  loading: boolean;
  login: (token: string, user: User, progress?: CurriculumProgressItem[]) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  updateProgress: (progress: CurriculumProgressItem[]) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  curriculumProgress: [],
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  updateProgress: () => {},
});

function ClerkUserSyncer({ login, logout }: { login: (newToken: string, newUser: User, newProgress?: CurriculumProgressItem[]) => void, logout: () => void }) {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useUser();
  const { user: localUser } = useAuth();
  const [wasSignedIn, setWasSignedIn] = useState(false);
  const syncAttempted = React.useRef(false);

  useEffect(() => {
    if (isClerkLoaded) {
      if (isClerkSignedIn && clerkUser) {
        setWasSignedIn(true);
        const email = clerkUser.primaryEmailAddress?.emailAddress;
        
        // Only sync if we haven't attempted yet in this session, or if the local user is missing
        if (email && (!syncAttempted.current || !localUser)) {
          syncAttempted.current = true;
          syncClerkUser({
            clerkId: clerkUser.id,
            email,
            name: clerkUser.fullName || clerkUser.firstName || "Clerk User",
            imageUrl: clerkUser.imageUrl,
          })
            .then((res) => {
              login(res.token, res.user, res.curriculumProgress);
            })
            .catch((err) => {
              console.error("Failed to sync Clerk user to MongoDB:", err);
            });
        }
      } else if (!isClerkSignedIn && wasSignedIn) {
        setWasSignedIn(false);
        syncAttempted.current = false;
        logout();
      }
    }
  }, [isClerkLoaded, isClerkSignedIn, clerkUser, login, logout, wasSignedIn, localUser]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [curriculumProgress, setCurriculumProgress] = useState<CurriculumProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkValid = Boolean(
    publishableKey &&
    publishableKey !== "your_clerk_publishable_key_here" &&
    publishableKey.startsWith("pk_")
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("selectedCandidate");
    setUser(null);
    setToken(null);
    setCurriculumProgress([]);
  }, []);

  const login = useCallback((newToken: string, newUser: User, newProgress?: CurriculumProgressItem[]) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setUser(newUser);
    if (newProgress) setCurriculumProgress(newProgress);

    // Build candidate object in localStorage for current session
    const candidateObj = {
      member: {
        id: newUser.id,
        name: newUser.name,
        jobRole: newUser.jobRole || "AI Engineer",
        yearsExperience: newUser.yearsExperience || 3,
        education: newUser.education || "Computer Science",
        status: "active",
      },
      missions: (newProgress || []).map((p) => ({
        day: p.curriculumDay,
        title: p.topic,
        passed: p.status === "COMPLETED",
        skipped: p.status === "SKIPPED",
        attempts: p.attempts || 1,
      })),
      signals: {
        commitDays: (newProgress || []).filter((p) => p.status === "COMPLETED").length,
        missionsCompleted: (newProgress || []).filter((p) => p.status === "COMPLETED").length,
        missionsFirstTry: (newProgress || []).filter((p) => p.status === "COMPLETED" && (p.attempts || 1) === 1).length,
      },
    };
    localStorage.setItem("selectedCandidate", JSON.stringify(candidateObj));
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setToken(storedToken);
    fetchCurrentUser()
      .then(({ user: fetchedUser, curriculumProgress: fetchedProgress }) => {
        setUser(fetchedUser);
        setCurriculumProgress(fetchedProgress || []);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [logout]);

  const updateUser = useCallback((u: User) => {
    setUser(u);
  }, []);

  const updateProgress = useCallback((p: CurriculumProgressItem[]) => {
    setCurriculumProgress(p);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        curriculumProgress,
        loading,
        login,
        logout,
        updateUser,
        updateProgress,
      }}
    >
      {isClerkValid && <ClerkUserSyncer login={login} logout={logout} />}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
