import type { FeedbackAnimation } from "./questions/types";

/** As animações do banco, mais "celebrate", usada só quando a criança acerta. */
export type SceneAnimation = FeedbackAnimation | "celebrate";

const DURATION_MS: Record<SceneAnimation, number> = {
  soft_shake: 700,
  merge_blocks: 1600,
  regroup: 1500,
  extra_item_each_group: 1800,
  celebrate: 1200,
  none: 0,
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Acrescenta um bloco destacado em cada grupo (erro de "um a mais"). */
function addExtraBlocks(scene: HTMLElement): HTMLElement[] {
  return Array.from(scene.querySelectorAll<HTMLElement>(".group")).map((group) => {
    const extra = document.createElement("span");
    extra.className = "block block--extra";
    group.appendChild(extra);
    return extra;
  });
}

/** Toca a animação na cena e devolve uma Promise que resolve quando termina. */
export function playFeedback(
  scene: HTMLElement,
  animation: SceneAnimation,
): Promise<void> {
  scene.removeAttribute("data-anim");

  // Sem animação (ou movimento reduzido): o texto do feedback segue sendo mostrado.
  if (animation === "none" || prefersReducedMotion()) {
    return Promise.resolve();
  }

  void scene.offsetWidth; // força o navegador a reiniciar a animação

  const extras = animation === "extra_item_each_group" ? addExtraBlocks(scene) : [];
  if (animation !== "extra_item_each_group") {
    scene.setAttribute("data-anim", animation);
  }

  // Dá a cada bloco um índice, usado no atraso do "celebrate".
  scene.querySelectorAll<HTMLElement>(".block").forEach((block, i) => {
    block.style.setProperty("--i", String(i));
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      extras.forEach((el) => el.remove());
      scene.removeAttribute("data-anim");
      resolve();
    }, DURATION_MS[animation]);
  });
}