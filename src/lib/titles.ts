export type StudentTitle = {
  name: string;
  minimumPoints: number;
};

export type StudentTitleProgress = {
  points: number;
  current: StudentTitle;
  next: StudentTitle | null;
  pointsToNext: number;
  progressPoints: number;
  progressRequired: number;
};

export const STUDENT_TITLES: StudentTitle[] = [
  { name: "Iniciante", minimumPoints: 0 },
  { name: "Aprendiz", minimumPoints: 20 },
  { name: "Explorador", minimumPoints: 60 },
  { name: "Desbravador", minimumPoints: 140 },
  { name: "Estrategista", minimumPoints: 300 },
  { name: "Especialista", minimumPoints: 620 },
  { name: "Mestre dos Cálculos", minimumPoints: 1260 },
  { name: "Guardião dos Números", minimumPoints: 2540 },
  { name: "Lenda dos Cálculos", minimumPoints: 5100 },
  { name: "Lenda do GameMath", minimumPoints: 10220 },
];

export function calculateStudentPoints(
  attempts: { total_questions: number; correct_answers: number }[],
): number {
  const netPoints = attempts.reduce((total, attempt) => {
    const errors = attempt.total_questions - attempt.correct_answers;
    return total + attempt.correct_answers - errors;
  }, 0);

  return Math.max(0, netPoints);
}

export function getStudentTitleProgress(points: number): StudentTitleProgress {
  const safePoints = Math.max(
    0,
    Math.floor(Number.isFinite(points) ? points : 0),
  );
  let currentIndex = 0;

  for (let index = 1; index < STUDENT_TITLES.length; index++) {
    if (safePoints < STUDENT_TITLES[index].minimumPoints) break;
    currentIndex = index;
  }

  const current = STUDENT_TITLES[currentIndex];
  const next = STUDENT_TITLES[currentIndex + 1] ?? null;

  if (!next) {
    return {
      points: safePoints,
      current,
      next: null,
      pointsToNext: 0,
      progressPoints: 1,
      progressRequired: 1,
    };
  }

  return {
    points: safePoints,
    current,
    next,
    pointsToNext: next.minimumPoints - safePoints,
    progressPoints: safePoints - current.minimumPoints,
    progressRequired: next.minimumPoints - current.minimumPoints,
  };
}