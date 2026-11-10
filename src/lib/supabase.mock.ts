// Supabase FALSO, só para testar a tela do professor sem acessar o banco.
// Só é usado em desenvolvimento, com PUBLIC_USE_MOCK=true no .env.local.
// Ele imita as regras de acesso (RLS) de forma simplificada: testa a TELA,
// não substitui o teste com o banco real.

type Row = Record<string, any>;

const USUARIOS = [
  { id: "t1", email: "prof@teste.com", password: "1234" },
  { id: "t2", email: "prof2@teste.com", password: "1234" },
  { id: "s1", email: "aluno@teste.com", password: "1234" },
];

const db: Record<string, Row[]> = {
  profiles: [
    { user_id: "t1", role: "teacher", nickname: "Prof Teste" },
    { user_id: "t2", role: "teacher", nickname: "Prof Outro" },
    { user_id: "s1", role: "student", nickname: "aluna-ana" },
    { user_id: "s2", role: "student", nickname: "aluno-bruno" },
    { user_id: "s3", role: "student", nickname: "aluna-carla" }, // turma do t2
    { user_id: "s4", role: "student", nickname: "aluno-davi" }, // desvinculado
    { user_id: "s5", role: "student", nickname: "aluna-novata" }, // sem partidas
  ],
  student_teacher_links: [
    { student_id: "s1", teacher_id: "t1", unlinked_at: null },
    { student_id: "s2", teacher_id: "t1", unlinked_at: null },
    { student_id: "s5", teacher_id: "t1", unlinked_at: null },
    { student_id: "s4", teacher_id: "t1", unlinked_at: "2026-10-01T10:00:00Z" },
    { student_id: "s3", teacher_id: "t2", unlinked_at: null },
  ],
  game_attempts: [
    { student_id: "s1", operation: "multiplication", total_questions: 5, correct_answers: 4, completed_at: "2026-11-05T14:00:00Z" },
    { student_id: "s1", operation: "division", total_questions: 5, correct_answers: 3, completed_at: "2026-11-06T09:30:00Z" },
    { student_id: "s2", operation: "multiplication", total_questions: 5, correct_answers: 5, completed_at: "2026-11-04T11:00:00Z" },
    { student_id: "s2", operation: "division", total_questions: 5, correct_answers: 2, completed_at: "2026-11-04T11:20:00Z" },
    { student_id: "s3", operation: "multiplication", total_questions: 5, correct_answers: 1, completed_at: "2026-11-03T08:00:00Z" },
    { student_id: "s4", operation: "division", total_questions: 5, correct_answers: 5, completed_at: "2026-09-20T08:00:00Z" },
  ],
};

const CHAVE = "mock-usuario";
const atual = (): string | null => {
  try { return localStorage.getItem(CHAVE); } catch { return null; }
};
const espera = (ms = 250) => new Promise((r) => setTimeout(r, ms));

const vinculadoAoProfessor = (alunoId: string, profId: string | null) =>
  db.student_teacher_links.some(
    (l) => l.student_id === alunoId && l.teacher_id === profId && l.unlinked_at === null,
  );

// Imita as políticas do banco: cada um só enxerga o que a regra permite.
function visiveis(tabela: string): Row[] {
  const eu = atual();
  if (!eu) return [];
  if (tabela === "profiles") {
    return db.profiles.filter(
      (p) => p.user_id === eu || (p.role === "student" && vinculadoAoProfessor(p.user_id, eu)),
    );
  }
  if (tabela === "student_teacher_links") {
    return db.student_teacher_links.filter((l) => l.student_id === eu || l.teacher_id === eu);
  }
  if (tabela === "game_attempts") {
    return db.game_attempts.filter((a) => a.student_id === eu || vinculadoAoProfessor(a.student_id, eu));
  }
  return [];
}

class Consulta {
  private filtros: ((r: Row) => boolean)[] = [];
  private ordem: { col: string; asc: boolean } | null = null;
  constructor(private tabela: string) {}

  select(_colunas?: string) { return this; }
  eq(col: string, v: unknown) { this.filtros.push((r) => r[col] === v); return this; }
  is(col: string, v: unknown) { this.filtros.push((r) => (r[col] ?? null) === v); return this; }
  in(col: string, vs: unknown[]) { this.filtros.push((r) => vs.includes(r[col])); return this; }
  order(col: string, op?: { ascending?: boolean }) {
    this.ordem = { col, asc: op?.ascending !== false };
    return this;
  }

  private async rodar() {
    await espera();
    let linhas = visiveis(this.tabela).filter((r) => this.filtros.every((f) => f(r)));
    if (this.ordem) {
      const { col, asc } = this.ordem;
      linhas = [...linhas].sort((a, b) => (a[col] > b[col] ? 1 : -1) * (asc ? 1 : -1));
    }
    return { data: linhas, error: null };
  }

  async maybeSingle() {
    const { data } = await this.rodar();
    return { data: data[0] ?? null, error: null };
  }

  // Permite usar "await" e Promise.all direto na consulta.
  then(ok: (v: any) => any, erro?: (e: any) => any) {
    return this.rodar().then(ok, erro);
  }
}

export const supabase: any = {
  auth: {
    async getSession() {
      const eu = atual();
      return { data: { session: eu ? { user: { id: eu } } : null } };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      await espera();
      const u = USUARIOS.find((x) => x.email === email && x.password === password);
      if (!u) return { data: { user: null }, error: { message: "invalid" } };
      try { localStorage.setItem(CHAVE, u.id); } catch {}
      return { data: { user: { id: u.id } }, error: null };
    },
    async signOut() {
      try { localStorage.removeItem(CHAVE); } catch {}
      return { error: null };
    },
  },
  from: (tabela: string) => new Consulta(tabela),
  functions: {
    async invoke(nome: string) {
      await espera();
      const eu = atual();
      const perfil = db.profiles.find((p) => p.user_id === eu);
      if (nome === "teacher-code" && perfil?.role === "teacher") {
        return { data: { code: eu === "t1" ? "TESTE12345" : "OUTRO67890" }, error: null };
      }
      return { data: null, error: { message: "erro" } };
    },
  },
};
