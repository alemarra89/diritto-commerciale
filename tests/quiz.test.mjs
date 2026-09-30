import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { sampleQuestions, makeSession, finishSession, remainingSeconds, matchesQuestion, mistakeIds } from '../src/lib/quiz.ts';
import { parseCsv, importQuestions } from '../scripts/import-questions.mjs';
const questions = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));

test('CSV: virgole, doppi apici, accenti, campi multilinea e riga vuota', () => {
  assert.deepEqual(parseCsv(',\r\n"È, società","Dice ""sì""",\r\n"due\nrighe",fine'), [['', ''], ['È, società', 'Dice "sì"', ''], ['due\nrighe', 'fine']]);
  assert.throws(() => parseCsv('"mai chiuso'), /non chiuse/);
});
test('importazione rifiuta set parziali o risposte ambigue', () => {
  assert.throws(() => importQuestions('Capitolo,Domanda,Risposta 1,Risposta 2,Risposta 3,Risposta 4,Risposta Esatta,Note\n1,Q,A,B,C,D,X,'), /non univoca/);
  assert.throws(() => importQuestions('Capitolo,Domanda,Risposta 1,Risposta 2,Risposta 3,Risposta 4,Risposta Esatta,Note\n1,Q,A,A,C,D,A,'), /non univoca/);
  assert.throws(() => importQuestions('Capitolo,Domanda,Risposta 1,Risposta 2,Risposta 3,Risposta 4,Risposta Esatta,Note\n1,Q,A,B,C,D,A,'), /Set incompleto/);
});
test('simulazioni: 30 domande uniche e campionamento da tutto il set', () => {
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const result = sampleQuestions(questions, 30);
    assert.equal(result.length, 30);
    assert.equal(new Set(result.map((q) => q.id)).size, 30);
    for (const q of result) seen.add(q.chapterId);
  }
  assert.equal(seen.size, 45);
});
test('punteggi separano corrette, errate e non risposte, senza penalità', () => {
  const session = makeSession('chapter', questions.slice(0, 10).map((q) => q.id), 1000, 1);
  session.answers[questions[0].id] = questions[0].correctIndex;
  session.answers[questions[1].id] = (questions[1].correctIndex + 1) % 4;
  const result = finishSession(session, questions, 181000);
  assert.equal(result.correct, 1); assert.equal(result.incorrect, 1); assert.equal(result.unanswered, 8);
  assert.equal(result.durationSeconds, 180); assert.equal(result.timedOut, false);
});
test('30 minuti reali: il tempo continua a app chiusa, deadline inclusa', () => {
  const session = makeSession('exam', sampleQuestions(questions, 30).map((q) => q.id), 1000);
  assert.equal(remainingSeconds(session, 1000), 1800);
  assert.equal(remainingSeconds(session, 0), 1800);
  const restored = JSON.parse(JSON.stringify(session));
  assert.equal(remainingSeconds(restored, 1800999), 1);
  assert.equal(remainingSeconds(restored, 1801000), 0);
  const result = finishSession(restored, questions, 3601000);
  assert.equal(result.durationSeconds, 1800); assert.equal(result.timedOut, true);
  assert.equal(result.unanswered, 30); assert.equal(result.finishedAt, 1801000);
});
test('consegna anticipata e quiz di capitolo senza deadline', () => {
  const exam = makeSession('exam', sampleQuestions(questions, 30).map((q) => q.id), 1000);
  assert.equal(finishSession(exam, questions, 61000).durationSeconds, 60);
  assert.equal(finishSession(exam, questions, 61000).timedOut, false);
  const chapter = makeSession('chapter', questions.slice(0, 10).map((q) => q.id), 1000, 1);
  assert.equal(remainingSeconds(chapter, 9000000), null);
});
test('ricerca su domanda e tutte le opzioni, case e accenti ignorati', () => {
  const q = { ...questions[0], text: 'La società', options: ['Azione', 'Cooperativa', 'È agricola', 'Patrimonio'] };
  assert.ok(matchesQuestion(q, 'SOCIETA')); assert.ok(matchesQuestion(q, 'AGRICOLA'));
  assert.ok(matchesQuestion(q, 'e agricola')); assert.ok(matchesQuestion(q, 'societa patrimonio'));
  assert.equal(matchesQuestion(q, 'obbligazioni'), false);
});
test('ripasso: ultima risposta corretta risolve un errore precedente', () => {
  const q = questions[0];
  const wrong = makeSession('mistakes', [q.id], 1000);
  wrong.answers[q.id] = (q.correctIndex + 1) % 4;
  const first = finishSession(wrong, questions, 2000);
  assert.deepEqual(mistakeIds([first], questions), [q.id]);
  const right = makeSession('mistakes', [q.id], 3000);
  right.answers[q.id] = q.correctIndex;
  const second = finishSession(right, questions, 4000);
  assert.deepEqual(mistakeIds([second, first], questions), []);
});
