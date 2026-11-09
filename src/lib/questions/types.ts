export type Operation = "multiplication" | "division";
export type Difficulty = "easy" | "medium" | "hard";

export type ErrorType =
  | "added_instead_of_multiplied"
  | "adjacent_table_fact"
  | "multiplied_instead_of_divided"
  | "subtracted_instead_of_divided"
  | "divisor_dividend_confusion"
  | "other";

export type FeedbackAnimation =
  | "merge_blocks"
  | "extra_item_each_group"
  | "regroup"
  | "soft_shake"
  | "none";

/** Vai para o navegador (coluna questions.content). Nunca coloque gabarito aqui. */
export interface PublicQuestionContent {
  schema_version: 1;
  scene: {
    theme: string;
    groups: number;
    per_group: number | null;
    total?: number;
  };
  options: { id: string; text: string; image?: string }[];
}

/** Só o servidor lê (coluna question_answers.answer_key). */
export interface AnswerKey {
  correct_option_id: string;
  check: { a: number; b: number; op: "*" | "/" };
  distractors: Record<
    string,
    {
      error_type: ErrorType;
      feedback: { message: string; animation: FeedbackAnimation };
    }
  >;
}

/** Retorno esperado da validação no servidor (a combinar com Integrantes 1 e 2). */
export interface AnswerResult {
  correct: boolean;
  explanation: string;
  feedback?: { message: string; animation: FeedbackAnimation };
}

/** Questão como o navegador a recebe do banco. Não tem gabarito. */
export interface PublicQuestion {
  id: string;
  operation: Operation;
  difficulty: Difficulty;
  question_type: "multiple_choice";
  prompt: string;
  content: PublicQuestionContent;
}