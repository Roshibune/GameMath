// Gera as questões do MVP em content/questions/*.json.
// Rode uma vez: node scripts/gerar-questoes-mvp.mjs
// Depois disso os JSONs são a fonte de verdade e este script pode ser apagado.
// Os ids são fixos de propósito: rodar de novo sobrescreve, não duplica.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(new URL("../content/questions/", import.meta.url));
const uid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

// d = distratores: id da alternativa -> [tipo do erro, mensagem para a criança, animação]
const QUESTIONS = [
  {
    file: "mult-facil-002", n: 2, op: "multiplication", level: "easy",
    prompt: "A fada colheu 3 cestas de maçãs, e cada cesta tem 6 maçãs. Quantas maçãs ela colheu ao todo?",
    explanation: "3 cestas com 6 maçãs cada: 3 × 6 = 18 maçãs.",
    scene: { theme: "fairy_baskets", groups: 3, per_group: 6 },
    options: [["a", "24"], ["b", "9"], ["c", "18"], ["d", "15"]],
    correct: "c", check: [3, 6, "*"],
    d: {
      a: ["adjacent_table_fact", "Quase! Você contou uma cesta a mais. São só 3 cestas com 6 maçãs cada.", "regroup"],
      b: ["added_instead_of_multiplied", "Opa! Você somou 3 + 6. Multiplicar é juntar 3 grupos de 6 maçãs.", "merge_blocks"],
      d: ["adjacent_table_fact", "Quase lá! Faltou uma maçã em cada cesta. Conte cesta por cesta.", "extra_item_each_group"],
    },
  },
  {
    file: "mult-facil-003", n: 3, op: "multiplication", level: "easy",
    prompt: "Na sala, 4 mesas têm 3 crianças sentadas em cada uma. Quantas crianças há nas mesas?",
    explanation: "4 mesas com 3 crianças cada: 4 × 3 = 12 crianças.",
    scene: { theme: "classroom_tables", groups: 4, per_group: 3 },
    options: [["a", "12"], ["b", "7"], ["c", "16"], ["d", "15"]],
    correct: "a", check: [4, 3, "*"],
    d: {
      b: ["added_instead_of_multiplied", "Opa! Você somou 4 + 3. Multiplicar é contar 4 grupos de 3 crianças.", "merge_blocks"],
      c: ["adjacent_table_fact", "Quase! Você colocou uma criança a mais em cada mesa. Conte de novo!", "extra_item_each_group"],
      d: ["adjacent_table_fact", "Quase lá! Você contou uma mesa a mais. Eram só 4 mesas.", "regroup"],
    },
  },
  {
    file: "mult-medio-001", n: 4, op: "multiplication", level: "medium",
    prompt: "Cada caixa tem 7 lápis de cor. Quantos lápis há em 6 caixas?",
    explanation: "6 caixas com 7 lápis cada: 6 × 7 = 42 lápis.",
    scene: { theme: "pencil_boxes", groups: 6, per_group: 7 },
    options: [["a", "49"], ["b", "13"], ["c", "42"], ["d", "36"]],
    correct: "c", check: [6, 7, "*"],
    d: {
      a: ["adjacent_table_fact", "Quase! Você contou uma caixa a mais. São 6 caixas com 7 lápis cada.", "regroup"],
      b: ["added_instead_of_multiplied", "Opa! Você somou 6 + 7. Multiplicar é juntar 6 grupos de 7 lápis.", "merge_blocks"],
      d: ["adjacent_table_fact", "Quase lá! Faltou um lápis em cada caixa. Conte caixa por caixa.", "extra_item_each_group"],
    },
  },
  {
    file: "mult-medio-002", n: 5, op: "multiplication", level: "medium",
    prompt: "Cada pacote traz 9 figurinhas. Quantas figurinhas há em 3 pacotes?",
    explanation: "3 pacotes com 9 figurinhas cada: 3 × 9 = 27 figurinhas.",
    scene: { theme: "sticker_packs", groups: 3, per_group: 9 },
    options: [["a", "30"], ["b", "27"], ["c", "12"], ["d", "18"]],
    correct: "b", check: [3, 9, "*"],
    d: {
      a: ["adjacent_table_fact", "Quase! Você contou uma figurinha a mais em cada pacote. Conte de novo!", "extra_item_each_group"],
      c: ["added_instead_of_multiplied", "Opa! Você somou 9 + 3. Multiplicar é juntar 3 grupos de 9 figurinhas.", "merge_blocks"],
      d: ["adjacent_table_fact", "Quase lá! Você contou um pacote a menos. São 3 pacotes.", "regroup"],
    },
  },
  {
    file: "div-facil-002", n: 102, op: "division", level: "easy",
    prompt: "Marina tem 12 balas e quer repartir igualmente entre 3 amigos. Quantas balas cada amigo recebe?",
    explanation: "Repartindo 12 balas entre 3 amigos, cada um fica com 4 balas, porque 12 ÷ 3 = 4.",
    scene: { theme: "candy_friends", groups: 3, per_group: 4, total: 12 },
    options: [["a", "9"], ["b", "36"], ["c", "4"], ["d", "3"]],
    correct: "c", check: [12, 3, "/"],
    d: {
      a: ["subtracted_instead_of_divided", "Parece que você subtraiu (12 - 3 = 9). Dividir é repartir em partes iguais.", "regroup"],
      b: ["multiplied_instead_of_divided", "Você multiplicou (12 × 3 = 36). Dividir é repartir 12 balas entre 3 amigos.", "regroup"],
      d: ["divisor_dividend_confusion", "Atenção! O 3 é o número de amigos. Falta descobrir quantas balas cada um ganha.", "regroup"],
    },
  },
  {
    file: "div-facil-003", n: 103, op: "division", level: "easy",
    prompt: "O padeiro tem 18 pães e coloca 3 pães em cada cesta. Quantas cestas ele usa?",
    explanation: "Formando grupos de 3 com 18 pães, dá para encher 6 cestas, porque 18 ÷ 3 = 6.",
    scene: { theme: "bread_baskets", groups: 6, per_group: 3, total: 18 },
    options: [["a", "6"], ["b", "15"], ["c", "3"], ["d", "54"]],
    correct: "a", check: [18, 3, "/"],
    d: {
      b: ["subtracted_instead_of_divided", "Parece que você subtraiu (18 - 3 = 15). Dividir é formar grupos iguais.", "regroup"],
      c: ["divisor_dividend_confusion", "Atenção! O 3 é quantos pães vão em cada cesta. Queremos saber quantas cestas.", "regroup"],
      d: ["multiplied_instead_of_divided", "Você multiplicou (18 × 3 = 54). Dividir é formar grupos de 3 até acabarem os pães.", "regroup"],
    },
  },
  {
    file: "div-medio-001", n: 104, op: "division", level: "medium",
    prompt: "A loja tem 28 bolas e quer guardar todas em 4 caixas iguais. Quantas bolas vão em cada caixa?",
    explanation: "Repartindo 28 bolas em 4 caixas iguais, cada caixa fica com 7 bolas, porque 28 ÷ 4 = 7.",
    scene: { theme: "toy_boxes", groups: 4, per_group: 7, total: 28 },
    options: [["a", "24"], ["b", "7"], ["c", "32"], ["d", "4"]],
    correct: "b", check: [28, 4, "/"],
    d: {
      a: ["subtracted_instead_of_divided", "Parece que você subtraiu (28 - 4 = 24). Dividir é repartir em partes iguais.", "regroup"],
      c: ["other", "Você somou 28 + 4. Dividir é repartir as bolas em 4 caixas iguais.", "regroup"],
      d: ["divisor_dividend_confusion", "Atenção! O 4 é o número de caixas. Falta descobrir quantas bolas vão em cada uma.", "regroup"],
    },
  },
  {
    file: "div-medio-002", n: 105, op: "division", level: "medium",
    prompt: "Há 54 flores para colocar em 6 vasos, com a mesma quantidade em cada vaso. Quantas flores vão em cada vaso?",
    explanation: "Repartindo 54 flores em 6 vasos, cada vaso fica com 9 flores, porque 54 ÷ 6 = 9.",
    scene: { theme: "flower_vases", groups: 6, per_group: 9, total: 54 },
    options: [["a", "8"], ["b", "48"], ["c", "6"], ["d", "9"]],
    correct: "d", check: [54, 6, "/"],
    d: {
      a: ["adjacent_table_fact", "Quase lá! Na tabuada do 6, 6 × 8 dá 48. Faltam 6 para chegar a 54.", "regroup"],
      b: ["subtracted_instead_of_divided", "Parece que você subtraiu (54 - 6 = 48). Dividir é repartir em grupos iguais.", "regroup"],
      c: ["divisor_dividend_confusion", "Atenção! O 6 é o número de vasos. Falta descobrir quantas flores vão em cada um.", "regroup"],
    },
  },
];

mkdirSync(DIR, { recursive: true });
for (const q of QUESTIONS) {
  const json = {
    id: uid(q.n),
    operation: q.op,
    difficulty: q.level,
    question_type: "multiple_choice",
    is_active: true,
    prompt: q.prompt,
    explanation: q.explanation,
    content: {
      schema_version: 1,
      scene: q.scene,
      options: q.options.map(([id, text]) => ({ id, text })),
    },
    answer_key: {
      correct_option_id: q.correct,
      check: { a: q.check[0], b: q.check[1], op: q.check[2] },
      distractors: Object.fromEntries(
        Object.entries(q.d).map(([id, [error_type, message, animation]]) => [
          id,
          { error_type, feedback: { message, animation } },
        ]),
      ),
    },
  };
  writeFileSync(join(DIR, `${q.file}.json`), JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${q.file}.json`);
}
console.log(`\n${QUESTIONS.length} questões geradas em content/questions/`);