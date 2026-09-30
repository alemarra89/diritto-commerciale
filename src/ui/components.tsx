import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { ArrowRight, Bookmark, BookOpen, Check, CircleHelp, Clock3, GraduationCap, History, House, Layers3, Search, X, RotateCcw, type LucideIcon } from 'lucide-react-native';
import { color, serif, ui } from './theme';
import { useStudy } from '../lib/store';
import type { Mode, Question } from '../lib/quiz';
import { chapters } from '../data';

export function Button({ children, onPress, secondary = false, disabled = false, icon: Icon, small = false }: { children: React.ReactNode; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: LucideIcon; small?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, small && { paddingVertical: 10 }, { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 }]}>
    <Text style={[s.buttonText, secondary && { color: color.ink }]}>{children}</Text>{Icon && <Icon size={17} color={secondary ? color.ink : '#fff'} />}
  </Pressable>;
}
export function Tag({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'warm' | 'red' }) {
  return <View style={[s.tag, { backgroundColor: tone === 'warm' ? color.warm : tone === 'red' ? color.redSoft : color.soft }]}><Text style={{ color: tone === 'warm' ? color.amber : tone === 'red' ? color.red : color.green, fontSize: 11, fontWeight: '600' }}>{children}</Text></View>;
}
export function PageTitle({ label, title, description, action }: { label?: string; title: string; description?: string; action?: React.ReactNode }) {
  const compact = useWindowDimensions().width < 600;
  return <View style={{ gap: 10, marginBottom: 28 }}>
    {label && <Text style={ui.eyebrow}>{label}</Text>}
    <View style={[ui.spread, compact && { flexDirection: 'column', alignItems: 'flex-start' }]}><Text style={[ui.title, compact && { fontSize: 31, lineHeight: 39 }, { flex: compact ? undefined : 1 }]}>{title}</Text>{action}</View>
    {description && <Text style={[ui.muted, { maxWidth: 700 }]}>{description}</Text>}
  </View>;
}
const navigation: { title: string; short: string; route: string; icon: LucideIcon }[] = [
  { title: 'Panoramica', short: 'Home', route: '/', icon: House },
  { title: 'I capitoli', short: 'Capitoli', route: '/capitoli', icon: BookOpen },
  { title: 'Simulazione d’esame', short: 'Esame', route: '/esame', icon: GraduationCap },
  { title: 'Il mio ripasso', short: 'Ripasso', route: '/ripasso', icon: Bookmark },
  { title: 'Storico risultati', short: 'Storico', route: '/storico', icon: History },
];
export function Shell({ children, active, scroll = true }: { children: React.ReactNode; active?: string; scroll?: boolean }) {
  const path = usePathname();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const store = useStudy();
  const current = active ?? path;
  const nav = (mobile: boolean) => navigation.map(({ route, title, short, icon: Icon }) => {
    const selected = current === route;
    return <Pressable key={route} accessibilityRole="button" accessibilityLabel={title} onPress={() => router.push(route as never)} style={({ pressed }) => [mobile ? s.mobileNavItem : s.navItem, selected && !mobile && { backgroundColor: color.soft }, pressed && { opacity: 0.65 }]}>
      <Icon size={mobile ? 21 : 19} color={selected ? color.green : color.muted} strokeWidth={selected ? 2.3 : 1.7} />
      <Text style={{ color: selected ? color.green : color.muted, fontSize: mobile ? 10 : 14, fontWeight: selected ? '700' : '500' }}>{mobile ? short : title}</Text>
    </Pressable>;
  });
  return <View style={s.shell}>
    {wide && <View style={s.sidebar}>
      <View style={s.brand}><View style={s.brandIcon}><Layers3 size={22} color={color.paper} /></View><View><Text style={s.brandName}>Commerciale</Text><Text style={s.brandSub}>IL TUO SPAZIO DI STUDIO</Text></View></View>
      <Text style={[ui.eyebrow, { paddingHorizontal: 16, marginTop: 44, marginBottom: 16 }]}>La tua preparazione</Text>
      <View style={{ gap: 6 }}>{nav(false)}</View>
      <View style={{ flex: 1 }} />
      <View style={s.sidebarNote}><View style={ui.row}><BookOpen size={18} color={color.green} /><Text style={{ fontSize: 13, fontWeight: '700', color: color.ink }}>Un capitolo alla volta.</Text></View><Text style={[ui.muted, { fontSize: 12, marginTop: 8 }]}>45 capitoli, 450 domande.{ '\n' }Il prossimo passo parte da qui.</Text></View>
      <Text style={[ui.muted, { fontSize: 11, padding: 16 }]}>DIRITTO COMMERCIALE · 2026</Text>
    </View>}
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={[s.topbar, { paddingHorizontal: wide ? 44 : 20 }]}>
        {wide ? <Text style={{ color: color.muted, fontSize: 13 }}>La tua scrivania di studio</Text> : <View style={ui.row}><Layers3 size={19} color={color.green} /><Text style={s.brandName}>Commerciale</Text></View>}
        <View style={ui.row}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color.green }} /><Text style={[ui.muted, { fontSize: 11 }]}>Studio personale</Text></View>
      </View>
      {store.storageError && <View style={{ padding: 12, backgroundColor: color.warm }}><Text style={ui.text}>{store.storageError}</Text></View>}
      {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled"><View style={[s.content, { padding: width < 600 ? 20 : 40 }]}>{children}<Text style={s.footer}>Commerciale · Uno spazio per imparare, provare e ripassare.</Text></View></ScrollView> : children}
      {!wide && <View style={s.mobileNav}>{nav(true)}</View>}
    </View>
  </View>;
}
export function SearchBox({ value, onChange, placeholder = 'Cerca una domanda o una risposta…' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <View style={s.search}><Search size={19} color={color.muted} /><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={color.muted} style={s.input} accessibilityLabel={placeholder} />{value.length > 0 && <Pressable onPress={() => onChange('')} accessibilityLabel="Cancella ricerca" accessibilityRole="button" style={{ padding: 8 }}><X size={17} color={color.muted} /></Pressable>}</View>;
}
export function Empty({ icon: Icon = CircleHelp, title, text, children }: { icon?: LucideIcon; title: string; text: string; children?: React.ReactNode }) {
  return <View style={[ui.card, { alignItems: 'center', paddingVertical: 48, gap: 14 }]}><Icon size={34} color={color.green} strokeWidth={1.4} /><Text style={[ui.h2, { textAlign: 'center' }]}>{title}</Text><Text style={[ui.muted, { textAlign: 'center', maxWidth: 440 }]}>{text}</Text>{children}</View>;
}
export function Loading() { return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg, gap: 16 }}><ActivityIndicator color={color.green} /><Text style={ui.muted}>Apriamo il tuo spazio di studio…</Text></View>; }
export function Confirm({ visible, title, text, confirm = 'Conferma', onConfirm, onClose, alternate, onAlternate }: { visible: boolean; title: string; text: string; confirm?: string; onConfirm: () => void; onClose: () => void; alternate?: string; onAlternate?: () => void }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View style={s.overlay}><View accessibilityViewIsModal style={[ui.card, { width: '100%', maxWidth: 450, gap: 20 }]}><View style={ui.spread}><Text style={[ui.h2, { flex: 1 }]}>{title}</Text><Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Chiudi" style={{ padding: 8 }}><X size={21} color={color.ink} /></Pressable></View><Text style={ui.muted}>{text}</Text><Button onPress={onConfirm}>{confirm}</Button>{alternate && onAlternate && <Button secondary onPress={onAlternate}>{alternate}</Button>}<Pressable onPress={onClose} accessibilityRole="button" style={{ padding: 8, alignSelf: 'center' }}><Text style={ui.muted}>Annulla</Text></Pressable></View></View></Modal>;
}
export function StartQuiz({ mode, chapterId, children, secondary = false }: { mode: Mode; chapterId?: number; children: string; secondary?: boolean }) {
  const store = useStudy();
  const [confirm, setConfirm] = useState(false);
  const start = () => { store.start(mode, chapterId); setConfirm(false); router.push('/quiz'); };
  return <><Button secondary={secondary} icon={ArrowRight} onPress={() => store.session ? setConfirm(true) : start()}>{children}</Button><Confirm visible={confirm} title="Hai un quiz in corso" text="Puoi riprendere le risposte già salvate oppure abbandonare il quiz e iniziarne uno nuovo. Il tempo della simulazione continua a scorrere." confirm="Riprendi il quiz" onConfirm={() => { setConfirm(false); router.push('/quiz'); }} alternate="Abbandona e inizia il nuovo quiz" onAlternate={start} onClose={() => setConfirm(false)} /></>;
}
export function QuestionCard({ question, selected, onSelect, study = false, review = false, displayNumber }: { question: Question; selected?: number; onSelect?: (index: number) => void; study?: boolean; review?: boolean; displayNumber?: number }) {
  const { favorites, toggleFavorite } = useStudy();
  const showCorrect = study || review;
  const isFavorite = favorites.includes(question.id);
  const status = selected === undefined ? 'Non risposta' : selected === question.correctIndex ? 'Corretta' : 'Da ripassare';
  return <View style={[ui.card, { gap: 20, padding: 22 }]}>
    <View style={ui.spread}><View style={[ui.row, { flex: 1, flexWrap: 'wrap', gap: 8 }]}><Text style={ui.eyebrow}>Domanda {displayNumber ?? question.number}{review || study ? ` · Cap. ${question.chapterId}` : ''}</Text>{review && <Tag tone={status === 'Corretta' ? 'green' : status === 'Non risposta' ? 'warm' : 'red'}>{status}</Tag>}</View><Pressable onPress={() => toggleFavorite(question.id)} accessibilityRole="button" accessibilityLabel={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'} accessibilityState={{ selected: isFavorite }} style={{ padding: 8 }}><Bookmark size={19} color={isFavorite ? color.green : color.muted} fill={isFavorite ? color.soft : 'none'} /></Pressable></View>
    <Text style={{ fontSize: 18, lineHeight: 27, fontWeight: '600', color: color.ink }}>{question.text}</Text>
    <View accessibilityRole={onSelect ? 'radiogroup' : undefined} accessibilityLabel={onSelect ? `Risposte alla domanda ${displayNumber ?? question.number}` : undefined} style={{ gap: 9 }}>{question.options.map((option, i) => {
      const correct = showCorrect && i === question.correctIndex;
      const wrong = review && i === selected && i !== question.correctIndex;
      const chosen = !showCorrect && selected === i;
      return <Pressable key={i} disabled={!onSelect} onPress={() => onSelect?.(i)} accessibilityRole={onSelect ? 'radio' : undefined} aria-checked={onSelect ? selected === i : undefined} accessibilityLabel={`${String.fromCharCode(65 + i)}. ${option}${correct ? '. Risposta esatta' : wrong ? '. La tua risposta, errata' : ''}`} accessibilityState={onSelect ? { checked: selected === i } : undefined} style={({ pressed }) => [s.option, correct && s.correct, wrong && s.wrong, chosen && s.chosen, pressed && onSelect && { opacity: 0.7 }]}>
        <View style={[s.letter, (correct || chosen) && { backgroundColor: color.green, borderColor: color.green }, wrong && { backgroundColor: color.red, borderColor: color.red }]}>{correct ? <Check size={14} color="#fff" /> : wrong ? <X size={14} color="#fff" /> : <Text style={{ fontSize: 12, fontWeight: '600', color: chosen ? '#fff' : color.muted }}>{String.fromCharCode(65 + i)}</Text>}</View>
        <View style={{ flex: 1, gap: 4 }}><Text style={[ui.text, { fontSize: 14 }, correct && { color: color.green, fontWeight: '600' }, wrong && { color: color.red }]}>{option}</Text>{correct && <Text style={{ color: color.green, fontSize: 11, fontWeight: '600' }}>Risposta esatta{review && selected === i ? ' · La tua risposta' : ''}</Text>}{wrong && <Text style={{ color: color.red, fontSize: 11 }}>La tua risposta</Text>}</View>
        {chosen && <Check size={16} color={color.green} />}
      </Pressable>;
    })}</View>
    {(study || review) && question.note ? <Text style={ui.muted}>{question.note}</Text> : null}
    {(study || review) && <Text style={[ui.muted, { fontSize: 11 }]}>{chapters[question.chapterId - 1]?.title}{review ? ` · Domanda ${question.number} del capitolo` : ''}</Text>}
  </View>;
}
export function SectionHeader({ title, caption, action }: { title: string; caption?: string; action?: React.ReactNode }) { return <View style={[ui.spread, { marginBottom: 18, marginTop: 30 }]}><View style={{ flex: 1, gap: 5 }}><Text style={ui.h2}>{title}</Text>{caption && <Text style={ui.muted}>{caption}</Text>}</View>{action}</View>; }
export function TextLink({ children, onPress }: { children: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={ui.row}><Text style={{ color: color.green, fontSize: 13, fontWeight: '600' }}>{children}</Text><ArrowRight size={15} color={color.green} /></Pressable>; }
export function Progress({ value }: { value: number }) { return <View style={{ backgroundColor: color.line, height: 5, borderRadius: 8, overflow: 'hidden' }}><View style={{ backgroundColor: color.green, width: `${Math.min(100, Math.max(0, value))}%`, height: 5, borderRadius: 8 }} /></View>; }
export function ModeIcon({ mode }: { mode: Mode }) { const Icon = mode === 'exam' ? GraduationCap : mode === 'mistakes' ? RotateCcw : BookOpen; return <Icon size={22} color={color.green} />; }
export function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon?: LucideIcon }) { return <View style={[ui.card, { flex: 1, minWidth: 120, padding: 20, gap: 16 }]}><View style={ui.spread}><Text style={[ui.muted, { fontSize: 12 }]}>{label}</Text>{Icon && <Icon size={17} color={color.muted} />}</View><Text style={{ fontFamily: serif, color: color.ink, fontSize: 30 }}>{value}</Text></View>; }
const s = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', backgroundColor: color.bg },
  sidebar: { width: 252, padding: 20, borderRightWidth: 1, borderColor: color.line, backgroundColor: '#FCFCF9' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 9 },
  brandIcon: { backgroundColor: color.green, width: 37, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: serif, color: color.ink, fontSize: 21, letterSpacing: -0.5 },
  brandSub: { fontSize: 8, letterSpacing: 1.2, color: color.muted, marginTop: 4 },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 11, gap: 13 },
  sidebarNote: { backgroundColor: color.soft, padding: 16, borderRadius: 14, marginBottom: 15 },
  topbar: { height: 72, borderBottomWidth: 1, borderColor: color.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  content: { width: '100%', maxWidth: 1250, alignSelf: 'center', flex: 1 },
  mobileNav: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: color.paper, borderTopWidth: 1, borderColor: color.line, paddingTop: 10, paddingBottom: 12 },
  mobileNavItem: { alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 42, minWidth: 54 },
  footer: { fontSize: 11, color: color.muted, textAlign: 'center', paddingTop: 42, paddingBottom: 8 },
  button: { backgroundColor: color.green, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  secondary: { backgroundColor: 'transparent', borderColor: color.line, borderWidth: 1 },
  tag: { paddingVertical: 6, paddingHorizontal: 9, borderRadius: 6, alignSelf: 'flex-start' },
  search: { backgroundColor: color.paper, borderWidth: 1, borderColor: color.line, borderRadius: 12, paddingHorizontal: 16, minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: color.ink, minWidth: 0 },
  overlay: { flex: 1, backgroundColor: 'rgba(20,40,30,0.45)', justifyContent: 'center', alignItems: 'center', padding: 22 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: color.line, backgroundColor: '#FDFDFB' },
  letter: { width: 27, height: 27, borderRadius: 14, borderWidth: 1, borderColor: color.line, alignItems: 'center', justifyContent: 'center' },
  correct: { backgroundColor: color.soft, borderColor: '#B7CEB2' },
  wrong: { backgroundColor: color.redSoft, borderColor: '#EDC6BD' },
  chosen: { backgroundColor: color.soft, borderColor: color.green },
});
