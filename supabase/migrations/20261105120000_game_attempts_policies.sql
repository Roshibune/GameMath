-- RLS já estava habilitado em game_attempts, mas faltavam as políticas:
-- sem elas, nenhum aluno consegue gravar nem ler suas próprias tentativas.

CREATE POLICY "Students can insert their own attempts" ON "public"."game_attempts"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = student_id));

CREATE POLICY "Students can read their own attempts" ON "public"."game_attempts"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = student_id));
