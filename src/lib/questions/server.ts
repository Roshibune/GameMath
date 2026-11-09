import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { GAME_SIZE } from "./api";
import type {
  AnswerResult,
  AttemptResult,
  Operation,
  SubmittedAnswer,
} from "./types";

/**
 * As Edge Functions respondem erros como { "error": "mensagem" }.
 * O invoke() guarda essa resposta dentro do erro; aqui tiramos o texto de lá.
 */
async function readFunctionError(error: unknown, fallback: string): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (typeof body?.error === "string") return body.error;
      if (typeof body?.message === "string") return body.message;
    } catch {
      // resposta sem JSON: usa a mensagem padrão
    }
  }
  return fallback;
}

/**
 * Pergunta ao servidor se a alternativa escolhida está certa.
 * Devolve a explicação e, se errou, o feedback específico do distrator.
 * O gabarito nunca chega ao navegador.
 */
export async function checkAnswer(
  questionId: string,
  optionId: string,
): Promise<AnswerResult> {
  const { data, error } = await supabase.functions.invoke("check-answer", {
    body: { question_id: questionId, option_id: optionId },
  });

  if (error) {
    console.error("Erro em check-answer:", error);
    throw new Error(
      await readFunctionError(error, "Não foi possível conferir a resposta."),
    );
  }

  return data as AnswerResult;
}

/**
 * Envia as respostas da partida inteira. O servidor calcula a pontuação.
 * O navegador não envia (nem calcula) nenhum número de acertos.
 */
export async function submitAttempt(
  operation: Operation,
  answers: SubmittedAnswer[],
): Promise<AttemptResult> {
  if (answers.length !== GAME_SIZE) {
    throw new Error(`A partida precisa ter ${GAME_SIZE} respostas.`);
  }

  const { data, error } = await supabase.functions.invoke("submit-attempt", {
    body: { operation, answers },
  });

  if (error) {
    console.error("Erro em submit-attempt:", error);
    throw new Error(
      await readFunctionError(error, "Não foi possível salvar a partida."),
    );
  }

  return data as AttemptResult;
}