import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, BookOpen, CheckCheck, Clock3, GraduationCap, History, Layers3, RotateCcw } from 'lucide-react-native';
import { chapters } from '../src/data';
import { useStudy } from '../src/lib/store';
import { formatDuration, remainingSeconds } from '../src/lib/quiz';
import { Button, SectionHeader, Shell, Stat, Tag, TextLink } from '../src/ui/components';
import { AttemptRow, ChapterCard } from '../src/ui/study-cards';
import { color, serif, ui } from '../src/ui/theme';

export default function Home() {
  const { history, session, now, mistakes, autoCompletedId } = useStudy();
  const { width } = useWindowDimensions();
  const mobile = width < 700;
  const done = new Set(history.filter((h) => h.mode === 'chapter').map((h) => h.chapterId));
  const total = history.reduce((sum, a) => sum + a.questionIds.length, 0);
  const correct = history.reduce((sum, a) => sum + a.correct, 0);
  const next = chapters.find((c) => !done.has(c.id)) ?? chapters[0];
  const preview = chapters.slice(Math.min(next.id - 1, 42), Math.min(next.id - 1, 42) + 3);
  return <Shell active="/">
    <View style={[ui.spread, { marginBottom: 28 }]}><View style={{ gap: 9 }}><Text style={ui.eyebrow}>IL TUO PERCORSO DI PREPARAZIONE</Text><Text style={[ui.title, mobile && { fontSize: 31, lineHeight: 39 }]}>Facciamo spazio allo studio.</Text><Text style={ui.muted}>Diritto commerciale, un passo alla volta.</Text></View>{!mobile && <Tag>45 capitoli a disposizione</Tag>}</View>
    <View style={{ backgroundColor: color.soft, borderWidth: 1, borderColor: '#DDE5D3', borderRadius: 24, padding: mobile ? 26 : 36, flexDirection: 'row', overflow: 'hidden', gap: 24 }}>
      <View style={{ flex: 1, gap: 18 }}><View style={ui.row}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color.green }} /><Text style={[ui.eyebrow, { color: color.green }]}>La teoria diventa pratica</Text></View><Text style={{ fontFamily: serif, fontSize: mobile ? 32 : 40, lineHeight: mobile ? 40 : 49, color: color.ink, letterSpacing: -1 }}>Impara con calma.{ '\n' }Mettiti alla prova.</Text><Text style={[ui.muted, { maxWidth: 410, color: '#61705C' }]}>Esplora le domande, allenati sui singoli capitoli e verifica la tua preparazione con una simulazione d’esame.</Text><View style={{ alignSelf: 'flex-start', marginTop: 4 }}><Button icon={ArrowRight} onPress={() => router.push(`/capitolo/${next.id}`)}>{done.size ? 'Continua il percorso' : 'Inizia dal primo capitolo'}</Button></View></View>
      {!mobile && <View style={{ width: 190, alignItems: 'center', justifyContent: 'center', gap: 13 }}><View style={{ width: 155, height: 155, borderRadius: 78, backgroundColor: color.lime, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] }}><BookOpen size={70} color={color.green} strokeWidth={1.1} /></View><Text style={{ fontFamily: serif, fontSize: 28, color: color.green }}>450 domande</Text><Text style={[ui.muted, { fontSize: 12 }]}>Tutte le risposte, a portata di mano.</Text></View>}
    </View>
    {session && <View style={[ui.card, { marginTop: 20, gap: 12 }]}><View style={ui.row}><Clock3 size={18} color={color.green} /><Text style={{ fontWeight: '600', color: color.ink }}>Hai un quiz in corso</Text></View><Text style={ui.muted}>{Object.keys(session.answers).length}/{session.questionIds.length} risposte salvate{session.expiresAt ? ` · ${formatDuration(remainingSeconds(session, now) ?? 0)} rimanenti` : ' · Nessun limite di tempo'}</Text><Button secondary onPress={() => router.push('/quiz')}>Riprendi il quiz</Button></View>}
    {!session && autoCompletedId && <View style={[ui.card, { marginTop: 20, gap: 12 }]}><Text style={ui.h2}>La simulazione è conclusa</Text><Text style={ui.muted}>Il tempo è scaduto. Le tue risposte sono state consegnate e il risultato è salvato nello storico.</Text><Button secondary onPress={() => router.push(`/risultato/${autoCompletedId}`)}>Vedi il risultato</Button></View>}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 22 }}><Stat label="Domande disponibili" value="450" icon={Layers3} /><Stat label="Capitoli affrontati" value={`${done.size}/45`} icon={BookOpen} /><Stat label="Quiz completati" value={history.length} icon={CheckCheck} /><Stat label="Risposte corrette" value={total ? `${Math.round(correct / total * 100)}%` : '—'} icon={History} /></View>
    <SectionHeader title="Come vuoi allenarti?" caption="Scegli il ritmo che fa per te." />
    <View style={{ flexDirection: mobile ? 'column' : 'row', gap: 18 }}>
      <View style={[ui.card, { flex: 1, gap: 16 }]}><View style={ui.spread}><View style={{ backgroundColor: color.soft, padding: 12, borderRadius: 12 }}><BookOpen size={24} color={color.green} /></View><Tag>Al tuo ritmo</Tag></View><Text style={ui.h2}>Quiz per capitolo</Text><Text style={ui.muted}>10 domande in ordine, senza timer. Concentrati su un argomento e verifica ciò che hai imparato.</Text><View style={{ marginTop: 'auto' }}><Button secondary icon={ArrowRight} onPress={() => router.push('/capitoli')}>Scegli un capitolo</Button></View></View>
      <View style={[ui.card, { flex: 1, gap: 16, backgroundColor: '#F5F1E7', borderColor: '#E9E1CE' }]}><View style={ui.spread}><View style={{ backgroundColor: '#EDE3CD', padding: 12, borderRadius: 12 }}><GraduationCap size={24} color={color.amber} /></View><Tag tone="warm">30 minuti</Tag></View><Text style={ui.h2}>Simulazione d’esame</Text><Text style={ui.muted}>30 domande casuali da tutto il programma. Una nuova selezione a ogni tentativo.</Text><View style={{ marginTop: 'auto' }}><Button secondary icon={ArrowRight} onPress={() => router.push('/esame')}>Prepara la simulazione</Button></View></View>
    </View>
    <SectionHeader title="Il prossimo capitolo" action={<TextLink onPress={() => router.push('/capitoli')}>Tutti i capitoli</TextLink>} />
    <View style={{ flexDirection: mobile ? 'column' : 'row', gap: 14 }}>{preview.map((c) => <ChapterCard key={c.id} chapter={c} />)}</View>
    {mistakes.length > 0 && <View style={[ui.card, { marginTop: 24, gap: 14 }]}><View style={ui.row}><RotateCcw size={20} color={color.green} /><Text style={ui.h2}>Ripartiamo dagli errori</Text></View><Text style={ui.muted}>{mistakes.length} domande da rivedere. Ogni risposta corretta nel prossimo quiz le toglierà dal ripasso.</Text><TextLink onPress={() => router.push('/ripasso')}>Vai al tuo ripasso</TextLink></View>}
    {history.length > 0 && <><SectionHeader title="I tuoi ultimi tentativi" action={<TextLink onPress={() => router.push('/storico')}>Apri lo storico</TextLink>} /><View style={{ gap: 10 }}>{history.slice(0, 3).map((a) => <AttemptRow key={a.id} attempt={a} />)}</View></>}
  </Shell>;
}
