import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { questions, questionMap } from '../data';
import { Attempt, Session, Mode, makeSession, finishSession, sampleQuestions, mistakeIds } from './quiz';

type Saved = { version: 1; session: Session | null; history: Attempt[]; favorites: string[] };
const initial: Saved = { version: 1, session: null, history: [], favorites: [] };
const KEY = 'diritto-commerciale:v1';
type Store = Saved & {
  ready: boolean;
  now: number;
  storageError: string | null;
  autoCompletedId: string | null;
  start: (mode: Mode, chapterId?: number) => void;
  answer: (id: string, index: number) => void;
  submit: () => string | null;
  discard: () => void;
  toggleFavorite: (id: string) => void;
  reset: () => void;
  mistakes: string[];
};
const Context = createContext<Store | null>(null);

function validSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const s = value as Session;
  return typeof s.id === 'string' && ['chapter', 'exam', 'mistakes'].includes(s.mode)
    && Number.isFinite(s.startedAt) && (s.expiresAt === null || (Number.isFinite(s.expiresAt) && s.expiresAt > s.startedAt))
    && Array.isArray(s.questionIds) && s.questionIds.length > 0 && new Set(s.questionIds).size === s.questionIds.length
    && s.questionIds.every((id) => questionMap.has(id))
    && !!s.answers && typeof s.answers === 'object' && !Array.isArray(s.answers)
    && Object.entries(s.answers).every(([id, index]) => s.questionIds.includes(id) && Number.isInteger(index) && index >= 0 && index < 4)
    && (s.mode !== 'exam' || (s.questionIds.length === 30 && s.expiresAt === s.startedAt + 1800000))
    && (s.mode !== 'chapter' || (s.questionIds.length === 10 && s.questionIds.every((id) => questionMap.get(id)?.chapterId === s.chapterId)));
}
function decode(raw: string): Saved {
  const value = JSON.parse(raw);
  if (value.version !== 1 || !Array.isArray(value.history) || !Array.isArray(value.favorites)
    || (value.session !== null && !validSession(value.session))
    || !value.history.every((a: Attempt) => validSession(a) && Number.isFinite(a.finishedAt))
    || !value.favorites.every((id: string) => questionMap.has(id))) throw new Error('Salvataggio non valido');
  return { version: 1, session: value.session, history: value.history, favorites: [...new Set<string>(value.favorites)] };
}
export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<Saved>(initial);
  const current = useRef(saved);
  const writable = useRef(false);
  const queue = useRef(Promise.resolve());
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [storageError, setStorageError] = useState<string | null>(null);
  const [autoCompletedId, setAutoCompletedId] = useState<string | null>(null);
  function persist(next: Saved) {
    if (!writable.current) return;
    queue.current = queue.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(next))).then(() => setStorageError(null)).catch(() => {
      setStorageError('Il salvataggio locale non è disponibile. Tieni aperta l’app per conservare questa sessione.');
    });
  }
  function commit(update: (s: Saved) => Saved) {
    const next = update(current.current);
    current.current = next;
    setSaved(next);
    persist(next);
  }
  function complete(s: Saved, time: number): Saved {
    if (!s.session) return s;
    return { ...s, session: null, history: [finishSession(s.session, questions, time), ...s.history].slice(0, 100) };
  }
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(KEY).then((raw) => {
      if (!mounted) return;
      let loaded = raw ? decode(raw) : initial;
      writable.current = true;
      if (loaded.session?.expiresAt && loaded.session.expiresAt <= Date.now()) {
        setAutoCompletedId(loaded.session.id);
        loaded = complete(loaded, Date.now());
      }
      current.current = loaded;
      setSaved(loaded);
      persist(loaded);
    }).catch(() => {
      if (mounted) setStorageError('Non riesco a leggere i dati locali. Puoi usare l’app, ma i salvataggi sono sospesi.');
    }).finally(() => { if (mounted) setReady(true); });
    const interval = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (current.current.session?.expiresAt && time >= current.current.session.expiresAt) {
        setAutoCompletedId(current.current.session.id);
        commit((s) => complete(s, time));
      }
    }, 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);
  const mistakes = mistakeIds(saved.history, questions);
  const value: Store = {
    ...saved, ready, now, storageError, mistakes, autoCompletedId,
    start: (mode, chapterId) => {
      const ids = mode === 'chapter' ? questions.filter((q) => q.chapterId === chapterId).sort((a, b) => a.number - b.number).map((q) => q.id)
        : mode === 'exam' ? sampleQuestions(questions, 30).map((q) => q.id) : sampleQuestions(mistakeIds(current.current.history, questions), 30);
      if (!ids.length) return;
      const time = Date.now();
      setNow(time);
      setAutoCompletedId(null);
      commit((s) => ({ ...s, session: makeSession(mode, ids, time, chapterId) }));
    },
    answer: (id, index) => {
      const session = current.current.session;
      if (!session || !session.questionIds.includes(id) || index < 0 || index > 3) return;
      if (session.expiresAt && Date.now() >= session.expiresAt) { commit((s) => complete(s, Date.now())); return; }
      commit((s) => ({ ...s, session: s.session ? { ...s.session, answers: { ...s.session.answers, [id]: index } } : null }));
    },
    submit: () => {
      const id = current.current.session?.id ?? null;
      if (id) commit((s) => complete(s, Date.now()));
      return id;
    },
    discard: () => commit((s) => ({ ...s, session: null })),
    toggleFavorite: (id) => commit((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] })),
    reset: () => { writable.current = true; setAutoCompletedId(null); commit(() => initial); },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useStudy() {
  const value = useContext(Context);
  if (!value) throw new Error('StudyProvider mancante');
  return value;
}
