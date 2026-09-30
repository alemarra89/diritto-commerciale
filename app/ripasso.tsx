import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bookmark, RotateCcw } from 'lucide-react-native';
import { questions } from '../src/data';
import { useStudy } from '../src/lib/store';
import { matchesQuestion } from '../src/lib/quiz';
import { Empty, PageTitle, QuestionCard, SearchBox, Shell, StartQuiz } from '../src/ui/components';
import { color, ui } from '../src/ui/theme';

export default function RevisionPage() {
  const { favorites, mistakes } = useStudy();
  const [tab, setTab] = useState('errors');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(20);
  const ids = new Set(tab === 'errors' ? mistakes : favorites);
  const visible = questions.filter((q) => ids.has(q.id) && matchesQuestion(q, search));
  return <Shell active="/ripasso"><PageTitle label="Torniamo su ciò che conta" title="Il tuo ripasso personale." description="Conserva le domande importanti e ritrova quelle sbagliate o lasciate vuote nell’ultimo tentativo. Una risposta corretta le rimuove dagli errori da ripassare." />
    <View style={[ui.card, { backgroundColor: color.soft, gap: 16, marginBottom: 24 }]}><View style={ui.row}><RotateCcw size={24} color={color.green} /><Text style={ui.h2}>Allenati sui tuoi errori</Text></View><Text style={ui.muted}>{mistakes.length ? `${mistakes.length} domande da ripassare. Il quiz estrae fino a 30 domande da questo elenco, senza timer.` : 'Dopo il primo quiz, qui compariranno le domande da ripassare.'}</Text>{mistakes.length > 0 && <View style={{ alignSelf: 'flex-start' }}><StartQuiz mode="mistakes">Inizia il ripasso degli errori</StartQuiz></View>}</View>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>{[['errors', `Da ripassare (${mistakes.length})`], ['favorites', `Preferiti (${favorites.length})`]].map(([key, label]) => <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: tab === key }} onPress={() => { setTab(key); setLimit(20); }} style={{ padding: 12, borderRadius: 9, backgroundColor: tab === key ? color.green : color.paper, borderWidth: 1, borderColor: color.line }}><Text style={{ fontSize: 13, color: tab === key ? '#fff' : color.muted }}>{label}</Text></Pressable>)}</View>
    <SearchBox value={search} onChange={(s) => { setSearch(s); setLimit(20); }} /><View style={{ gap: 16, marginTop: 20 }}>{visible.slice(0, limit).map((q) => <QuestionCard key={q.id} question={q} study />)}</View>
    {!visible.length && <Empty icon={tab === 'favorites' ? Bookmark : RotateCcw} title={search ? 'Nessuna corrispondenza' : tab === 'favorites' ? 'I tuoi preferiti iniziano qui.' : 'Nessuna domanda da ripassare.'} text={search ? 'Prova a cercare un’altra parola.' : tab === 'favorites' ? 'Premi il segnalibro accanto a una domanda per ritrovarla in questa pagina.' : 'Le risposte sbagliate o non date compariranno qui dopo un quiz. Quelle risolte correttamente usciranno da questo elenco.'} />}
    {visible.length > limit && <Pressable onPress={() => setLimit((n) => n + 20)} accessibilityRole="button" style={{ padding: 20 }}><Text style={{ color: color.green, textAlign: 'center' }}>Mostra altre 20 domande</Text></Pressable>}
  </Shell>;
}
