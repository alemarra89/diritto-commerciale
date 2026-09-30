import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else if (quoted || field === '') quoted = !quoted;
      else field += ch;
    } else if (ch === ',' && !quoted) { row.push(field); field = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (quoted) throw new Error('Campo CSV con virgolette non chiuse');
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const normalized = (s) => s.normalize('NFC').replace(/\s+/g, ' ').trim();
export function importQuestions(text) {
  const rows = parseCsv(text.replace(/^\uFEFF/, ''));
  const header = rows.findIndex((r) => r[0].trim() === 'Capitolo' && r[1].trim() === 'Domanda');
  if (header < 0) throw new Error('Intestazione CSV non trovata');
  const counts = new Map();
  const questions = [];
  for (const [offset, row] of rows.slice(header + 1).entries()) {
    if (row.every((s) => !s.trim())) continue;
    const line = header + offset + 2;
    if (row.length !== 8) throw new Error(`Riga ${line}: attesi 8 campi, trovati ${row.length}`);
    const chapterId = Number(row[0]);
    if (!Number.isInteger(chapterId) || chapterId < 1 || chapterId > 45) throw new Error(`Riga ${line}: capitolo non valido`);
    const options = row.slice(2, 6).map((s) => s.trim());
    const matches = options.flatMap((s, index) => normalized(s) === normalized(row[6]) ? [index] : []);
    if (matches.length !== 1) throw new Error(`Riga ${line}: risposta esatta non univoca (${matches.length} corrispondenze): ${row[6]}`);
    if (!row[1].trim() || options.some((s) => !s)) throw new Error(`Riga ${line}: domanda o risposte vuote`);
    const number = (counts.get(chapterId) ?? 0) + 1;
    counts.set(chapterId, number);
    questions.push({ id: `${chapterId}-${number}`, chapterId, number, text: row[1].trim(), options, correctIndex: matches[0], note: row[7].trim() });
  }
  if (questions.length !== 450 || counts.size !== 45 || [...counts.values()].some((n) => n !== 10)) {
    throw new Error(`Set incompleto: ${questions.length} domande. Conteggi: ${JSON.stringify(Object.fromEntries(counts))}`);
  }
  return questions;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const source = process.argv[2];
  if (!source) throw new Error('Uso: node scripts/import-questions.mjs <percorso.csv>');
  const questions = importQuestions(readFileSync(source, 'utf8'));
  mkdirSync('src/data', { recursive: true });
  writeFileSync('src/data/questions.json', JSON.stringify(questions, null, 2) + '\n');
  console.log(`Importate ${questions.length} domande, 45 capitoli da 10 domande. Tutte le risposte esatte corrispondono a una sola opzione.`);
  const notes = questions.filter((q) => q.note);
  console.log(`Note presenti: ${notes.length}. Testi del CSV conservati senza correzioni di contenuto.`);
}
