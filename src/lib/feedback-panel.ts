import type { DisplayFeedback } from "./messages";

const ICONS: Record<DisplayFeedback["tone"], string> = {
  success: "✔",
  "try-again": "💡",
};

function parts(panel: HTMLElement) {
  return {
    icon: panel.querySelector<HTMLElement>("[data-feedback-icon]")!,
    message: panel.querySelector<HTMLElement>("[data-feedback-message]")!,
    explanation: panel.querySelector<HTMLElement>("[data-feedback-explanation]")!,
  };
}

/** Esvazia o painel (use ao mostrar a próxima pergunta). */
export function clearFeedback(panel: HTMLElement): void {
  const { icon, message, explanation } = parts(panel);
  panel.dataset.tone = "idle";
  icon.textContent = "";
  message.textContent = "";
  explanation.textContent = "";
}

/**
 * Mostra o feedback no painel. O painel é uma região aria-live,
 * então o leitor de tela anuncia o texto sem tirar o foco do teclado.
 */
export function renderFeedback(panel: HTMLElement, feedback: DisplayFeedback): void {
  // Limpa antes: se a mesma frase se repetir, o leitor de tela anuncia de novo.
  clearFeedback(panel);

  requestAnimationFrame(() => {
    const { icon, message, explanation } = parts(panel);
    panel.dataset.tone = feedback.tone;
    icon.textContent = ICONS[feedback.tone];
    message.textContent = feedback.message;
    explanation.textContent = feedback.explanation;
  });
}