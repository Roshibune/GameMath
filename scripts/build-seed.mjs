import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateQuestion } from "./validate-questions.mjs";

const IN_DIR = fileURLToPath(new URL("../content/questions/", import.meta.url));
const OUT_DIR = fileURLToPath(new URL("../supabase/seeds/", import.meta.url));
const OUT_FILE = join(OUT_DIR, "questions.sql");

// Literais SQL seguros: aspas simples dobradas.
const text = (v) => `'${String(v).replaceAll("'", "''")}'`;
const jsonb = (v) => `${text(JSON.stringify(v))}::jsonb`;

const files = readdirSync(IN_DIR)
  .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  .sort();

const questions = [];
let failed = 0;
const seenIds = new Map();

for (const file of files) {
  let q;
  try {
    q = JSON.parse(readFileSync(join(IN_DIR, file), "utf8"));
  } catch (e) {
    console.error(`✗ ${file}: JSON inválido (${e.message})`);
    failed++;
    continue;
  }
  const errors = validateQuestion(q);
  if (seenIds.has(q.id)) errors.push(`id duplicado com ${seenIds.get(q.id)}`);
  seenIds.set(q.id, file);

  if (errors.length) {
    failed++;
    console.error(`✗ ${file}`);
    errors.forEach((e) => console.error(`   - ${e}`));
  } else {
    questions.push(q);
  }
}

// Não gera SQL parcial: se qualquer questão falhar, nada é escrito.
if (failed) {
  console.error(`\n${failed} arquivo(s) com problema. Nenhum SQL foi gerado.`);
  process.exit(1);
}

const blocks = questions.map((q) => `-- ${q.id}
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES (${text(q.id)}, ${text(q.operation)}, ${text(q.difficulty)}, ${text(q.question_type)}, ${text(q.prompt)}, ${jsonb(q.content)}, ${q.is_active})
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES (${text(q.id)}, ${jsonb(q.answer_key)}, ${text(q.explanation)})
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;
`);

const sql = `-- ARQUIVO GERADO por scripts/build-seed.mjs. Não edite à mão.
-- Fonte: content/questions/*.json (rode "npm run questions:build" para regenerar).
-- As questões do JSON são a fonte de verdade: is_active e demais campos
-- são sobrescritos a cada execução.

BEGIN;

${blocks.join("\n")}
COMMIT;
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, sql, "utf8");
console.log(`✓ ${questions.length} questão(ões) -> supabase/seeds/questions.sql`);