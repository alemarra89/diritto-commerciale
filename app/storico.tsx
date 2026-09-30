import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { History } from 'lucide-react-native';
import { useStudy } from '../src/lib/store';
import { Confirm, Empty, PageTitle, Shell, Stat } from '../src/ui/components';
import { AttemptRow } from '../src/ui/study-cards';
import { color, ui } from '../src/ui/theme';

export default function HistoryPage() {
  const store = useStudy();
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(false);
  const visible = store.history.filter((a) => filter === 'all' || a.mode === filter);
  const total = store.history.reduce((sum, a) => sum + a.questionIds.length, 0);
  const correct = store.history.reduce((sum, a) => sum + a.correct, 0);
  return <Shell active="/storico"><PageTitle label="Ogni tentativo conta" title="La tua preparazione, nel tempo." description="Punteggi, durata e risposte dei tuoi ultimi 100 quiz. I dati vengono salvati su questo dispositivo o browser, senza account." />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 26 }}><Stat label="Tentativi salvati" value={store.history.length} /><Stat label="Risposte corrette" value={total ? `${Math.round(correct / total * 100)}%` : '—'} /><Stat label="Domande affrontate" value={total} /></View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>{[['all', 'Tutti'], ['chapter', 'Per capitolo'], ['exam', 'Simulazioni'], ['mistakes', 'Ripasso errori']].map(([key, label]) => <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: filter === key }} onPress={() => setFilter(key)} style={{ padding: 12, borderRadius: 8, backgroundColor: filter === key ? color.green : color.paper, borderWidth: 1, borderColor: color.line }}><Text style={{ fontSize: 12, color: filter === key ? '#fff' : color.muted }}>{label}</Text></Pressable>)}</View>
    <View style={{ gap: 12 }}>{visible.map((a) => <AttemptRow key={a.id} attempt={a} />)}</View>{!visible.length && <Empty icon={History} title="Il prossimo tentativo sarà il primo." text="Completa un quiz per trovare qui il punteggio, la durata e il riepilogo delle risposte." />}
    <View style={[ui.card, { marginTop: 32, gap: 12 }]}><Text style={{ fontWeight: '600', color: color.ink }}>I tuoi dati restano qui</Text><Text style={ui.muted}>Storico, preferiti e quiz in corso sono locali. Se cancelli i dati dell’app o del browser, questi progressi saranno persi. Non si sincronizzano tra dispositivi.</Text><Pressable onPress={() => setConfirm(true)} accessibilityRole="button" style={{ paddingVertical: 10, alignSelf: 'flex-start' }}><Text style={{ color: color.red, fontSize: 13 }}>Azzera tutti i progressi locali</Text></Pressable></View>
    <Confirm visible={confirm} title="Azzerare i progressi?" text="Verranno cancellati lo storico, i preferiti e il quiz in corso su questo dispositivo. Le 450 domande rimarranno disponibili. Questa operazione non può essere annullata." confirm="Azzera tutti i progressi" onConfirm={() => { store.reset(); setConfirm(false); }} onClose={() => setConfirm(false)} />
  </Shell>;
}
