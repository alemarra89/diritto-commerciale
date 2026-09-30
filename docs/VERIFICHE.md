# Verifiche della prima versione

Data: 30 settembre 2026.

- Importazione: 450 domande, 45 capitoli da 10, ID univoci, numerazione da 1 a 10, quattro opzioni per ogni domanda, una sola corrispondenza con la risposta esatta. Nessuna nota nel CSV.
- Controllo TypeScript senza errori.
- 8 test Node superati: parser CSV, importazione con errori, campionamento, punteggio, scadenza assoluta, consegna anticipata, ricerca e ripasso degli errori.
- Bundle di produzione esportati per web, Android e iOS, inclusa compilazione Hermes per le piattaforme native.
- Versioni delle librerie native confrontate con `expo/bundledNativeModules.json`.
- Prova browser desktop e viewport 390 × 844: consultazione, avvio quiz, modifica e conservazione delle risposte dopo ricaricamento, conferma di consegna, scoring e filtri del riepilogo.
- Quiz capitolo di controllo: 1 corretta, 1 sbagliata, 8 non risposte; risultato 1/10.
- Simulazione di controllo: 30 gruppi domanda, 120 opzioni, conto alla rovescia persistente alla riapertura, navigazione diretta alle domande, consegna anticipata; risultato 1/30 con 29 non risposte.
- Ricerca `2082`: trovata sia nella domanda del capitolo 1 sia in un'opzione del capitolo 2.
- Preferito salvato e ritrovato nel ripasso; errori e non risposte presenti nell'elenco.
- Versione web di produzione: storico iniziale vuoto, capitolo 45 con 10 soluzioni, navigazione e link diretto dopo ricaricamento, nessun errore runtime rilevato.

La consegna automatica al minuto 30 e la scadenza mentre l'app è chiusa sono verificate nei test con timestamp controllati; non è stato lasciato un browser aperto per 30 minuti. Non è stata effettuata una prova su dispositivi Android/iOS fisici né la generazione di pacchetti firmati APK/IPA.

Il controllo npm segnala tre vulnerabilità moderate appartenenti alla medesima catena indiretta di Expo Router, documentate nel README. Nessuna segnalazione alta o critica.
