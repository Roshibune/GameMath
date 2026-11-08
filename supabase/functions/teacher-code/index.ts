import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

function createCode(): string {
  const randomValues = crypto.getRandomValues(new Uint32Array(10));

  return Array.from(randomValues, (value) =>
    ALPHABET[value % ALPHABET.length]
  ).join("");
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return json({ error: "Método não permitido." }, 405);
    }

    const userId = ctx.userClaims?.id;

    if (!userId) {
      return json({ error: "Faça login para acessar esta função." }, 401);
    }

    const admin = ctx.supabaseAdmin;

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Erro ao consultar perfil:", profileError);
      return json({ error: "Não foi possível validar o perfil." }, 500);
    }

    if (profile?.role !== "teacher") {
      return json({ error: "Esta função é exclusiva para professores." }, 403);
    }

    const { data: currentCode, error: codeLookupError } = await admin
      .from("teacher_codes")
      .select("code")
      .eq("teacher_id", userId)
      .eq("active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (codeLookupError) {
      console.error("Erro ao consultar código do professor:", codeLookupError);
      return json({ error: "Não foi possível consultar o código." }, 500);
    }

    if (currentCode) {
      return json({ code: currentCode.code });
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      const code = createCode();

      const { data: createdCode, error: createError } = await admin
        .from("teacher_codes")
        .insert({ code, teacher_id: userId })
        .select("code")
        .single();

      if (!createError && createdCode) {
        return json({ code: createdCode.code });
      }

      // Se outra chamada criou o código ao mesmo tempo, devolve o ativo.
      if (createError?.code === "23505") {
        const { data: racedCode } = await admin
          .from("teacher_codes")
          .select("code")
          .eq("teacher_id", userId)
          .eq("active", true)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (racedCode) {
          return json({ code: racedCode.code });
        }

        // Se o código aleatório colidiu com o de outro professor, tenta de novo.
        continue;
      }

      console.error("Erro ao criar código do professor:", createError);
      return json({ error: "Não foi possível criar o código." }, 500);
    }

    return json({ error: "Tente gerar o código novamente." }, 503);
  }),
};