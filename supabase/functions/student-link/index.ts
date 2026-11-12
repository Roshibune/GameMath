import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return json({ error: "Método não permitido." }, 405);
    }

    const studentId = ctx.userClaims?.id;

    if (!studentId) {
      return json({ error: "Faça login para continuar." }, 401);
    }

    let body: {
      action?: unknown;
      teacherCode?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return json({ error: "Envie os dados em formato JSON." }, 400);
    }

    const action = typeof body.action === "string" ? body.action : "";
    const admin = ctx.supabaseAdmin;

    const { data: student, error: studentError } = await admin
      .from("profiles")
      .select("user_id")
      .eq("user_id", studentId)
      .eq("role", "student")
      .maybeSingle();

    if (studentError) {
      console.error("Erro ao consultar perfil do aluno:", studentError);
      return json({ error: "Não foi possível verificar seu perfil agora." }, 500);
    }

    if (!student) {
      return json({ error: "Esta função está disponível apenas para alunos." }, 403);
    }

    if (action === "status") {
      const { data: link, error: linkError } = await admin
        .from("student_teacher_links")
        .select("teacher_id, linked_at")
        .eq("student_id", studentId)
        .is("unlinked_at", null)
        .maybeSingle();

      if (linkError) {
        console.error("Erro ao consultar vínculo atual:", linkError);
        return json({ error: "Não foi possível consultar seu vínculo agora." }, 500);
      }

      if (!link) {
        return json({ linked: false });
      }

      const { data: teacher, error: teacherError } = await admin
        .from("profiles")
        .select("nickname")
        .eq("user_id", link.teacher_id)
        .eq("role", "teacher")
        .maybeSingle();

      if (teacherError || !teacher) {
        console.error("Erro ao consultar perfil do professor:", teacherError);
        return json({ error: "Não foi possível encontrar o professor vinculado." }, 500);
      }

      return json({
        linked: true,
        teacherNickname: teacher.nickname,
        linkedAt: link.linked_at,
      });
    }

    if (action === "unlink") {
      const { data: link, error: unlinkError } = await admin
        .from("student_teacher_links")
        .update({ unlinked_at: new Date().toISOString() })
        .eq("student_id", studentId)
        .is("unlinked_at", null)
        .select("id")
        .maybeSingle();

      if (unlinkError) {
        console.error("Erro ao desvincular aluno:", unlinkError);
        return json({ error: "Não foi possível encerrar o vínculo agora." }, 500);
      }

      if (!link) {
        return json({ error: "Você não tem um vínculo ativo com um professor." }, 404);
      }

      return json({ ok: true, message: "Vínculo encerrado." });
    }

    if (action === "link") {
      const teacherCode =
        typeof body.teacherCode === "string"
          ? body.teacherCode.trim().toUpperCase()
          : "";

      if (!teacherCode) {
        return json({ error: "Informe o código do professor." }, 400);
      }

      const { data: currentLink, error: currentLinkError } = await admin
        .from("student_teacher_links")
        .select("id")
        .eq("student_id", studentId)
        .is("unlinked_at", null)
        .maybeSingle();

      if (currentLinkError) {
        console.error("Erro ao consultar vínculo atual:", currentLinkError);
        return json({ error: "Não foi possível verificar seu vínculo agora." }, 500);
      }

      if (currentLink) {
        return json(
          { error: "Encerre seu vínculo atual antes de escolher outro professor." },
          409,
        );
    }

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

      if (teacherError) {
        console.error("Erro ao consultar perfil do professor:", teacherError);
        return json({ error: "Não foi possível verificar o professor agora." }, 500);
      }

      if (!teacher) {
        return json({ error: "O código não está ligado a um perfil de professor." }, 400);
      }

      const { error: insertError } = await admin
        .from("student_teacher_links")
        .insert({
          student_id: studentId,
          teacher_id: codeRow.teacher_id,
        });

      if (insertError) {
        console.error("Erro ao criar vínculo:", insertError);

        if (insertError.code === "23505") {
          return json(
            { error: "Você já tem um vínculo ativo. Encerre-o antes de trocar." },
            409,
          );
        }

        return json({ error: "Não foi possível criar o vínculo agora." }, 500);
      }

      return json({ ok: true, message: "Vínculo criado com o professor." });
    }

    return json(
      { error: "Ação inválida. Use 'link' ou 'unlink'." },
      400,
    );
  }),
};