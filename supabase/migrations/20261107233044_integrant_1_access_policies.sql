-- Permite registrar partidas que misturam níveis de dificuldade.
alter table public.game_attempts
  drop constraint if exists game_attempts_difficulty_check;

alter table public.game_attempts
  add constraint game_attempts_difficulty_check
  check (difficulty in ('easy', 'medium', 'hard', 'mixed'));

-- O navegador pode consultar estes dados, mas as gravações passam
-- por funções de servidor que validam a operação.
revoke all privileges on table
  public.profiles,
  public.teacher_codes,
  public.student_teacher_links,
  public.game_attempts
from anon, authenticated;

grant select on table
  public.profiles,
  public.student_teacher_links,
  public.game_attempts
to authenticated;

-- O usuário pode consultar os vínculos em que participa.
-- Isso inclui vínculos atuais e anteriores; a aplicação pode filtrar
-- unlinked_at para mostrar somente o vínculo atual.
create policy "Users can read their own teacher links"
  on public.student_teacher_links
  for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or teacher_id = (select auth.uid())
  );

-- O professor pode consultar o perfil de um aluno que esteja
-- atualmente vinculado a ele.
create policy "Teachers can read profiles of linked students"
  on public.profiles
  for select
  to authenticated
  using (
    role = 'student'
    and exists (
      select 1
      from public.student_teacher_links as link
      where link.student_id = profiles.user_id
        and link.teacher_id = (select auth.uid())
        and link.unlinked_at is null
    )
  );

-- O aluno pode consultar as próprias partidas.
create policy "Students can read their own game attempts"
  on public.game_attempts
  for select
  to authenticated
  using (student_id = (select auth.uid()));

-- O professor pode consultar partidas de alunos atualmente vinculados.
create policy "Teachers can read active linked students game attempts"
  on public.game_attempts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.student_teacher_links as link
      where link.student_id = game_attempts.student_id
        and link.teacher_id = (select auth.uid())
        and link.unlinked_at is null
    )
  );