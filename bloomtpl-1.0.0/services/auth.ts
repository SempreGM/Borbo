"use client";

import { ensureCustomerProfileAction } from "@/app/actions/profiles";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import type { User, UserRole, UserSignIn, UserSignUp } from "@/types/user";

type Profile = Tables<"profiles">;

function translateAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("password should be at least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  if (normalizedMessage.includes("already registered")) {
    return "Este e-mail já está cadastrado.";
  }

  if (normalizedMessage.includes("invalid email")) {
    return "Informe um e-mail válido.";
  }

  if (normalizedMessage.includes("signup is disabled")) {
    return "O cadastro está temporariamente desativado.";
  }

  return "Não foi possível criar a conta agora.";
}

function buildUserFromProfile(authUser: SupabaseUser, profile?: Profile | null): User {
  const metadataName =
    typeof authUser.user_metadata?.name === "string"
      ? authUser.user_metadata.name
      : undefined;

  const role: UserRole = profile?.role === "admin" ? "admin" : "customer";
  const now = new Date();

  return {
    id: authUser.id,
    email: authUser.email ?? profile?.email ?? "",
    emailVerified: Boolean(authUser.email_confirmed_at),
    name: profile?.name ?? metadataName ?? authUser.email?.split("@")[0] ?? "Cliente",
    phone: profile?.phone ?? undefined,
    addresses: [],
    preferences: {
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
    createdAt: profile?.created_at ? new Date(profile.created_at) : now,
    updatedAt: profile?.updated_at ? new Date(profile.updated_at) : now,
    lastLogin: now,
  };
}

async function getProfile(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCurrentUser() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const profile = await getProfile(data.user.id);
  return buildUserFromProfile(data.user, profile);
}

export async function signInWithEmail(data: UserSignIn) {
  const supabase = createSupabaseBrowserClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email.trim().toLowerCase(),
    password: data.password,
  });

  if (error || !authData.user) {
    return {
      success: false,
      message: "E-mail ou senha incorretos.",
    };
  }

  const profile = await getProfile(authData.user.id);
  return {
    success: true,
    user: buildUserFromProfile(authData.user, profile),
  };
}

export async function signUpWithEmail(data: UserSignUp) {
  const supabase = createSupabaseBrowserClient();
  const email = data.email.trim().toLowerCase();

  if (data.password.length < 6) {
    return {
      success: false,
      message: "A senha deve ter pelo menos 6 caracteres.",
    };
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        phone: data.phone,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: translateAuthError(error.message),
    };
  }

  if (!authData.user) {
    return {
      success: true,
      message: "Cadastro iniciado. Confira seu e-mail para confirmar a conta.",
    };
  }

  const profileResponse = await ensureCustomerProfileAction({
    userId: authData.user.id,
    email,
    name: data.name,
    phone: data.phone,
  });

  if (!profileResponse.success) {
    return {
      success: false,
      message: profileResponse.message,
    };
  }

  if (!authData.session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (signInError || !signInData.user) {
      return {
        success: true,
        message: "Cadastro criado. Entre com seu e-mail e senha para acessar sua conta.",
      };
    }

    const profile = await getProfile(signInData.user.id);
    return {
      success: true,
      user: buildUserFromProfile(signInData.user, profile),
    };
  }

  const profile = await getProfile(authData.user.id);
  return {
    success: true,
    user: buildUserFromProfile(authData.user, profile),
  };
}

export async function signOutFromSupabase() {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}
