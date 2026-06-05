"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  signInWithEmail,
  signOutFromSupabase,
  signUpWithEmail,
} from "@/services/auth";
import type { User, UserSignIn, UserSignUp } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (data: UserSignIn) => Promise<{ success: boolean; message?: string }>;
  signUp: (data: UserSignUp) => Promise<{ success: boolean; message?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (data: UserSignIn) => {
    if (!data.email || !data.password) {
      return { success: false, message: "Preencha e-mail e senha." };
    }

    try {
      const response = await signInWithEmail(data);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } catch {
      return {
        success: false,
        message: "Configure as chaves do Supabase para ativar o login real.",
      };
    }
  };

  const signUp = async (data: UserSignUp) => {
    if (!data.email || !data.name || !data.password || !data.confirmPassword) {
      return { success: false, message: "Preencha todos os campos obrigatórios." };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, message: "As senhas não coincidem." };
    }

    if (!data.agreeToTerms) {
      return { success: false, message: "Você deve aceitar os termos." };
    }

    try {
      const response = await signUpWithEmail(data);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } catch {
      return {
        success: false,
        message: "Configure as chaves do Supabase para ativar o cadastro real.",
      };
    }
  };

  const signOut = () => {
    setUser(null);
    void signOutFromSupabase();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
