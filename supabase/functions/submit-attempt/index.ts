import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type SubmittedAnswer = {
  question_id: string;
  option_id: string;
};

type AnswerKey = {
  correct_option_id?: unknown;
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
    const operation = body.operation;
    const rawAnswers = body.answers;

    if (operation !== "multiplication" && operation !== "division") {
      return json({ error: "A operação informada é inválida." }, 400);
    }

    // O banco atual tem cinco questões por operação.
    if (!Array.isArray(rawAnswers) || rawAnswers.length !== 5) {
      return json({ error: "A partida deve conter cinco respostas." }, 400);
    }

    const answers: SubmittedAnswer[] = [];

    for (const item of rawAnswers) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return json({ error: "Uma das respostas está inválida." }, 400);
      }

      const answer = item as Record<string, unknown>;

      if (
        typeof answer.question_id !== "string" ||
        !UUID.test(answer.question_id) ||
        typeof answer.option_id !== "string" ||
        answer.option_id.length < 1 ||
        answer.option_id.length > 80
      ) {
        return json({ error: "Uma das respostas está inválida." }, 400);
      }

      answers.push({
        question_id: answer.question_id,
        option_id: answer.option_id,
      });
    }

    const questionIds = answers.map((answer) => answer.question_id);

    if (new Set(questionIds).size !== questionIds.length) {
      return json({ error: "A partida contém questões repetidas." }, 400);
    }

    const userId = ctx.userClaims?.id;

    if (!userId) {
      return json({ error: "Faça login para salvar a partida." }, 401);
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

    if (profile?.role !== "student") {
      return json({ error: "Esta função é exclusiva para alunos." }, 403);
    }

    const { data: questions, error: questionsError } = await admin
      .from("questions")
      .select("id, operation, question_type, is_active, content")
      .in("id", questionIds);

    if (questionsError) {
      console.error("Erro ao consultar questões:", questionsError);
      return json({ error: "Não foi possível consultar as questões." }, 500);
    }

    if (!questions || questions.length !== answers.length) {
      return json({ error: "Uma ou mais questões não foram encontradas." }, 400);
    }

    const questionById = new Map(questions.map((question) => [
      question.id,
      question,
    ]));

    for (const answer of answers) {
      const question = questionById.get(answer.question_id);

      if (
        !question ||
        !question.is_active ||
        question.operation !== operation ||
        question.question_type !== "multiple_choice"
      ) {
        return json(
          { error: "A partida contém uma questão inválida para essa operação." },
          400,
        );
      }

      const content = question.content as { options?: unknown } | null;
      const options = Array.isArray(content?.options) ? content.options : [];

      const optionExists = options.some((option) => {
        if (!option || typeof option !== "object") return false;
        return (option as { id?: unknown }).id === answer.option_id;
      });

      if (!optionExists) {
        return json(
          { error: "Uma alternativa não pertence à questão informada." },
          400,
        );
      }
    }

    const { data: answerRows, error: answerError } = await admin
      .from("question_answers")
      .select("question_id, answer_key")
      .in("question_id", questionIds);

    if (answerError) {
      console.error("Erro ao consultar gabaritos:", answerError);
      return json({ error: "Não foi possível calcular o resultado." }, 500);
    }

    if (!answerRows || answerRows.length !== answers.length) {
      return json({ error: "Falta o gabarito de uma ou mais questões." }, 500);
    }

    const keyByQuestionId = new Map(
      answerRows.map((row) => [
        row.question_id,
        row.answer_key as AnswerKey,
      ]),
    );

    let correctAnswers = 0;

    for (const answer of answers) {
      const key = keyByQuestionId.get(answer.question_id);

      if (typeof key?.correct_option_id !== "string") {
        console.error("Formato inválido no gabarito.");
        return json({ error: "Os dados de uma questão estão incompletos." }, 500);
      }

      if (answer.option_id === key.correct_option_id) {
        correctAnswers++;
      }
    }

    const { data: attempt, error: insertError } = await admin
      .from("game_attempts")
      .insert({
        student_id: userId,
        operation,
        difficulty: "mixed",
        total_questions: answers.length,
        correct_answers: correctAnswers,
      })
      .select("id, completed_at")
      .single();

    if (insertError || !attempt) {
      console.error("Erro ao salvar partida:", insertError);
      return json({ error: "Não foi possível salvar a partida." }, 500);
    }

    return json({
      ok: true,
      attempt_id: attempt.id,
      total_questions: answers.length,
      correct_answers: correctAnswers,
      completed_at: attempt.completed_at,
    });
  }),
};