import type { AnswerResult } from "./questions/types";
import type { SceneAnimation } from "./feedback";

/**
 * Textos de feedback mostrados à criança. São públicos (não contêm gabarito):
 * só aparecem DEPOIS de o servidor dizer se a resposta estava certa.
 * Regras: português do Brasil, tom acolhedor, nada de "errou"/"incorreto",
 * frases curtas (a criança tem 9 a 10 anos).
 */

const CORRECT_MESSAGES = [
  "Muito bem! Você acertou!",
  "Isso aí! Resposta certa!",
  "Mandou bem! Continue assim!",
  "Perfeito! Você pensou direitinho!",
  "Arrasou! Essa conta não te enganou!",
  "Boa! Você descobriu a resposta!",
];

/** Usada quando a resposta está errada mas a questão não trouxe mensagem própria. */
const TRY_AGAIN_FALLBACK = "Quase lá! Vamos ver juntos como chegar na resposta.";

/** Sorteia uma mensagem de acerto, evitando repetir a anterior. */
export function pickCorrectMessage(previous?: string): string {
  const options = CORRECT_MESSAGES.filter((m) => m !== previous);
  return options[Math.floor(Math.random() * options.length)];
}

export interface DisplayFeedback {
  tone: "success" | "try-again"; // para escolher cores (verde / âmbar)
  message: string; // frase principal
  animation: SceneAnimation; // animação da cena
  explanation: string; // explicação da questão, mostrada depois
}

/** Transforma a resposta do servidor (AnswerResult) no que a tela precisa mostrar. */
export function buildFeedback(
  result: AnswerResult,
  previousCorrectMessage?: string,
): DisplayFeedback {
  if (result.correct) {
    return {
      tone: "success",
      message: pickCorrectMessage(previousCorrectMessage),
      animation: "celebrate",
      explanation: result.explanation,
    };
  }
  return {
    tone: "try-again",
    message: result.feedback?.message ?? TRY_AGAIN_FALLBACK,
    animation: result.feedback?.animation ?? "soft_shake",
    explanation: result.explanation,
  };
}

/** Mensagem do resultado final da partida. Sempre positiva, mostra o placar. */
export function buildResultMessage(correct: number, total: number): string {
  const score = `Você acertou ${correct} de ${total}.`;
  if (total <= 0) return "Partida concluída!";
  const ratio = correct / total;
  if (ratio === 1) return `Incrível! ${score} Nenhuma pegadinha te enganou!`;
  if (ratio >= 0.7) return `Muito bem! ${score} Falta pouco para acertar todas!`;
  if (ratio >= 0.4) return `Bom trabalho! ${score} Jogando de novo, você fica ainda melhor!`;
  return `Partida concluída! ${score} Cada erro ajuda a aprender. Vamos tentar de novo?`;
}