"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

type EnsureCustomerProfileInput = {
  userId: string;
  email: string;
  name: string;
  phone?: string;
};

export async function ensureCustomerProfileAction(input: EnsureCustomerProfileInput) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("profiles").upsert({
      id: input.userId,
      email: input.email,
      name: input.name,
      phone: input.phone ?? null,
      role: "customer",
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      message: "Não foi possível preparar o perfil do usuário.",
    };
  }
}
