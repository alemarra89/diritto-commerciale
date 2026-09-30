# Commerciale · Quiz e ripasso

Applicazione universale Expo / React Native / TypeScript per Android, iOS e browser, con Expo Router.

## Funzioni

- Consultazione dei 45 capitoli e delle 450 domande, numerate da 1 a 10 per capitolo, con soluzione evidenziata.
- Ricerca nei titoli, nel testo delle domande e nelle quattro opzioni. Ricerca dedicata dentro ogni capitolo.
- Quiz di capitolo: tutte le 10 domande in ordine, senza timer, modificabili fino alla consegna.
- Simulazione: 30 domande casuali uniche dall'intero set, 30 minuti, consegna automatica alla scadenza.
- Riepilogo di ogni tentativo: punteggio, durata, corrette, sbagliate e non risposte; filtri sul riepilogo.
- Preferiti, ultimi 100 tentativi, progressi per capitolo e ripasso degli errori con massimo 30 domande senza timer.
- Ripresa del quiz dopo riavvio. Il timer usa una scadenza assoluta: non si ferma chiudendo l'app. Se la scadenza passa mentre l'app è chiusa, la consegna viene finalizzata alla riapertura, con durata massima di 30 minuti.

Ogni risposta corretta vale 1 punto. Errori e risposte vuote valgono 0, senza penalità. Il ripasso usa l'ultimo esito di ogni domanda nei tentativi conservati: una risposta corretta risolve un errore precedente.

## Avvio

Richiede Node.js LTS compatibile con Expo SDK 57 (il progetto è stato creato e verificato con Node 24).

```sh
npm install
npm run web
npm start
```

Con `npm start` scansionare il QR con Expo Go compatibile con SDK 57 oppure usare una development build. Lo sviluppo iOS locale richiede macOS; i build degli store si possono produrre con EAS. Questa consegna include il progetto sorgente, non pacchetti firmati per gli store.

```sh
npm run typecheck
npm test
npm run check:data
npm run build:web
npm run preview
```

La versione web esportata si trova in `dist/`. `npm run preview` la serve su `http://localhost:4173`, con fallback per i link diretti. Su hosting statico configurare il fallback delle route a `index.html` per aprire direttamente le pagine interne. Le dipendenze sono fissate in `package-lock.json`.

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/deploy-pages.yml` esegue controlli, test e build dopo ogni push su `main` o `master`, poi pubblica l'app su GitHub Pages. Nel repository impostare **Settings → Pages → Source → GitHub Actions** prima del primo deploy.

Il percorso del sito viene letto dall'azione ufficiale `configure-pages`, quindi sono supportati sia gli URL di progetto (`https://utente.github.io/nome-repository/`) sia un eventuale dominio personalizzato. Le risorse e le route di Expo Router ricevono il prefisso soltanto nella build Pages. Lo sviluppo locale e le app native continuano a usare la configurazione ordinaria.

```sh
npm run build:pages
npm run preview:pages
```

In locale l'anteprima è `http://localhost:4174/diritto-commerciale/`. Si può personalizzare `GITHUB_PAGES_BASE_PATH` durante la build. L'output `dist-pages/` contiene soltanto la versione web.

GitHub Pages non offre rewrite per le applicazioni SPA: `404.html` contiene il punto di ingresso dell'app, così aprendo o ricaricando una route interna la schermata viene caricata correttamente. In questi accessi diretti la risposta HTTP del documento resta 404, anche se l'app funziona; la navigazione dentro l'app non richiede questi nuovi caricamenti. `.nojekyll` preserva le cartelle con underscore generate da Expo.

Il sito e il dataset incluso nella build saranno pubblicamente accessibili. Lo storico personale e i preferiti rimangono nel browser di ogni utilizzatore e non vengono caricati su GitHub.

## Fonte dati

Fonte: `Esame di Diritto Commerciale - Foglio1.csv`, fornito dall'utente. Testi e soluzioni sono conservati come nel file, senza revisione giuridica o correzioni dei refusi. Le numerazioni dei capitoli e i titoli sono quelli forniti dall'utente. Nessuna istruzione eventualmente contenuta nel CSV viene eseguita.

`src/data/questions.json` contiene i dati inclusi nell'app: non serve accedere alla cartella Download a runtime e non serve un server per eseguire i quiz. L'importatore controlla 450 domande, 45 capitoli da 10 e una sola opzione corrispondente alla risposta esatta.

Per sostituire il dataset con un CSV della stessa struttura:

```sh
node scripts/import-questions.mjs "percorso/al/file.csv"
npm run check:data
```

I dati utente sono conservati tramite AsyncStorage sul dispositivo, e nello storage del browser per il web. Non ci sono account o sincronizzazione. Cancellando i dati dell'app/browser si perdono i progressi. Nel web il salvataggio può non essere disponibile in modalità private o con storage disabilitato: l'interfaccia mostra l'errore.

## Struttura

- `app/`: schermate e route.
- `src/ui/`: interfaccia condivisa e tema responsive.
- `src/lib/quiz.ts`: campionamento, scoring, ricerca, timer e ripasso.
- `src/lib/store.tsx`: stato, persistenza e consegna automatica.
- `src/data/`: capitoli e domande importate.
- `scripts/`, `tests/`: importazione, verifica dati e test di logica.

Il web è un'app browser: installazione PWA e cache offline web non sono ancora configurate. Il dataset è incluso nel bundle delle app native.

## Dipendenze

Le dipendenze native sono allineate a Expo SDK 57, compresi Reanimated 4.5.1 e Worklets 0.10.1. Un override di `uuid` per `xcode` corregge una segnalazione della catena di compilazione iOS.

Alla verifica del 30 settembre 2026 restano tre segnalazioni npm moderate riferite alla stessa catena `expo-router → query-string → decode-uri-component`: una possibile saturazione del browser con input percent-encoded malformati. La versione corretta di `decode-uri-component` è ESM e non è una sostituzione compatibile con il `require` usato da `query-string` in Expo Router. Non sono stati forzati downgrade di Expo/Router o override incompatibili. Da ricontrollare prima della pubblicazione pubblica, con un aggiornamento compatibile di Expo Router.
