"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, CurriculumProgressItem, fetchCurrentUser } from "@/lib/api";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [curriculumProgress, setCurriculumProgress] = useState<CurriculumProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
