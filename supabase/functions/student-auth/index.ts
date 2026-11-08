import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

async function makeInternalEmail(nickname: string): Promise<string> {
  const normalized = nickname.trim().normalize("NFKC").toLowerCase();
  const bytes = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  const hashHex = Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `student-${hashHex.slice(0, 32)}@students.gamemath.invalid`;
}

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return json({ error: "Método não permitido." }, 405);
    }

    let body: {
      nickname?: unknown;
      pin?: unknown;
      teacherCode?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return json({ error: "Envie os dados do cadastro em formato JSON." }, 400);
    }

    const nickname =
      typeof body.nickname === "string" ? body.nickname.trim() : "";
    const pin = typeof body.pin === "string" ? body.pin : "";
    const teacherCode =
      typeof body.teacherCode === "string"
        ? body.teacherCode.trim().toUpperCase()
        : "";

    if (nickname.length < 1 || nickname.length > 30) {
      return json({ error: "O apelido deve ter de 1 a 30 caracteres." }, 400);
    }

    if (!/^\d{6}$/.test(pin)) {
      return json({ error: "O PIN deve ter exatamente 6 números." }, 400);
    }

    if (!teacherCode) {
      return json({ error: "Informe o código do professor." }, 400);
    }

    const admin = ctx.supabaseAdmin;

    const { data: codeRow, error: codeError } = await admin
      .from("teacher_codes")
      .select("teacher_id")
      .eq("code", teacherCode)
      .eq("active", true)
      .maybeSingle();

    if (codeError) {
      console.error("Erro ao consultar código do professor:", codeError);
      return json({ error: "Não foi possível validar o código agora." }, 500);
    }

    if (!codeRow) {
      return json({ error: "Código do professor inválido ou inativo." }, 400);
    }

    const { data: teacher, error: teacherError } = await admin
      .from("profiles")
      .select("user_id")
      .eq("user_id", codeRow.teacher_id)
      .eq("role", "teacher")
      .maybeSingle();

    if (teacherError || !teacher) {
      console.error("Perfil do professor inválido:", teacherError);
      return json({ error: "O código não está ligado a um perfil de professor." }, 400);
    }

    const email = await makeInternalEmail(nickname);

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password: pin,
        email_confirm: true,
        user_metadata: { nickname },
      });

    if (createError || !created.user) {
      console.error("Erro ao criar conta do aluno:", createError);
      return json(
        { error: "Não foi possível criar a conta. Verifique se o apelido já está em uso." },
        409,
      );
    }

    const studentId = created.user.id;

    const { error: profileError } = await admin.from("profiles").insert({
      user_id: studentId,
      role: "student",
      nickname,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(studentId);
      console.error("Erro ao criar perfil do aluno:", profileError);

      if (profileError.code === "23505") {
        return json({ error: "Esse apelido já está em uso." }, 409);
      }

      return json({ error: "Não foi possível salvar o perfil do aluno." }, 500);
    }

    const { error: linkError } = await admin
      .from("student_teacher_links")
      .insert({
        student_id: studentId,
        teacher_id: codeRow.teacher_id,
      });

    if (linkError) {
      await admin.auth.admin.deleteUser(studentId);
      console.error("Erro ao vincular aluno ao professor:", linkError);
      return json({ error: "Não foi possível criar o vínculo com o professor." }, 500);
    }

    return json({
      ok: true,
      message: "Conta criada e vinculada ao professor.",
    });
  }),
};