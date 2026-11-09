import { supabase } from "../supabase";
import type { Difficulty, Operation, PublicQuestion } from "./types";

/** A função submit-attempt exige exatamente 5 respostas por partida. */
export const GAME_SIZE = 5;

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

/** Embaralha uma cópia da lista (Fisher-Yates). */
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Sorteia até `size` perguntas e as ordena do fácil para o difícil.
 * A ordenação é estável: dentro do mesmo nível, vale a ordem sorteada.
 */
export function pickGameQuestions(
  all: PublicQuestion[],
  size: number = GAME_SIZE,
): PublicQuestion[] {
  return shuffle(all)
    .slice(0, size)
    .sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
}

/**
 * Busca as perguntas ativas da operação escolhida.
 * Exige aluno logado: a política do banco só libera leitura para "authenticated".
 */
export async function fetchGameQuestions(
  operation: Operation,
): Promise<PublicQuestion[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, operation, difficulty, question_type, prompt, content")
    .eq("operation", operation)
    .eq("is_active", true)
    .eq("question_type", "multiple_choice");

  if (error) {
    console.error("Erro ao buscar perguntas:", error);
    throw new Error("Não foi possível carregar as perguntas.");
  }

  return pickGameQuestions((data ?? []) as PublicQuestion[]);
}