import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { Check, Clock3, GraduationCap, Layers3, Shuffle } from 'lucide-react-native';
import { useStudy } from '../src/lib/store';
import { PageTitle, Shell, StartQuiz, Stat, Tag } from '../src/ui/components';
import { color, serif, ui } from '../src/ui/theme';

export default function ExamPage() {
  const mobile = useWindowDimensions().width < 700;
  const exams = useStudy().history.filter((a) => a.mode === 'exam');
  const best = exams.length ? Math.max(...exams.map((a) => a.correct)) : null;
  return <Shell active="/esame"><PageTitle label="Mettiti alla prova" title="È il momento della simulazione." description="Un allenamento su tutto il programma, con domande diverse a ogni tentativo." />
    <View style={[ui.card, { padding: mobile ? 26 : 40, backgroundColor: '#F5F1E7', borderColor: '#E9E1CE', gap: 24 }]}><View style={ui.spread}><View style={{ backgroundColor: '#EDE3CD', padding: 18, borderRadius: 16 }}><GraduationCap size={38} color={color.amber} strokeWidth={1.5} /></View><Tag tone="warm">Simulazione d’esame</Tag></View><Text style={{ fontFamily: serif, fontSize: mobile ? 30 : 38, lineHeight: 45, color: color.ink }}>30 domande. 30 minuti.</Text><Text style={[ui.muted, { maxWidth: 650 }]}>Le domande sono estratte casualmente dalle 450 disponibili, senza ripetizioni nello stesso quiz. Puoi rispondere nell’ordine che preferisci e cambiare ogni scelta fino alla consegna.</Text>
      <View style={{ gap: 16 }}>{[
        [Shuffle, 'Una nuova selezione casuale a ogni simulazione.'],
        [Clock3, 'Il timer parte quando premi “Inizia la simulazione”.'],
        [Check, '1 punto per risposta corretta; nessuna penalità per gli errori.'],
        [Layers3, 'Riepilogo finale con punteggio, durata e tutte le risposte.'],
      ].map(([Icon, text], i) => { const Glyph = Icon as typeof Check; return <View key={i} style={ui.row}><Glyph size={18} color={color.green} /><Text style={[ui.text, { flex: 1, fontSize: 14 }]}>{text as string}</Text></View>; })}</View>
      <View style={{ backgroundColor: '#ECE5D7', padding: 18, borderRadius: 12 }}><Text style={[ui.muted, { fontSize: 13, color: '#786D58' }]}>Allo scadere dei 30 minuti il quiz si consegna automaticamente. Le domande non risposte valgono 0 punti. Se esci o chiudi l’app, il tempo continua a scorrere.</Text></View><View style={{ alignSelf: mobile ? 'stretch' : 'flex-start' }}><StartQuiz mode="exam">Inizia la simulazione</StartQuiz></View>
    </View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 22 }}><Stat label="Simulazioni completate" value={exams.length} /><Stat label="Miglior punteggio" value={best === null ? '—' : `${best}/30`} /><Stat label="Domande nel programma" value="450" /></View>
  </Shell>;
}
