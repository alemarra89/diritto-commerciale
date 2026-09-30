import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { importQuestions } from './import-questions.mjs';
const data = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));
assert.equal(data.length, 450);
assert.equal(new Set(data.map((q) => q.id)).size, 450);
for (let chapter = 1; chapter <= 45; chapter++) {
  const group = data.filter((q) => q.chapterId === chapter);
  assert.equal(group.length, 10);
  assert.deepEqual(group.map((q) => q.number), [1,2,3,4,5,6,7,8,9,10]);
  for (const q of group) {
    assert.equal(q.options.length, 4);
    assert.ok(q.options.every((s) => typeof s === 'string' && s.trim().length > 0));
    assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3);
  }
}
console.log('Dati verificati: 450 ID univoci, 45 capitoli, 10 domande ordinate per capitolo, 4 opzioni e una soluzione valida per ogni domanda.');
if (process.argv[2]) {
  assert.deepEqual(data, importQuestions(readFileSync(process.argv[2], 'utf8')));
  console.log('Confronto integrale con il CSV originale: testi, quattro opzioni, soluzioni e ordine identici.');
}
