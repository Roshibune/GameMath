import fs from 'node:fs';
import path from 'node:path';

const questionsDir = path.join(process.cwd(), 'content', 'questions');

if (!fs.existsSync(questionsDir)) {
  console.error(`Erro: Diretório ${questionsDir} não foi encontrado.`);
  process.exit(1);
}

const files = fs.readdirSync(questionsDir).filter(file => file.endsWith('.json'));

let hasError = false;

files.forEach(file => {
  const filePath = path.join(questionsDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    JSON.parse(content);
    console.log(`✅ Ficheiro válido: ${file}`);
  } catch (err) {
    console.error(`❌ Erro de JSON no ficheiro ${file}:`, err.message);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log('\n✨ Todos os ficheiros JSON de questões são válidos!');
}