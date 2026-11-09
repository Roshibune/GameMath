import { renderScene, sceneModeBefore } from "./scene";
import type { PublicQuestion } from "./questions/types";

/** Os três elementos que a tela de pergunta precisa. */
export interface QuestionView {
  prompt: HTMLElement;
  scene: HTMLElement;
  options: HTMLElement;
}

/** Mostra uma pergunta: enunciado, cena e alternativas como botões. */
export function renderQuestion(
  view: QuestionView,
  question: PublicQuestion,
  onChoose: (optionId: string) => void,
): void {
  view.prompt.textContent = question.prompt;
  renderScene(view.scene, question.content.scene, sceneModeBefore(question.operation));
  delete view.options.dataset.locked;

  view.options.replaceChildren(
    ...question.content.options.map((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.dataset.optionId = option.id;
      button.textContent = option.text;
      button.addEventListener("click", () => {
        if (view.options.dataset.locked === "true") return; // já respondeu
        onChoose(option.id);
      });
      return button;
    }),
  );

  // Leva o foco ao enunciado: o leitor de tela lê a nova pergunta.
  view.prompt.focus();
}

/**
 * Trava as alternativas depois da resposta.
 * Usa aria-disabled (e não disabled) para o foco do teclado não se perder.
 */
export function lockOptions(view: QuestionView, chosenId: string): void {
  view.options.dataset.locked = "true";
  view.options.querySelectorAll<HTMLButtonElement>(".option").forEach((button) => {
    button.setAttribute("aria-disabled", "true");
    if (button.dataset.optionId === chosenId) button.dataset.state = "chosen";
  });
}