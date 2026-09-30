import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { chapters, chapterGroup, questions } from '../../src/data';
import { matchesQuestion } from '../../src/lib/quiz';
import { Empty, PageTitle, QuestionCard, SearchBox, Shell, StartQuiz, Tag, TextLink } from '../../src/ui/components';
import { ui } from '../../src/ui/theme';

export default function ChapterPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chapter = chapters.find((c) => c.id === Number(id));
  const [search, setSearch] = useState('');
  if (!chapter) return <Shell active="/capitoli"><Empty title="Capitolo non trovato" text="Scegli uno dei capitoli del programma."><TextLink onPress={() => router.replace('/capitoli')}>Apri i capitoli</TextLink></Empty></Shell>;
  const filtered = questions.filter((q) => q.chapterId === chapter.id && matchesQuestion(q, search));
  return <Shell active="/capitoli"><View style={{ marginBottom: 24 }}><TextLink onPress={() => router.push('/capitoli')}>Tutti i capitoli</TextLink></View><PageTitle label={`Capitolo ${String(chapter.id).padStart(2, '0')} · ${chapterGroup(chapter.id)}`} title={chapter.title} description="Studia le 10 domande in ordine. In questa pagina la risposta esatta è sempre visibile." action={<StartQuiz mode="chapter" chapterId={chapter.id}>Inizia il quiz</StartQuiz>} />
    <View style={[ui.row, { marginBottom: 24, flexWrap: 'wrap' }]}><Tag>10 domande</Tag><Tag>Nessun timer</Tag><Tag>1 punto per risposta corretta</Tag></View>
    <SearchBox value={search} onChange={setSearch} placeholder="Cerca nelle domande e nelle risposte di questo capitolo…" />
    <Text style={[ui.muted, { marginTop: 18, marginBottom: 16 }]}>{search ? `${filtered.length} domande trovate` : 'Le domande del capitolo'} · Salva quelle da rivedere con il segnalibro.</Text>
    <View style={{ gap: 18 }}>{filtered.map((q) => <QuestionCard key={q.id} question={q} study />)}</View>
    {!filtered.length && <Empty icon={BookOpen} title="Nessuna corrispondenza" text="Prova a cercare una parola diversa nella domanda o nelle risposte." />}
    <View style={[ui.spread, { marginTop: 30, flexWrap: 'wrap' }]}>{chapter.id > 1 && <TextLink onPress={() => { setSearch(''); router.replace(`/capitolo/${chapter.id - 1}`); }}>Capitolo precedente</TextLink>}{chapter.id < 45 && <TextLink onPress={() => { setSearch(''); router.replace(`/capitolo/${chapter.id + 1}`); }}>Capitolo successivo</TextLink>}</View>
  </Shell>;
}
