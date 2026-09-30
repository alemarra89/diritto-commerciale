export interface Question {
  id: string;
  chapterId: number;
  number: number;
  text: string;
  options: string[];
  correctIndex: number;
  note: string;
}
export type Mode = 'chapter' | 'exam' | 'mistakes';
export interface Session {
  id: string;
  mode: Mode;
  chapterId?: number;
  questionIds: string[];
  answers: Record<string, number>;
  startedAt: number;
  expiresAt: number | null;
}
export interface Attempt extends Session {
  finishedAt: number;
  durationSeconds: number;
  timedOut: boolean;
  correct: number;
  incorrect: number;
  unanswered: number;
}
export function sampleQuestions<T>(items: readonly T[], count: number, random = Math.random): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
export function makeSession(mode: Mode, ids: string[], now = Date.now(), chapterId?: number): Session {
  return { id: `${now}-${Math.random().toString(36).slice(2, 10)}`, mode, chapterId, questionIds: ids, answers: {}, startedAt: now, expiresAt: mode === 'exam' ? now + 30 * 60 * 1000 : null };
}
export function remainingSeconds(session: Session, now = Date.now()) {
  return session.expiresAt === null ? null : Math.min(1800, Math.max(0, Math.ceil((session.expiresAt - now) / 1000)));
}
export function questionStatus(question: Question, answers: Record<string, number>): 'correct' | 'incorrect' | 'unanswered' {
  const answer = answers[question.id];
  if (answer === undefined) return 'unanswered';
  return answer === question.correctIndex ? 'correct' : 'incorrect';
}
export function finishSession(session: Session, questions: readonly Question[], now = Date.now()): Attempt {
  const finishedAt = session.expiresAt === null ? now : Math.min(now, session.expiresAt);
  const selected = new Set(session.questionIds);
  const statuses = questions.filter((q) => selected.has(q.id)).map((q) => questionStatus(q, session.answers));
  return { ...session, finishedAt, durationSeconds: Math.max(0, Math.floor((finishedAt - session.startedAt) / 1000)), timedOut: session.expiresAt !== null && now >= session.expiresAt, correct: statuses.filter((s) => s === 'correct').length, incorrect: statuses.filter((s) => s === 'incorrect').length, unanswered: statuses.filter((s) => s === 'unanswered').length };
}
export function normalizeSearch(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
}
export function matchesQuestion(question: Question, search: string) {
  const haystack = normalizeSearch([question.text, ...question.options].join(' '));
  return normalizeSearch(search).split(' ').every((term) => haystack.includes(term));
}
export function mistakeIds(history: readonly Attempt[], questions: readonly Question[]) {
  const lookup = new Map(questions.map((q) => [q.id, q]));
  const latest = new Map<string, boolean>();
  for (const attempt of [...history].sort((a, b) => a.finishedAt - b.finishedAt)) {
    for (const id of attempt.questionIds) {
      const q = lookup.get(id);
      if (q) latest.set(id, questionStatus(q, attempt.answers) !== 'correct');
    }
  }
  return [...latest].filter(([, wrong]) => wrong).map(([id]) => id);
}
export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}
