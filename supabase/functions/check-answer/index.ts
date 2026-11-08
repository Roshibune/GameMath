import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type Feedback = {
  message: string;
  animation: string;
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return json({ error: "Método não permitido." }, 405);
    }

    let payload: unknown;

    try {
      payload = await req.json();
    } catch {
      return json({ error: "Envie os dados em formato JSON." }, 400);
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      return json({ error: "Os dados enviados são inválidos." }, 400);
    }

    const body = payload as Record<string, unknown>;
    const questionId =
      typeof body.question_id === "string" ? body.question_id : "";
    const optionId =
      typeof body.option_id === "string" ? body.option_id : "";

    if (!UUID.test(questionId)) {
      return json({ error: "A questão informada é inválida." }, 400);
    }

    if (optionId.length < 1 || optionId.length > 80) {
      return json({ error: "A alternativa informada é inválida." }, 400);
    }

    const userId = ctx.userClaims?.id;

    if (!userId) {
      return json({ error: "Faça login para responder." }, 401);
    }

    // O cliente administrativo é usado apenas nesta função de servidor.
    // Ele consulta tabelas que o navegador não pode acessar.
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

    if (profile?.role !== "student") {
      return json({ error: "Esta função é exclusiva para alunos." }, 403);
    }

    const { data: question, error: questionError } = await admin
      .from("questions")
      .select("is_active, question_type, content")
      .eq("id", questionId)
      .maybeSingle();

    if (questionError) {
      console.error("Erro ao consultar questão:", questionError);
      return json({ error: "Não foi possível consultar a questão." }, 500);
    }

    if (!question || !question.is_active) {
      return json({ error: "Questão não encontrada ou inativa." }, 404);
    }

    if (question.question_type !== "multiple_choice") {
      return json({ error: "Este tipo de questão ainda não é aceito." }, 400);
    }

    const content = question.content as { options?: unknown } | null;
    const options = Array.isArray(content?.options) ? content.options : [];

    const optionExists = options.some((option) => {
      if (!option || typeof option !== "object") return false;
      return (option as { id?: unknown }).id === optionId;
    });

    if (!optionExists) {
      return json({ error: "Essa alternativa não pertence à questão." }, 400);
    }

    const { data: answer, error: answerError } = await admin
      .from("question_answers")
      .select("answer_key, explanation")
      .eq("question_id", questionId)
      .maybeSingle();

    if (answerError) {
      console.error("Erro ao consultar resposta:", answerError);
      return json({ error: "Não foi possível conferir a resposta." }, 500);
    }

    if (!answer) {
      return json({ error: "O gabarito da questão não foi encontrado." }, 500);
    }

    const answerKey = answer.answer_key as {
      correct_option_id?: unknown;
      distractors?: Record<string, { feedback?: Feedback }>;
    };

    if (
      typeof answerKey?.correct_option_id !== "string" ||
      typeof answer.explanation !== "string"
    ) {
      console.error("Formato inválido no gabarito da questão.");
      return json({ error: "Os dados da questão estão incompletos." }, 500);
    }

    const correct = optionId === answerKey.correct_option_id;
    const feedback = correct
      ? undefined
      : answerKey.distractors?.[optionId]?.feedback;

    return json({
      correct,
      explanation: answer.explanation,
      ...(feedback ? { feedback } : {}),
    });
  }),
};