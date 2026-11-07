import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(new URL("../content/questions/", import.meta.url));

const OPERATIONS = { mult: "multiplication", div: "division" };
const LEVELS = { facil: "easy", medio: "medium", dificil: "hard" };

const [opArg, levelArg] = process.argv.slice(2);
if (!OPERATIONS[opArg] || !LEVELS[levelArg]) {
  console.error("Uso: npm run questions:new -- <mult|div> <facil|medio|dificil>");
  process.exit(1);
}

// Descobre o próximo número livre (considera arquivos prontos e rascunhos).
const prefix = `${opArg}-${levelArg}-`;
const used = readdirSync(DIR)
  .map((f) => f.replace(/^_rascunho-/, ""))
  .filter((f) => f.startsWith(prefix))
  .map((f) => parseInt(f.slice(prefix.length), 10))
  .filter(Number.isFinite);
const number = String(Math.max(0, ...used) + 1).padStart(3, "0");

const question = JSON.parse(readFileSync(join(DIR, "_modelo.json"), "utf8"));
question.id = randomUUID();
question.operation = OPERATIONS[opArg];
question.difficulty = LEVELS[levelArg];

// O modelo vem com erros típicos de multiplicação; na divisão trocamos pelos de divisão.
if (opArg === "div") {
  question.answer_key.check.op = "/";
  const { a, c } = question.answer_key.distractors;
  a.error_type = "subtracted_instead_of_divided";
  a.feedback.animation = "regroup";
  c.error_type = "multiplied_instead_of_divided";
  c.feedback.animation = "regroup";
}

const file = join(DIR, `_rascunho-${prefix}${number}.json`);
if (existsSync(file)) {
  console.error(`Já existe: ${file}`);
  process.exit(1);
}
writeFileSync(file, JSON.stringify(question, null, 2) + "\n", "utf8");
console.log(`✓ Rascunho criado: content/questions/_rascunho-${prefix}${number}.json`);
console.log(`  Quando estiver pronto, renomeie para ${prefix}${number}.json`);