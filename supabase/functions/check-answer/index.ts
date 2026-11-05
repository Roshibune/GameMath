// supabase/functions/check-answer/index.ts
//
// Valida a resposta de uma pergunta no servidor. O gabarito (answer_key)
// nunca é enviado ao navegador: só esta função, usando a service role key,
// pode ler a tabela question_answers.
//
// Entrada (POST, JSON): { question_id: string, option_id: string }
// Saída: AnswerResult (ver src/lib/questions/types.ts)

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Faltou o token de autenticação." }, 401);
    }

    // Cliente "do usuário": só serve para confirmar quem está pedindo.
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: "Sessão inválida." }, 401);
    }

    const { question_id, option_id } = await req.json();
    if (!question_id || !option_id) {
      return json({ error: "question_id e option_id são obrigatórios." }, 400);
    }

    // Cliente "de servidor": única peça do sistema que pode ler o gabarito.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: answer, error: answerError } = await adminClient
      .from("question_answers")
      .select("answer_key, explanation")
      .eq("question_id", question_id)
      .single();

    if (answerError || !answer) {
      return json({ error: "Pergunta não encontrada." }, 404);
    }

    const answerKey = answer.answer_key as {
      correct_option_id: string;
      distractors: Record<
        string,
        { feedback: { message: string; animation: string } }
      >;
    };

    const correct = option_id === answerKey.correct_option_id;
    const feedback = correct
      ? undefined
      : answerKey.distractors?.[option_id]?.feedback;

    return json({
      correct,
      explanation: answer.explanation,
      ...(feedback ? { feedback } : {}),
    });
  } catch (err) {
    console.error(err);
    return json({ error: "Erro inesperado ao validar a resposta." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
