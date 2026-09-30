import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { chapters, questions } from '../src/data';
import { matchesQuestion, normalizeSearch } from '../src/lib/quiz';
import { useStudy } from '../src/lib/store';
import { Empty, PageTitle, QuestionCard, SearchBox, Shell } from '../src/ui/components';
import { ChapterCard } from '../src/ui/study-cards';
import { color, ui } from '../src/ui/theme';

export default function ChaptersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tutti');
  const [limit, setLimit] = useState(20);
  const { history } = useStudy();
  const width = useWindowDimensions().width;
  const done = new Set(history.filter((h) => h.mode === 'chapter').map((h) => h.chapterId));
  const found = useMemo(() => questions.filter((q) => matchesQuestion(q, search)), [search]);
  const visible = chapters.filter((c) => (filter === 'Tutti' || (filter === 'Affrontati' ? done.has(c.id) : !done.has(c.id))) && (!search.trim() || normalizeSearch(c.title).includes(normalizeSearch(search)) || found.some((q) => q.chapterId === c.id)));
  const columns = width >= 1400 ? 3 : width >= 750 ? 2 : 1;
  return <Shell active="/capitoli"><PageTitle label="Il programma completo" title="I tuoi 45 capitoli." description="Consulta domande e risposte oppure allenati con un quiz da 10 domande. La ricerca include i titoli, le domande e tutte le possibili risposte." />
    <SearchBox value={search} onChange={(s) => { setSearch(s); setLimit(20); }} placeholder="Cerca nel programma, nelle domande e nelle risposte…" />
    <View style={[ui.spread, { marginTop: 22, marginBottom: 20, flexWrap: 'wrap' }]}><View style={ui.row}>{['Tutti', 'Da affrontare', 'Affrontati'].map((f) => <Pressable key={f} accessibilityRole="button" accessibilityState={{ selected: f === filter }} onPress={() => setFilter(f)} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, backgroundColor: f === filter ? color.soft : 'transparent' }}><Text style={{ fontSize: 12, color: f === filter ? color.green : color.muted, fontWeight: f === filter ? '700' : '400' }}>{f}</Text></Pressable>)}</View><Text style={[ui.muted, { fontSize: 12 }]}>{visible.length} capitoli</Text></View>
    {visible.length === 0 ? <Empty icon={BookOpen} title="Nessun capitolo trovato" text="Prova un’altra parola o modifica il filtro." /> : <View style={{ gap: 14 }}>{Array.from({ length: Math.ceil(visible.length / columns) }, (_, i) => <View key={i} style={{ flexDirection: 'row', gap: 14 }}>{visible.slice(i * columns, (i + 1) * columns).map((c) => <ChapterCard key={c.id} chapter={c} />)}{Array.from({ length: Math.max(0, columns - visible.slice(i * columns, (i + 1) * columns).length) }, (_, j) => <View key={`space-${j}`} style={{ flex: 1, minWidth: 240 }} />)}</View>)}</View>}
    {search.trim() !== '' && <View style={{ marginTop: 32, gap: 14 }}><Text style={ui.h2}>Domande trovate ({found.length})</Text><Text style={ui.muted}>Risultati in tutti i capitoli. Le risposte esatte sono evidenziate.</Text>{found.slice(0, limit).map((q) => <QuestionCard key={q.id} question={q} study />)}{found.length > limit && <Pressable accessibilityRole="button" onPress={() => setLimit((n) => n + 20)} style={{ padding: 16 }}><Text style={{ textAlign: 'center', color: color.green }}>Mostra altre 20 domande</Text></Pressable>}{found.length === 0 && <Text style={ui.muted}>Nessuna domanda contiene questi termini.</Text>}</View>}
  </Shell>;
}
