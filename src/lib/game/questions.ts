import { supabase } from "../supabase";
import type { Operation, PublicQuestionContent } from "../questions/types";

export interface ActiveQuestion {
  id: string;
  prompt: string;
  question_type: string;
  content: PublicQuestionContent;
}

/** Busca as perguntas ativas de uma operação. Nunca traz o gabarito. */
export async function fetchActiveQuestions(
  operation: Operation,
  limit = 10,
): Promise<ActiveQuestion[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, prompt, question_type, content")
    .eq("operation", operation)
    .eq("is_active", true)
    .limit(limit);

  if (error) throw error;

  // Embaralha no cliente para não repetir sempre a mesma ordem.
  return (data ?? []).sort(() => Math.random() - 0.5) as ActiveQuestion[];
}
