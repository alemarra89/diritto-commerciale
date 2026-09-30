import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Check, Clock3, Flag } from 'lucide-react-native';
import { questionMap, chapters } from '../src/data';
import { useStudy } from '../src/lib/store';
import { formatDuration, remainingSeconds } from '../src/lib/quiz';
import { Button, Confirm, Empty, Progress, QuestionCard, Shell, TextLink } from '../src/ui/components';
import { color, ui } from '../src/ui/theme';

export default function QuizPage() {
  const store = useStudy();
  const { session, now } = store;
  const activeId = useRef(session?.id);
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  const [confirm, setConfirm] = useState(false);
  const [discard, setDiscard] = useState(false);
  const width = useWindowDimensions().width;
  const compact = width < 600;
  useEffect(() => {
    if (session) activeId.current = session.id;
    else {
      const id = activeId.current ?? store.autoCompletedId;
      if (id && store.history.some((a) => a.id === id)) router.replace(`/risultato/${id}`);
    }
  }, [session, store.history, store.autoCompletedId]);
  if (!session) return <Shell><Empty title="Nessun quiz in corso" text="Scegli un capitolo o avvia una simulazione per metterti alla prova."><Button onPress={() => router.replace('/capitoli')}>Scegli un capitolo</Button></Empty></Shell>;
  const count = session.questionIds.length;
  const answered = Object.keys(session.answers).length;
  const remaining = remainingSeconds(session, now);
  const title = session.mode === 'chapter' ? chapters[(session.chapterId ?? 1) - 1]?.title : session.mode === 'exam' ? 'Simulazione d’esame' : 'Ripasso degli errori';
  const submit = () => { setConfirm(false); const id = store.submit(); if (id) router.replace(`/risultato/${id}`); };
  return <Shell scroll={false} active={session.mode === 'exam' ? '/esame' : session.mode === 'chapter' ? '/capitoli' : '/ripasso'}>
    <View style={{ paddingHorizontal: compact ? 20 : 40, paddingTop: compact ? 16 : 24, paddingBottom: 16, borderBottomWidth: 1, borderColor: color.line, backgroundColor: color.bg }}>
      <View style={[ui.spread, { maxWidth: 1170, alignSelf: 'center', width: '100%', marginBottom: 14 }]}><View style={{ flex: 1, gap: 6 }}><Text style={ui.eyebrow}>{session.mode === 'chapter' ? `Quiz · Capitolo ${session.chapterId}` : session.mode === 'exam' ? '30 domande su tutto il programma' : 'Fino a 30 domande · Senza timer'}</Text><Text numberOfLines={2} style={[ui.h2, { fontSize: compact ? 21 : 26, lineHeight: compact ? 27 : 33 }]}>{title}</Text></View>{remaining !== null && <View accessibilityRole="timer" accessibilityLabel={`Tempo rimanente ${formatDuration(remaining)}`} style={{ backgroundColor: remaining <= 300 ? color.redSoft : color.soft, borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}><Clock3 size={18} color={remaining <= 300 ? color.red : color.green} /><Text style={{ fontSize: compact ? 18 : 23, fontVariant: ['tabular-nums'], fontWeight: '700', color: remaining <= 300 ? color.red : color.green }}>{formatDuration(remaining)}</Text></View>}</View>
      <View style={{ maxWidth: 1170, width: '100%', alignSelf: 'center', gap: 10 }}><View style={ui.spread}><Text style={[ui.muted, { fontSize: 12 }]}>{answered} di {count} risposte selezionate</Text><Text style={[ui.muted, { fontSize: 12 }]}>{remaining === null ? 'Nessun limite di tempo' : 'Consegna automatica a 00:00'}</Text></View><Progress value={answered / count * 100} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingVertical: 4 }}>{session.questionIds.map((id, i) => <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Vai alla domanda ${i + 1}, ${session.answers[id] === undefined ? 'non risposta' : 'risposta selezionata'}`} onPress={() => scroll.current?.scrollTo({ y: positions.current[id] ?? 0, animated: true })} style={{ backgroundColor: session.answers[id] !== undefined ? color.green : color.paper, width: 32, height: 32, borderWidth: 1, borderColor: color.line, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 12, color: session.answers[id] !== undefined ? '#fff' : color.muted }}>{i + 1}</Text></Pressable>)}</ScrollView>
      </View>
    </View>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: compact ? 20 : 40, paddingVertical: 22 }}><View style={{ width: '100%', maxWidth: 950, alignSelf: 'center', gap: 18 }}>{session.questionIds.map((id, index) => {
      const q = questionMap.get(id)!;
      return <View key={id} onLayout={(e) => { positions.current[id] = e.nativeEvent.layout.y; }}><QuestionCard question={q} displayNumber={index + 1} selected={session.answers[id]} onSelect={(i) => store.answer(id, i)} /></View>;
    })}<Text style={[ui.muted, { fontSize: 12, textAlign: 'center', paddingVertical: 12 }]}>Puoi cambiare le risposte fino alla consegna. Il riepilogo mostrerà anche le domande lasciate vuote.</Text></View></ScrollView>
    <View style={{ paddingHorizontal: compact ? 20 : 40, paddingVertical: 14, backgroundColor: color.paper, borderTopWidth: 1, borderColor: color.line }}><View style={[ui.spread, { maxWidth: 1170, width: '100%', alignSelf: 'center' }]}><Pressable onPress={() => setDiscard(true)} accessibilityRole="button" style={{ padding: 10 }}><Text style={{ fontSize: 12, color: color.muted }}>Abbandona</Text></Pressable><Button icon={Check} onPress={() => setConfirm(true)}>Consegna il quiz</Button></View></View>
    <Confirm visible={confirm} title="Consegniamo il quiz?" text={answered === count ? `Hai risposto a tutte le ${count} domande. Dopo la consegna vedrai il punteggio e le soluzioni.` : `Risposte selezionate: ${answered} su ${count}. Le domande non risposte (${count - answered}) varranno 0 punti. Puoi tornare al quiz per completarle.`} confirm="Consegna e vedi il risultato" onConfirm={submit} onClose={() => setConfirm(false)} />
    <Confirm visible={discard} title="Abbandonare il quiz?" text="Le risposte di questo tentativo saranno eliminate e il quiz non verrà aggiunto allo storico. Puoi anche annullare e continuare." confirm="Abbandona il quiz" onConfirm={() => { activeId.current = undefined; store.discard(); setDiscard(false); router.replace('/'); }} onClose={() => setDiscard(false)} />
  </Shell>;
}
