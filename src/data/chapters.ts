export const chapterTitles = [
  'La nozione di Imprenditore',
  "L'imprenditore commerciale",
  "L'imprenditore agricolo",
  "L'azienda",
  'I segni distintivi',
  'Le scritture contabili',
  'Società: principi generali',
  'La società semplice',
  'La società in nome collettivo: profili patrimoniali',
  'La società in nome collettivo: amministrazione e responsabilità dei soci',
  'La società in accomandita semplice',
  'La società per azioni: introduzione e caratteri generali',
  'La costituzione della s.p.a.',
  'Capitale, conferimenti e patrimonio nella s.p.a.',
  'Le azioni',
  'Categorie di azioni e strumenti finanziari',
  "L'assemblea nel sistema tradizionale",
  "Lo svolgimento dell'assemblea e le deleghe di voto",
  "L'invalidità delle delibere assembleari",
  "L'organo di amministrazione della s.p.a.: caratteri generali",
  'Consiglio di amministrazione e organi delegati',
  'Il potere di rappresentanza degli amministratori',
  'La responsabilità degli amministratori verso la società',
  'La responsabilità degli amministratori verso i creditori sociali, terzi e soci',
  'Sistemi di amministrazione e controllo alternativi (monistico e dualistico)',
  'Il ruolo del collegio sindacale',
  'Controllo contabile e controlli esterni',
  'Le modifiche dello statuto: il recesso del socio',
  "L'aumento di capitale",
  'La riduzione del capitale sociale',
  'Le obbligazioni',
  'Lo scioglimento della società',
  'Liquidazione ed estinzione della società',
  'La S.r.l.: profili generali',
  'I conferimenti dei soci nella S.r.l.',
  'La partecipazione del socio: la quota',
  'Il trasferimento della quota nella S.r.l.',
  "L'amministrazione nella S.r.l.",
  'Le decisioni dei soci e i sistemi di controllo nella S.r.l.',
  "Il recesso e l'esclusione del socio nella S.r.l.",
  "Le modificazioni dell'atto costitutivo nella S.r.l.",
  'Le nuove forme di S.r.l.',
  'Le società cooperative: caratteristiche generali e struttura finanziaria',
  'I rapporti di partecipazione e i gruppi di società',
  "L'attività di direzione e coordinamento",
] as const;

export const chapters = chapterTitles.map((title, index) => ({ id: index + 1, title, count: 10 }));
export function chapterGroup(id: number) {
  if (id <= 6) return 'Impresa e azienda';
  if (id <= 11) return 'Società di persone';
  if (id <= 33) return 'Società per azioni';
  if (id <= 42) return 'Società a responsabilità limitata';
  return 'Cooperative e gruppi';
}
