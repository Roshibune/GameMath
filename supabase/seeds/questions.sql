-- ARQUIVO GERADO por scripts/build-seed.mjs. Não edite à mão.
-- Fonte: content/questions/*.json (rode "npm run questions:build" para regenerar).
-- As questões do JSON são a fonte de verdade: is_active e demais campos
-- são sobrescritos a cada execução.

BEGIN;

-- a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'division', 'easy', 'multiple_choice', 'Quanto é 10 dividido por 2?', '{"schema_version":1,"scene":{"theme":"default","groups":2,"per_group":5,"total":10},"options":[{"id":"opt_a","text":"5"},{"id":"opt_b","text":"2"},{"id":"opt_c","text":"8"},{"id":"opt_d","text":"20"}]}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{"correct_option_id":"opt_a","check":{"a":10,"b":2,"op":"/"},"distractors":{"opt_b":{"error_type":"divisor_dividend_confusion","feedback":{"message":"Atenção ao divisor! O 2 é o número de grupos, não o resultado.","animation":"regroup"}},"opt_c":{"error_type":"subtracted_instead_of_divided","feedback":{"message":"Parece que você subtraiu (10 - 2 = 8). Dividir é repartir em grupos iguais.","animation":"regroup"}},"opt_d":{"error_type":"multiplied_instead_of_divided","feedback":{"message":"Você multiplicou (10 × 2 = 20). Dividir é repartir 10 em 2 grupos iguais.","animation":"regroup"}}}}'::jsonb, 'Dividir 10 por 2 significa separar 10 elementos em 2 grupos iguais, resultando em 5 em cada grupo.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000001
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000001', 'multiplication', 'easy', 'multiple_choice', 'O dragão tem 5 baús, e cada baú tem 4 moedas. Quantas moedas ele tem ao todo?', '{"schema_version":1,"scene":{"theme":"dragon_chests","groups":5,"per_group":4},"options":[{"id":"a","text":"9"},{"id":"b","text":"20"},{"id":"c","text":"25"}]}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000001', '{"correct_option_id":"b","check":{"a":5,"b":4,"op":"*"},"distractors":{"a":{"error_type":"added_instead_of_multiplied","feedback":{"message":"Opa! Você somou os blocos. Multiplicar é fazer grupos: precisamos de 5 grupos de 4.","animation":"merge_blocks"}},"c":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase lá! Você colocou uma moeda a mais em cada baú. Tire uma de cada e conte de novo!","animation":"extra_item_each_group"}}}}'::jsonb, '5 baús com 4 moedas cada: 5 × 4 = 20 moedas.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

COMMIT;
