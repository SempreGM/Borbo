"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, UserRole, UserSignIn, UserSignUp } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  signIn: (data: UserSignIn) => Promise<{ success: boolean; message?: string }>;
  signUp: (data: UserSignUp) => Promise<{ success: boolean; message?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "borboAuthUser";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const MASTER_CREDENTIALS = {
    email: "master@borbo.com",
    password: "master123",
  };

  const buildMockUser = (email: string, name: string, role: UserRole = "customer"): User => ({
    id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}`,
    email,
    emailVerified: true,
    name,
    surname: undefined,
    phone: undefined,
    avatar: undefined,
    birthDate: undefined,
    cpf: undefined,
    addresses: [],
    defaultShippingAddressId: undefined,
    defaultBillingAddressId: undefined,
    preferences: {
      newsletter: true,
      notifications: true,
      theme: "light",
      language: "pt-BR",
      currency: "BRL",
    },
    role,
    status: "active",
    totalOrders: 0,
    totalSpent: 0,
    favorites: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
  });

  const signIn = async (data: UserSignIn) => {
    if (!data.email || !data.password) {
      return { success: false, message: "Preencha e-mail e senha." };
    }

    const isMasterLogin =
      data.email.toLowerCase() === MASTER_CREDENTIALS.email &&
      data.password === MASTER_CREDENTIALS.password;

    if (data.email.toLowerCase() === MASTER_CREDENTIALS.email && !isMasterLogin) {
      return { success: false, message: "E-mail ou senha MASTER incorretos." };
    }

    const name = data.email.split("@")[0].replace(/\W+/g, " ").trim() || "Cliente";
    const user = buildMockUser(data.email, name, isMasterLogin ? "admin" : "customer");
    setUser(user);

    return { success: true };
  };

  const signUp = async (data: UserSignUp) => {
    if (!data.email || !data.name || !data.password || !data.confirmPassword) {
      return { success: false, message: "Preencha todos os campos obrigatórios." };
    }

    if (data.email.toLowerCase() === MASTER_CREDENTIALS.email) {
      return {
        success: false,
        message: "O e-mail MASTER é reservado. Use a página de login para acessar.",
      };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, message: "As senhas não coincidem." };
    }

    if (!data.agreeToTerms) {
      return { success: false, message: "Você deve aceitar os termos." };
    }

    const user = buildMockUser(data.email, data.name);
    setUser(user);

    return { success: true };
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
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
