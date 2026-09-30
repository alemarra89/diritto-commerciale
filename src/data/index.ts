import raw from './questions.json';
import type { Question } from '../lib/quiz';
export { chapters, chapterGroup } from './chapters';
export const questions: Question[] = raw;
export const questionMap = new Map(questions.map((q) => [q.id, q]));
