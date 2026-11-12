import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return json({ error: "Método não permitido." }, 405);
    }

    let payload: unknown;

    try {
      payload = await req.json();
    } catch {
      return json({ error: "Envie os dados em formato JSON." }, 400);
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return json({ error: "Os dados enviados são inválidos." }, 400);
    }

    const body = payload as Record<string, unknown>;

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const nickname =
      typeof body.nickname === "string" ? body.nickname.trim() : "";
    const inviteCode =
      typeof body.inviteCode === "string"
        ? body.inviteCode.trim().toUpperCase()
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Informe um e-mail válido." }, 400);
    }

    if (password.length < 8 || password.length > 72) {
      return json({ error: "A senha deve ter entre 8 e 72 caracteres." }, 400);
    }

    if (nickname.length < 1 || nickname.length > 30) {
      return json({ error: "Informe um nome de 1 a 30 caracteres." }, 400);
    }

    if (!inviteCode) {
      return json({ error: "Informe o código convite da equipe." }, 400);
    }

    const expectedInviteCode = Deno.env.get("TEACHER_SIGNUP_CODE")
      ?.trim()
      .toUpperCase();

    if (!expectedInviteCode) {
      console.error("O segredo TEACHER_SIGNUP_CODE não foi configurado.");
      return json(
        { error: "O cadastro de professores ainda não está configurado." },
        500,
      );
    }

    if (inviteCode !== expectedInviteCode) {
      return json({ error: "Código convite inválido." }, 400);
    }

    const admin = ctx.supabaseAdmin;

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nickname },
      });

    if (createError || !created.user) {
      console.error("Erro ao criar conta de professor:", createError);
      return json(
        { error: "Não foi possível criar a conta. Verifique se esse e-mail já está cadastrado." },
        409,
      );
    }

    const { error: profileError } = await admin.from("profiles").insert({
      user_id: created.user.id,
      role: "teacher",
      nickname,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      console.error("Erro ao criar perfil de professor:", profileError);
      return json({ error: "Não foi possível salvar o perfil do professor." }, 500);
    }

    return json(
      {
        ok: true,
        message: "Conta de professor criada. Entre com seu e-mail e senha.",
      },
      201,
    );
  }),
};