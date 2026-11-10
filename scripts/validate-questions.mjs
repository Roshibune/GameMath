import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(new URL("../content/questions/", import.meta.url));

const OPERATIONS = ["multiplication", "division"];
const DIFFICULTIES = ["easy", "medium", "hard"];
const QUESTION_TYPES = ["multiple_choice"];
const ERROR_TYPES = [
  "added_instead_of_multiplied",
  "adjacent_table_fact",
  "multiplied_instead_of_divided",
  "subtracted_instead_of_divided",
  "divisor_dividend_confusion",
  "other",
];
const ANIMATIONS = ["merge_blocks", "extra_item_each_group", "regroup", "soft_shake", "none"];
// Chaves que nunca podem aparecer em content (vai para o navegador).
const FORBIDDEN_PUBLIC_KEYS = [
  "answer_key", "correct_option_id", "feedback", "error_type", "explanation", "is_correct", "check",
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_MESSAGE = 120;

function findForbiddenKeys(value, path = "content") {
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => findForbiddenKeys(v, `${path}[${i}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) =>
      (FORBIDDEN_PUBLIC_KEYS.includes(k) ? [`${path}.${k}`] : []).concat(findForbiddenKeys(v, `${path}.${k}`)),
    );
  }
  return [];
}

// Confere se o número de uma alternativa errada combina com o tipo de erro declarado.
// Devolve um texto descrevendo o problema, ou null se estiver coerente.
function checkDistractorValue(errorType, value, a, b, op) {
  if (errorType === "other") return null; // "other" é a saída livre: não conferimos
  if (!Number.isFinite(value) || !Number.isFinite(a) || !Number.isFinite(b)) return null;

  const rules = {
    added_instead_of_multiplied: { op: "*", valid: [a + b] },
    multiplied_instead_of_divided: { op: "/", valid: [a * b] },
    subtracted_instead_of_divided: { op: "/", valid: [a - b] },
    divisor_dividend_confusion: { op: "/", valid: [b] },
    adjacent_table_fact: {
      op: null, // vale para as duas operações
      valid:
        op === "*"
          ? [(a + 1) * b, (a - 1) * b, a * (b + 1), a * (b - 1)] // um grupo ou item a mais/menos
          : [a / b + 1, a / b - 1], // resultado um a mais/menos
    },
  };

  const rule = rules[errorType];
  if (!rule) return null; // tipo desconhecido já é reportado em outro ponto

  if (rule.op && rule.op !== op) {
    return `error_type "${errorType}" só vale para contas com "${rule.op}", mas esta usa "${op}"`;
  }
  if (!rule.valid.includes(value)) {
    return `o valor ${value} não combina com "${errorType}" (esperado: ${rule.valid.join(" ou ")})`;
  }
  return null;
}

export function validateQuestion(q) {
  const errors = [];
  const err = (msg) => errors.push(msg);

  if (!UUID.test(q.id ?? "")) err("id deve ser um UUID válido");
  if (!OPERATIONS.includes(q.operation)) err(`operation inválida: ${q.operation}`);
  if (!DIFFICULTIES.includes(q.difficulty)) err(`difficulty inválida: ${q.difficulty}`);
  if (!QUESTION_TYPES.includes(q.question_type)) err(`question_type não suportado ainda: ${q.question_type}`);
  if (typeof q.is_active !== "boolean") err("is_active deve ser true ou false");
  if (!q.prompt?.trim()) err("prompt vazio");
  if (!q.explanation?.trim()) err("explanation vazia");

  const content = q.content;
  const key = q.answer_key;
  if (!content || !key) {
    err("content e answer_key são obrigatórios");
    return errors;
  }

  for (const p of findForbiddenKeys(content)) err(`vazamento de gabarito em ${p} (content vai para o navegador)`);

  const options = content.options ?? [];
  if (options.length < 3 || options.length > 4) err("use 3 ou 4 alternativas");
  const ids = options.map((o) => o.id);
  if (new Set(ids).size !== ids.length) err("ids de alternativas repetidos");
  const texts = options.map((o) => String(o.text).trim());
  if (new Set(texts).size !== texts.length) err("alternativas com texto repetido");

  if (!ids.includes(key.correct_option_id)) {
    err(`correct_option_id "${key.correct_option_id}" não existe nas alternativas`);
  }

  // Confere a conta: a alternativa correta precisa bater com check.
  const { a, b, op } = key.check ?? {};
  const expected = op === "*" ? a * b : op === "/" ? a / b : NaN;
  if (!Number.isInteger(expected)) {
    err("check inválido (use op '*' ou '/' com resultado inteiro)");
  } else {
    const correct = options.find((o) => o.id === key.correct_option_id);
    if (correct && Number(correct.text) !== expected) {
      err(`alternativa correta é "${correct.text}", mas ${a} ${op} ${b} = ${expected}`);
    }
  }

  // Todo distrator precisa de erro intencional + feedback; o correto não pode ter.
  const distractors = key.distractors ?? {};
  for (const id of ids) {
    if (id === key.correct_option_id) {
      if (distractors[id]) err(`a alternativa correta "${id}" não pode ter distrator`);
      continue;
    }
    const d = distractors[id];
    if (!d) { err(`alternativa "${id}" sem distrator intencional`); continue; }
    if (!ERROR_TYPES.includes(d.error_type)) err(`"${id}": error_type inválido (${d.error_type})`);
    if (!d.feedback?.message?.trim()) err(`"${id}": feedback.message vazio`);
    else if (d.feedback.message.length > MAX_MESSAGE) err(`"${id}": mensagem acima de ${MAX_MESSAGE} caracteres`);
    if (!ANIMATIONS.includes(d.feedback?.animation)) err(`"${id}": animation inválida (${d.feedback?.animation})`);
    const option = options.find((o) => o.id === id);
    const problem = checkDistractorValue(d.error_type, Number(option?.text), a, b, op);
    if (problem) err(`"${id}": ${problem}`);}
    for (const id of Object.keys(distractors)) {
    if (!ids.includes(id)) err(`distrator "${id}" não corresponde a nenhuma alternativa`);
  }

  return errors;
}

// Execução via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  let failed = 0;
  const seenIds = new Map();

  for (const file of files) {
    let q;
    try {
      q = JSON.parse(readFileSync(join(DIR, file), "utf8"));
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
      console.log(`✓ ${file}`);
    }
  }

  console.log(`\n${files.length - failed}/${files.length} questões válidas.`);
  process.exit(failed ? 1 : 0);
}