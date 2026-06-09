"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

const MASTER_EMAIL = "bernardomaia57@gmail.com";
const MASTER_PASSWORD = "bernardo57";

async function findUserByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  return data.users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase()
  );
}

export async function bootstrapMasterAccountAction() {
  if (process.env.ALLOW_MASTER_BOOTSTRAP !== "true") {
    return {
      success: false,
      message:
        "Bootstrap master desativado. Defina ALLOW_MASTER_BOOTSTRAP=true no .env.local para criar a conta de teste.",
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const existingUser = await findUserByEmail(MASTER_EMAIL);

    const { data, error } = existingUser
      ? await supabase.auth.admin.updateUserById(existingUser.id, {
          password: MASTER_PASSWORD,
          email_confirm: true,
          user_metadata: {
            name: "Bernardo Maia",
          },
        })
      : await supabase.auth.admin.createUser({
          email: MASTER_EMAIL,
          password: MASTER_PASSWORD,
          email_confirm: true,
          user_metadata: {
            name: "Bernardo Maia",
          },
        });

    if (error || !data.user) {
      return {
        success: false,
        message: error?.message ?? "Não foi possível criar a conta master.",
      };
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email: MASTER_EMAIL,
      name: "Bernardo Maia",
      role: "admin",
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      return {
        success: false,
        message: profileError.message,
      };
    }

    return {
      success: true,
      message: existingUser
        ? "Conta master atualizada como admin."
        : "Conta master criada como admin.",
    };
  } catch {
    return {
      success: false,
      message:
        "Não foi possível executar o bootstrap. Confira as variáveis do Supabase no .env.local.",
    };
  }
}
