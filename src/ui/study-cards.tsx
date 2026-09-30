import React, { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, ChevronRight, BookOpen } from 'lucide-react-native';
import { chapters, chapterGroup } from '../data';
import { useStudy } from '../lib/store';
import type { Attempt } from '../lib/quiz';
import { formatDuration } from '../lib/quiz';
import { color, ui } from './theme';
import { ModeIcon, Progress, Tag } from './components';

export function ChapterCard({ chapter }: { chapter: typeof chapters[number] }) {
  const [hovered, setHovered] = useState(false);
  const { history } = useStudy();
  const last = history.find((a) => a.mode === 'chapter' && a.chapterId === chapter.id);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Capitolo ${chapter.id}: ${chapter.title}`} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)} onPress={() => router.push(`/capitolo/${chapter.id}`)} style={({ pressed }) => [ui.card, { flex: 1, minWidth: 240, gap: 18, opacity: pressed ? 0.8 : 1, borderColor: hovered ? '#B0C1A4' : color.line }]}>
    <View style={ui.spread}><Text style={ui.eyebrow}>Capitolo {String(chapter.id).padStart(2, '0')}</Text><BookOpen size={18} color={color.green} strokeWidth={1.5} /></View>
    <Text style={{ fontSize: 17, lineHeight: 25, color: color.ink, fontWeight: '600', minHeight: 50 }}>{chapter.title}</Text>
    <Text style={[ui.muted, { fontSize: 12 }]}>{chapterGroup(chapter.id)}</Text>
    <Progress value={last ? last.correct * 10 : 0} />
    <View style={ui.spread}><Text style={[ui.muted, { fontSize: 12 }]}>{last ? `Ultimo quiz: ${last.correct}/10` : '10 domande · Da esplorare'}</Text><ArrowRight size={16} color={color.green} /></View>
  </Pressable>;
}
export function attemptTitle(attempt: Attempt) {
  return attempt.mode === 'exam' ? 'Simulazione d’esame' : attempt.mode === 'mistakes' ? 'Ripasso degli errori' : `Cap. ${attempt.chapterId} · ${chapters[(attempt.chapterId ?? 1) - 1]?.title}`;
}
export function AttemptRow({ attempt }: { attempt: Attempt }) {
  const mobile = useWindowDimensions().width < 600;
  return <Pressable accessibilityRole="button" onPress={() => router.push(`/risultato/${attempt.id}`)} style={({ pressed }) => [ui.card, { padding: 18, opacity: pressed ? 0.7 : 1, flexDirection: 'row', alignItems: 'center', gap: mobile ? 12 : 18 }]}>
    <View style={{ backgroundColor: color.soft, padding: 12, borderRadius: 12 }}><ModeIcon mode={attempt.mode} /></View>
    <View style={{ flex: 1, gap: 5 }}><Text style={{ fontSize: 14, fontWeight: '600', color: color.ink }}>{attemptTitle(attempt)}</Text><Text style={[ui.muted, { fontSize: 12 }]}>{new Date(attempt.finishedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })} · {formatDuration(attempt.durationSeconds)}</Text></View>
    <Tag tone={attempt.correct / attempt.questionIds.length >= 0.7 ? 'green' : 'warm'}>{attempt.correct}/{attempt.questionIds.length}</Tag><ChevronRight size={17} color={color.muted} />
  </Pressable>;
}
