import React, { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, Clock3, Trophy } from 'lucide-react-native';
import { questionMap } from '../../src/data';
import { useStudy } from '../../src/lib/store';
import { formatDuration, questionStatus } from '../../src/lib/quiz';
import { Button, Empty, PageTitle, QuestionCard, Shell, StartQuiz, Stat, Tag, TextLink } from '../../src/ui/components';
import { attemptTitle } from '../../src/ui/study-cards';
import { color, serif, ui } from '../../src/ui/theme';

export default function ResultPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history, mistakes } = useStudy();
  const attempt = history.find((a) => a.id === id);
  const [filter, setFilter] = useState('all');
  const mobile = useWindowDimensions().width < 700;
  if (!attempt) return <Shell active="/storico"><Empty title="Risultato non disponibile" text="Il tentativo potrebbe essere stato rimosso dallo storico."><Button onPress={() => router.replace('/storico')}>Apri lo storico</Button></Empty></Shell>;
  const selected = attempt.questionIds.map((id, index) => ({ q: questionMap.get(id)!, index })).filter(({ q }) => filter === 'all' || questionStatus(q, attempt.answers) === filter);
  return <Shell active="/storico"><PageTitle label="Il tuo risultato" title="Un altro passo nella preparazione." description={attemptTitle(attempt)} />
    {attempt.timedOut && <View style={{ padding: 18, borderRadius: 12, backgroundColor: color.warm, marginBottom: 20 }}><Text style={[ui.text, { color: color.amber, fontSize: 14 }]}>Tempo scaduto. La simulazione è stata consegnata automaticamente con le risposte selezionate entro i 30 minuti.</Text></View>}
    <View style={[ui.card, { backgroundColor: color.soft, borderColor: '#DDE5D3', padding: mobile ? 24 : 34, flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'flex-start' : 'center', gap: 28 }]}><View style={{ backgroundColor: color.lime, padding: 22, borderRadius: 24 }}><Trophy size={40} color={color.green} strokeWidth={1.5} /></View><View style={{ flex: 1, gap: 10 }}><Text style={ui.eyebrow}>Punteggio finale</Text><Text style={{ fontFamily: serif, fontSize: 54, lineHeight: 62, color: color.ink }}>{attempt.correct}<Text style={{ fontSize: 28, color: '#7D8C6E' }}> / {attempt.questionIds.length}</Text></Text><Text style={[ui.muted, { color: '#61705C' }]}>{Math.round(attempt.correct / attempt.questionIds.length * 100)}% di risposte corrette · 1 punto per risposta esatta</Text></View><View style={{ gap: 10 }}><View style={ui.row}><Clock3 size={18} color={color.green} /><Text style={ui.text}>Durata: {formatDuration(attempt.durationSeconds)}</Text></View><Text style={[ui.muted, { fontSize: 12 }]}>{new Date(attempt.finishedAt).toLocaleString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text></View></View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 18 }}><Stat label="Corrette" value={attempt.correct} /><Stat label="Sbagliate" value={attempt.incorrect} /><Stat label="Non risposte" value={attempt.unanswered} /></View>
    <View style={{ flexDirection: mobile ? 'column' : 'row', gap: 12, marginTop: 24 }}>{attempt.mode === 'mistakes' && mistakes.length === 0 ? <Button onPress={() => router.push('/ripasso')}>Torna al ripasso</Button> : <StartQuiz mode={attempt.mode} chapterId={attempt.chapterId}>{attempt.mode === 'exam' ? 'Nuova simulazione' : attempt.mode === 'chapter' ? 'Riprova il capitolo' : 'Continua il ripasso'}</StartQuiz>}<Button secondary onPress={() => router.push('/storico')}>Tutti i risultati</Button></View>
    <Text style={[ui.h2, { marginTop: 36, marginBottom: 10 }]}>Rivediamo le risposte.</Text><Text style={ui.muted}>La risposta esatta è evidenziata in verde. In rosso trovi la tua eventuale scelta sbagliata.</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 20 }}>{[['all', 'Tutte'], ['correct', 'Corrette'], ['incorrect', 'Sbagliate'], ['unanswered', 'Non risposte']].map(([key, label]) => <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: filter === key }} onPress={() => setFilter(key)} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: filter === key ? color.green : color.paper, borderWidth: 1, borderColor: color.line }}><Text style={{ fontSize: 12, color: filter === key ? '#fff' : color.muted }}>{label}</Text></Pressable>)}</View>
    <View style={{ gap: 18 }}>{selected.map(({ q, index }) => <QuestionCard key={q.id} question={q} displayNumber={index + 1} review selected={attempt.answers[q.id]} />)}</View>
    {selected.length === 0 && <Empty icon={Check} title="Nessuna domanda in questa categoria" text="Scegli un altro filtro per rivedere le risposte del tentativo." />}
  </Shell>;
}
