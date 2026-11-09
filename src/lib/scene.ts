import type { Operation, PublicQuestionContent } from "./questions/types";

export type SceneMode = "groups" | "pile";

/** Divisão começa como monte (não revela a resposta); multiplicação, em grupos. */
export function sceneModeBefore(operation: Operation): SceneMode {
  return operation === "division" ? "pile" : "groups";
}

function makeBlocks(count: number): HTMLElement[] {
  return Array.from({ length: count }, () => {
    const block = document.createElement("span");
    block.className = "block";
    return block;
  });
}

/** Desenha a cena de blocos dentro do elemento `.scene`. */
export function renderScene(
  el: HTMLElement,
  scene: PublicQuestionContent["scene"],
  mode: SceneMode,
): void {
  const perGroup = scene.per_group ?? 0;
  const total = scene.total ?? scene.groups * perGroup;

  el.replaceChildren();
  el.removeAttribute("data-anim");
  el.dataset.mode = mode;

  if (mode === "pile") {
    const pile = document.createElement("div");
    pile.className = "pile";
    pile.append(...makeBlocks(total));
    el.append(pile);
    el.setAttribute("aria-label", `${total} itens juntos`);
    return;
  }

  for (let g = 0; g < scene.groups; g++) {
    const group = document.createElement("div");
    group.className = "group";
    group.style.setProperty("--i", String(g));
    group.append(...makeBlocks(perGroup));
    el.append(group);
  }
  el.setAttribute("aria-label", `${scene.groups} grupos com ${perGroup} itens em cada`);
}