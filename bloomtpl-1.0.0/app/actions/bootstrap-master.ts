"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

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

  const masterEmail = process.env.MASTER_BOOTSTRAP_EMAIL;
  const masterPassword = process.env.MASTER_BOOTSTRAP_PASSWORD;
  const masterName = process.env.MASTER_BOOTSTRAP_NAME ?? "Admin";

  if (!masterEmail || !masterPassword) {
    return {
      success: false,
      message:
        "Bootstrap master sem credenciais. Defina MASTER_BOOTSTRAP_EMAIL e MASTER_BOOTSTRAP_PASSWORD no .env.local.",
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const existingUser = await findUserByEmail(masterEmail);

    const { data, error } = existingUser
      ? await supabase.auth.admin.updateUserById(existingUser.id, {
          password: masterPassword,
          email_confirm: true,
          user_metadata: {
            name: masterName,
          },
        })
      : await supabase.auth.admin.createUser({
          email: masterEmail,
          password: masterPassword,
          email_confirm: true,
          user_metadata: {
            name: masterName,
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
      email: masterEmail,
      name: masterName,
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
