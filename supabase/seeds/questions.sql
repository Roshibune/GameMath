-- ARQUIVO GERADO por scripts/build-seed.mjs. Não edite à mão.
-- Fonte: content/questions/*.json (rode "npm run questions:build" para regenerar).
-- As questões do JSON são a fonte de verdade: is_active e demais campos
-- são sobrescritos a cada execução.

BEGIN;

-- 00000000-0000-4000-8000-000000000106
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000106', 'division', 'hard', 'multiple_choice', 'Uma biblioteca recebeu 72 livros novos. Para organizar a coleção, a bibliotecária vai distribuir todos os livros igualmente em 8 prateleiras. Quantos livros ficarão em cada prateleira?', '{"schema_version":1,"scene":{"theme":"book_shelves","groups":8,"per_group":9,"total":72},"options":[{"id":"opt_a","text":"9"},{"id":"opt_b","text":"64"},{"id":"opt_c","text":"576"},{"id":"opt_d","text":"8"}]}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000106', '{"correct_option_id":"opt_a","check":{"a":72,"b":8,"op":"/"},"distractors":{"opt_b":{"error_type":"subtracted_instead_of_divided","feedback":{"message":"Você subtraiu 72 - 8. Dividir é repartir os 72 livros igualmente.","animation":"regroup"}},"opt_c":{"error_type":"multiplied_instead_of_divided","feedback":{"message":"Você multiplicou 72 × 8. Precisamos repartir os livros entre as prateleiras.","animation":"regroup"}},"opt_d":{"error_type":"divisor_dividend_confusion","feedback":{"message":"O 8 indica o número de prateleiras. Falta descobrir quantos livros vão em cada uma.","animation":"regroup"}}}}'::jsonb, 'Precisamos repartir 72 livros igualmente entre 8 prateleiras. Como 72 ÷ 8 = 9, cada prateleira ficará com 9 livros.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'division', 'easy', 'multiple_choice', 'Quanto é 10 dividido por 2?', '{"schema_version":1,"scene":{"theme":"default","groups":2,"per_group":5,"total":10},"options":[{"id":"opt_a","text":"5"},{"id":"opt_b","text":"2"},{"id":"opt_c","text":"8"},{"id":"opt_d","text":"20"}]}'::jsonb, false)
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

-- 00000000-0000-4000-8000-000000000102
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000102', 'division', 'easy', 'multiple_choice', 'Marina tem 12 balas e quer repartir igualmente entre 3 amigos. Quantas balas cada amigo recebe?', '{"schema_version":1,"scene":{"theme":"candy_friends","groups":3,"per_group":4,"total":12},"options":[{"id":"a","text":"9"},{"id":"b","text":"36"},{"id":"c","text":"4"},{"id":"d","text":"3"}]}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000102', '{"correct_option_id":"c","check":{"a":12,"b":3,"op":"/"},"distractors":{"a":{"error_type":"subtracted_instead_of_divided","feedback":{"message":"Parece que você subtraiu (12 - 3 = 9). Dividir é repartir em partes iguais.","animation":"regroup"}},"b":{"error_type":"multiplied_instead_of_divided","feedback":{"message":"Você multiplicou (12 × 3 = 36). Dividir é repartir 12 balas entre 3 amigos.","animation":"regroup"}},"d":{"error_type":"divisor_dividend_confusion","feedback":{"message":"Atenção! O 3 é o número de amigos. Falta descobrir quantas balas cada um ganha.","animation":"regroup"}}}}'::jsonb, 'Repartindo 12 balas entre 3 amigos, cada um fica com 4 balas, porque 12 ÷ 3 = 4.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000103
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000103', 'division', 'easy', 'multiple_choice', 'O padeiro tem 18 pães e coloca 3 pães em cada cesta. Quantas cestas ele usa?', '{"schema_version":1,"scene":{"theme":"bread_baskets","groups":6,"per_group":3,"total":18},"options":[{"id":"a","text":"6"},{"id":"b","text":"15"},{"id":"c","text":"3"},{"id":"d","text":"54"}]}'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000103', '{"correct_option_id":"a","check":{"a":18,"b":3,"op":"/"},"distractors":{"b":{"error_type":"subtracted_instead_of_divided","feedback":{"message":"Parece que você subtraiu (18 - 3 = 15). Dividir é formar grupos iguais.","animation":"regroup"}},"c":{"error_type":"divisor_dividend_confusion","feedback":{"message":"Atenção! O 3 é quantos pães vão em cada cesta. Queremos saber quantas cestas.","animation":"regroup"}},"d":{"error_type":"multiplied_instead_of_divided","feedback":{"message":"Você multiplicou (18 × 3 = 54). Dividir é formar grupos de 3 até acabarem os pães.","animation":"regroup"}}}}'::jsonb, 'Formando grupos de 3 com 18 pães, dá para encher 6 cestas, porque 18 ÷ 3 = 6.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000104
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000104', 'division', 'medium', 'multiple_choice', 'A loja tem 28 bolas e quer guardar todas em 4 caixas iguais. Quantas bolas vão em cada caixa?', '{"schema_version":1,"scene":{"theme":"toy_boxes","groups":4,"per_group":7,"total":28},"options":[{"id":"a","text":"24"},{"id":"b","text":"7"},{"id":"c","text":"32"},{"id":"d","text":"4"}]}'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000104', '{"correct_option_id":"b","check":{"a":28,"b":4,"op":"/"},"distractors":{"a":{"error_type":"subtracted_instead_of_divided","feedback":{"message":"Parece que você subtraiu (28 - 4 = 24). Dividir é repartir em partes iguais.","animation":"regroup"}},"c":{"error_type":"other","feedback":{"message":"Você somou 28 + 4. Dividir é repartir as bolas em 4 caixas iguais.","animation":"regroup"}},"d":{"error_type":"divisor_dividend_confusion","feedback":{"message":"Atenção! O 4 é o número de caixas. Falta descobrir quantas bolas vão em cada uma.","animation":"regroup"}}}}'::jsonb, 'Repartindo 28 bolas em 4 caixas iguais, cada caixa fica com 7 bolas, porque 28 ÷ 4 = 7.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000105
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000105', 'division', 'medium', 'multiple_choice', 'Há 54 flores para colocar em 6 vasos, com a mesma quantidade em cada vaso. Quantas flores vão em cada vaso?', '{"schema_version":1,"scene":{"theme":"flower_vases","groups":6,"per_group":9,"total":54},"options":[{"id":"a","text":"8"},{"id":"b","text":"48"},{"id":"c","text":"6"},{"id":"d","text":"9"}]}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000105', '{"correct_option_id":"d","check":{"a":54,"b":6,"op":"/"},"distractors":{"a":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase lá! Na tabuada do 6, 6 × 8 dá 48. Faltam 6 para chegar a 54.","animation":"regroup"}},"b":{"error_type":"subtracted_instead_of_divided","feedback":{"message":"Parece que você subtraiu (54 - 6 = 48). Dividir é repartir em grupos iguais.","animation":"regroup"}},"c":{"error_type":"divisor_dividend_confusion","feedback":{"message":"Atenção! O 6 é o número de vasos. Falta descobrir quantas flores vão em cada um.","animation":"regroup"}}}}'::jsonb, 'Repartindo 54 flores em 6 vasos, cada vaso fica com 9 flores, porque 54 ÷ 6 = 9.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000008
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000008', 'multiplication', 'hard', 'multiple_choice', 'No auditório há 7 fileiras de cadeiras, com 8 cadeiras em cada fileira. Quantas cadeiras há no auditório?', '{"schema_version":1,"scene":{"theme":"auditorium_rows","groups":7,"per_group":8},"options":[{"id":"a","text":"15"},{"id":"b","text":"63"},{"id":"c","text":"56"},{"id":"d","text":"48"}]}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000008', '{"correct_option_id":"c","check":{"a":7,"b":8,"op":"*"},"distractors":{"a":{"error_type":"added_instead_of_multiplied","feedback":{"message":"Opa! Você somou 7 + 8. Multiplicar é juntar 7 grupos de 8 cadeiras.","animation":"merge_blocks"}},"b":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase! Você colocou uma cadeira a mais em cada fileira. Conte de novo!","animation":"extra_item_each_group"}},"d":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase lá! Você contou uma fileira a menos. São 7 fileiras.","animation":"regroup"}}}}'::jsonb, '7 fileiras com 8 cadeiras cada: 7 × 8 = 56 cadeiras.')
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

-- 00000000-0000-4000-8000-000000000002
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000002', 'multiplication', 'easy', 'multiple_choice', 'A fada colheu 3 cestas de maçãs, e cada cesta tem 6 maçãs. Quantas maçãs ela colheu ao todo?', '{"schema_version":1,"scene":{"theme":"fairy_baskets","groups":3,"per_group":6},"options":[{"id":"a","text":"24"},{"id":"b","text":"9"},{"id":"c","text":"18"},{"id":"d","text":"15"}]}'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000002', '{"correct_option_id":"c","check":{"a":3,"b":6,"op":"*"},"distractors":{"a":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase! Você contou uma cesta a mais. São só 3 cestas com 6 maçãs cada.","animation":"regroup"}},"b":{"error_type":"added_instead_of_multiplied","feedback":{"message":"Opa! Você somou 3 + 6. Multiplicar é juntar 3 grupos de 6 maçãs.","animation":"merge_blocks"}},"d":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase lá! Faltou uma maçã em cada cesta. Conte cesta por cesta.","animation":"extra_item_each_group"}}}}'::jsonb, '3 cestas com 6 maçãs cada: 3 × 6 = 18 maçãs.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000003
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000003', 'multiplication', 'easy', 'multiple_choice', 'Na sala, 4 mesas têm 3 crianças sentadas em cada uma. Quantas crianças há nas mesas?', '{"schema_version":1,"scene":{"theme":"classroom_tables","groups":4,"per_group":3},"options":[{"id":"a","text":"12"},{"id":"b","text":"7"},{"id":"c","text":"16"},{"id":"d","text":"15"}]}'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000003', '{"correct_option_id":"a","check":{"a":4,"b":3,"op":"*"},"distractors":{"b":{"error_type":"added_instead_of_multiplied","feedback":{"message":"Opa! Você somou 4 + 3. Multiplicar é contar 4 grupos de 3 crianças.","animation":"merge_blocks"}},"c":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase! Você colocou uma criança a mais em cada mesa. Conte de novo!","animation":"extra_item_each_group"}},"d":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase lá! Você contou uma mesa a mais. Eram só 4 mesas.","animation":"regroup"}}}}'::jsonb, '4 mesas com 3 crianças cada: 4 × 3 = 12 crianças.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000006
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000006', 'multiplication', 'easy', 'multiple_choice', 'Na estante há 4 prateleiras, e cada prateleira tem 5 livros. Quantos livros há na estante?', '{"schema_version":1,"scene":{"theme":"bookshelf","groups":4,"per_group":5},"options":[{"id":"a","text":"9"},{"id":"b","text":"20"},{"id":"c","text":"24"},{"id":"d","text":"15"}]}'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000006', '{"correct_option_id":"b","check":{"a":4,"b":5,"op":"*"},"distractors":{"a":{"error_type":"added_instead_of_multiplied","feedback":{"message":"Opa! Você somou 4 + 5. Multiplicar é juntar 4 grupos de 5 livros.","animation":"merge_blocks"}},"c":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase! Você colocou um livro a mais em cada prateleira. Conte de novo!","animation":"extra_item_each_group"}},"d":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase lá! Você contou uma prateleira a menos. São 4 prateleiras.","animation":"regroup"}}}}'::jsonb, '4 prateleiras com 5 livros cada: 4 × 5 = 20 livros.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000004
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000004', 'multiplication', 'medium', 'multiple_choice', 'Cada caixa tem 7 lápis de cor. Quantos lápis há em 6 caixas?', '{"schema_version":1,"scene":{"theme":"pencil_boxes","groups":6,"per_group":7},"options":[{"id":"a","text":"49"},{"id":"b","text":"13"},{"id":"c","text":"42"},{"id":"d","text":"36"}]}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000004', '{"correct_option_id":"c","check":{"a":6,"b":7,"op":"*"},"distractors":{"a":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase! Você contou uma caixa a mais. São 6 caixas com 7 lápis cada.","animation":"regroup"}},"b":{"error_type":"added_instead_of_multiplied","feedback":{"message":"Opa! Você somou 6 + 7. Multiplicar é juntar 6 grupos de 7 lápis.","animation":"merge_blocks"}},"d":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase lá! Faltou um lápis em cada caixa. Conte caixa por caixa.","animation":"extra_item_each_group"}}}}'::jsonb, '6 caixas com 7 lápis cada: 6 × 7 = 42 lápis.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000005
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000005', 'multiplication', 'medium', 'multiple_choice', 'Cada pacote traz 9 figurinhas. Quantas figurinhas há em 3 pacotes?', '{"schema_version":1,"scene":{"theme":"sticker_packs","groups":3,"per_group":9},"options":[{"id":"a","text":"30"},{"id":"b","text":"27"},{"id":"c","text":"12"},{"id":"d","text":"18"}]}'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000005', '{"correct_option_id":"b","check":{"a":3,"b":9,"op":"*"},"distractors":{"a":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase! Você contou uma figurinha a mais em cada pacote. Conte de novo!","animation":"extra_item_each_group"}},"c":{"error_type":"added_instead_of_multiplied","feedback":{"message":"Opa! Você somou 9 + 3. Multiplicar é juntar 3 grupos de 9 figurinhas.","animation":"merge_blocks"}},"d":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase lá! Você contou um pacote a menos. São 3 pacotes.","animation":"regroup"}}}}'::jsonb, '3 pacotes com 9 figurinhas cada: 3 × 9 = 27 figurinhas.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

-- 00000000-0000-4000-8000-000000000007
INSERT INTO public.questions (id, operation, difficulty, question_type, prompt, content, is_active)
VALUES ('00000000-0000-4000-8000-000000000007', 'multiplication', 'medium', 'multiple_choice', 'Cada pizza tem 8 fatias. Quantas fatias há em 5 pizzas?', '{"schema_version":1,"scene":{"theme":"pizza_slices","groups":5,"per_group":8},"options":[{"id":"a","text":"13"},{"id":"b","text":"45"},{"id":"c","text":"40"},{"id":"d","text":"32"}]}'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET
  operation = EXCLUDED.operation,
  difficulty = EXCLUDED.difficulty,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_answers (question_id, answer_key, explanation)
VALUES ('00000000-0000-4000-8000-000000000007', '{"correct_option_id":"c","check":{"a":5,"b":8,"op":"*"},"distractors":{"a":{"error_type":"added_instead_of_multiplied","feedback":{"message":"Opa! Você somou 5 + 8. Multiplicar é juntar 5 grupos de 8 fatias.","animation":"merge_blocks"}},"b":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase! Você contou uma fatia a mais em cada pizza. Conte de novo!","animation":"extra_item_each_group"}},"d":{"error_type":"adjacent_table_fact","feedback":{"message":"Quase lá! Você contou uma pizza a menos. Conte pizza por pizza.","animation":"regroup"}}}}'::jsonb, '5 pizzas com 8 fatias cada: 5 × 8 = 40 fatias.')
ON CONFLICT (question_id) DO UPDATE SET
  answer_key = EXCLUDED.answer_key,
  explanation = EXCLUDED.explanation;

COMMIT;
