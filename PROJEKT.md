# PROJEKT.md – Verainfacher (vairbildlicher-google-web)

> **Träger:** KOPF, HAND + FUSS gGmbH  
> **Repository:** [KopfHandundFuss/vairbildlicher-google-web](https://github.com/KopfHandundFuss/vairbildlicher-google-web)  
> **Produktiv-URLs:** keine (Technikprobe, nur lokal).

> [!IMPORTANT]
> **Status: Hackathon-Technikprobe (Google × Aktion Mensch)**
> Dieses Repository prüft, ob sich im laufenden Chat **Bilder in Echtzeit** als Verständnishilfe erzeugen lassen.
> Es ist **keine neue Version und keine Erweiterung des Verainfachers**.
> Die folgende Beschreibung des Verainfachers erklärt die Ausgangscodebasis, auf der die Technikprobe aufbaut.
>
> **Analyse und Testergebnisse:** [docs/ANALYSE-2026-09-23.md](docs/ANALYSE-2026-09-23.md)
> - Die Modelle `gemini-3.8-flash` und `gemini-3.1-flash-image` sind verfügbar.
> - Text: ca. 6,5 s.
> - Bild: ca. 10–11 s.
> - Cloud TTS ist für den Hackathon-Schlüssel gesperrt (HTTP 403).
>   Deshalb läuft die Sprachausgabe jetzt über Gemini TTS.
> - Der aktuelle Bild-Prompt erzeugt trotz Verbot Schrift, falsche Daten und logoähnliche Elemente.
>   Das ist noch offen.
>
> **Design:** Die Oberfläche folgt dem Figma-Prototyp „A11y_Designs“ und wird Schritt für Schritt korrigiert.
> Details und Korrekturliste: [docs/DESIGN-UMSETZUNG.md](docs/DESIGN-UMSETZUNG.md)

---

## Stand (24.09.2026)

| Branch | Stand |
|---|---|
| `main` | `b7b3b1a`: initiales Projekt-Setup, unverändert |
| `dev` | `afe3fc8` Analyse und Doku, `87fc2cb` Befunde behoben, `361bc34` Startseite nach Mockup, globale Kopfzeile und responsives Layout, `5536fc2` Doku, `a0918c1` PDF-Upload und schlichte Titel-Symbole, `480dfa6` Doku, `36e1f52` Erfahrungsstufen wie in einfachfuturium-web. Noch nicht in `main` übernommen. |

**Fertig:**

- Gemini für Text, Bild und Sprache.
- Fotos werden vor dem Upload verkleinert.
- PDF-Upload: PDFs gehen direkt an Gemini. Die Grenze liegt bei 20 MB pro Datei.
- Typ-Prüfung ohne Fehler.
- Neue Startseite, globale Kopfzeile mit Logo und Barrierefreiheitsmenü.
- KI-Hinweis als eigene Seite.
- Volle Responsivität (mobile first).
- Erfahrungsstufen wie in einfachfuturium-web: Entdecker bis Zukunftsforscher, Icons aus `phosphor-svelte`.

**Offen:**

- Bildfunktion, der Kern der Technikprobe (geplant ab 24.09.2026):
  - Bild-Prompt mit eigenen Bildregeln aus den Befunden dieses Projekts.
    Der AInfach-Bildprompt wird hier bewusst nicht verwendet, weil er für ein anderes Problem gedacht ist.
  - Das Team analysiert dafür zuerst die 5 Systemprompts und vergleicht Lösungswege in einer eigenen Session.
  - Bild automatisch nach der Antwort.
  - Bild pro Satz.
- Satztrennung: „15. November“ wird in zwei Sätze zerlegt (`completion_items` in `gemini.service.ts`). Das muss vor dem Bild pro Satz behoben sein.
- Offene Punkte der Korrekturliste in `docs/DESIGN-UMSETZUNG.md`.

---

## Was ist der Verainfacher?

Der **Verainfacher** ist eine barrierefreie Web-Anwendung, die Menschen mit eingeschränkter Lesekompetenz (z. B. Menschen mit kognitiven Beeinträchtigungen, Lernbehinderung oder geringen Deutschkenntnissen) dabei hilft, schwer verständliche Texte – insbesondere Behördenpost und Amtsschreiben – schnell und einfach zu verstehen.

**Kernfunktion:** Nutzer:innen fotografieren ein Dokument oder laden ein Bild oder eine PDF hoch.
Die KI (Google Gemini) liest den Text und gibt ihn in **Easy Language Plus** zurück, einer Variante der Einfachen Sprache.
Dazu kommen schwierige Wörter, Folgefragen, ein Quiz und eine Sprachausgabe.

---

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Frontend-Framework | [SvelteKit](https://kit.svelte.dev/) 2.x mit Svelte 5 (Runes Mode) |
| Sprache | TypeScript |
| Styling | Tailwind CSS 4, Tokens in `layout.css` (`@theme`) |
| Schriften und Symbole | Inter, Plus Jakarta Sans, Material Symbols Rounded – lokal über npm (`@fontsource-variable/*`, `material-symbols`) |
| Animationen | GSAP 3 |
| Build-Tool | Vite 8 |
| Server/Adapter | `@sveltejs/adapter-node` (Node.js) |
| KI / Multimodal | Google Gemini API via `@google/genai` SDK |
| Text-to-Speech | Gemini TTS (`gemini-3.8-flash-tts`); optional Google Cloud TTS über REST |
| Session-Cache | Redis (Fallback: In-Memory) |
| Markdown-Rendering | `marked` + `dompurify` (XSS-Schutz) |
| Linting / Formatting | ESLint 10 + Prettier 3 |
| Node.js Mindestversion | `>= 24.0.0` |

---

## Projektstruktur

```
vairbildlicher-google-web/
├── src/
│   ├── routes/                        # SvelteKit Seiten & API-Endpunkte
│   │   ├── +page.svelte               # Haupt-App (State-Machine: initial → chat)
│   │   ├── +page.server.ts            # Server-side load (URL-Prompt-Handling)
│   │   ├── +layout.svelte             # Globales Layout
│   │   ├── layout.css                 # Globale Basis-Styles
│   │   └── api/                       # API-Endpunkte (SvelteKit server routes)
│   │       ├── chat/                  # POST /api/chat → Gemini Textvereinfachung
│   │       ├── tts/                   # POST /api/tts → Gemini TTS (optional Cloud TTS)
│   │       ├── difficult-words/       # POST /api/difficult-words → Worterklärungen
│   │       ├── followup-questions/    # POST /api/followup-questions → Folgefragen
│   │       ├── multiple-choice-challenge/ # POST /api/multiple-choice-challenge
│   │       └── visualize/             # POST /api/visualize → Bild-Illustration (gemini-3.1-flash-image)
│   └── lib/
│       ├── server/
│       │   ├── services/
│       │   │   ├── gemini.service.ts  # Gemini-KI-Logik (Chat, Bilder, Wörter, Folgefragen, Challenge)
│       │   │   ├── google-tts.service.ts # Sprachausgabe: Gemini TTS, optional Cloud TTS
│       │   │   └── redis.adapter.ts   # Redis-Client mit In-Memory-Fallback
│       │   └── index.ts               # Sammel-Export der Server-Services
│       ├── shared/
│       │   ├── domain/                # TypeScript-Typen & Domain-Modelle
│       │   ├── rewardSystem.ts        # Punkte-/Belohnungssystem (Coins, Level)
│       │   ├── audioCache.ts          # Client-seitiger Audio-Cache
│       │   ├── const.client.ts        # Client-Konstanten
│       │   ├── const.server.ts        # Server-Konstanten
│       │   ├── helper.ts              # Utility-Funktionen
│       │   └── image.client.ts        # Fotos vor dem Upload verkleinern (Browser)
│       └── ui/
│           ├── modules/               # Haupt-UI-Komponenten (Svelte)
│           │   ├── ChatFlow.svelte         # Chat-Verlauf & Nachrichten-Anzeige
│           │   ├── ChatHeader.svelte       # Punkte-Leiste im Chat (unter AppHeader)
│           │   ├── MultiPhotoCapture.svelte # Multi-Bild-Kamera-Aufnahme
│           │   ├── SelectImageFiles.svelte  # Datei-Upload & Kamera-Trigger
│           │   ├── InitialImageUpload.svelte # Erste-Bild-Upload-Ansicht
│           │   ├── AppHeader.svelte         # Globale Kopfzeile: Logo + Barrierefreiheitsmenü (alle Ansichten)
│           │   ├── LandingPage.svelte       # Startseite nach Figma-Mockup „A11y_Designs“
│           │   ├── Infopage.svelte          # alte Startseite (nur noch im Upload-Sonderfall)
│           │   ├── ChallengeOverlay.svelte  # Multiple-Choice-Quiz-Overlay
│           │   ├── CoinCollectionOverlay.svelte # Belohnungs-Animation
│           │   ├── AIWarningPage.svelte     # KI-Hinweis als eigene Seite (bei jedem Besuch zuerst)
│           │   ├── DesktopCamera.svelte     # Desktop-Webcam-Unterstützung
│           │   ├── Gallery.svelte           # Bild-Galerie-Ansicht
│           │   └── UserChatBar.svelte       # Eingabeleiste für Nutzer-Fragen
│           ├── a11y-settings.svelte.ts # Schriftgröße und Kontrast (Kopfzeile), im Browser gespeichert
│           ├── common/                # Wiederverwendbare UI-Bausteine
│           └── assets/                # Bilder, Icons etc.
├── static/                            # Statische Assets
│   ├── favicon.ico / favicon.png
│   ├── apple-touch-icon.png
│   ├── KHuF logo.png                  # KOPF, HAND + FUSS Logo
│   ├── images/verainfacher-logo.svg   # Logo mit Wortmarke (Quelle: ../Inputs/)
│   ├── images/landing/                # Bilder der 3 Schritte (mit Gemini erzeugt)
│   └── robots.txt
├── local-files/                       # Lokale Konfigurationsdateien (nicht im Build)
│   └── system-prompts/                # KI-System-Prompts als .txt-Dateien
│       ├── SummarySystemPrompt_v2.txt
│       ├── AnswerSystemPrompt_v2.txt
│       ├── DifficultWordsSystemPrompt.txt
│       ├── FollowUpQuestionsSystemPrompt.txt
│       └── ChallengeSystemPrompt.txt
├── docs/                              # Analysen & Testbefunde der Technikprobe
│   ├── ANALYSE-2026-09-23.md
│   ├── DESIGN-UMSETZUNG.md            # Umsetzung des Mockups + Korrekturliste
│   └── befunde/                       # Testbilder
├── .env                               # Lokale Umgebungsvariablen (nicht committen!)
├── .env.example                       # Vorlage für Umgebungsvariablen
├── svelte.config.js                   # SvelteKit-Konfiguration
├── vite.config.ts                     # Vite Build-Konfiguration
├── tsconfig.json                      # TypeScript-Konfiguration
├── eslint.config.js                   # ESLint-Konfiguration
├── .prettierrc                        # Prettier-Konfiguration
└── package.json                       # NPM-Abhängigkeiten & Skripte
```

---

## App-Architektur & Ablauf

```
Nutzer:in
   │
   ▼
+page.svelte  (State Machine)
   │
   ├─ immer oben ──► AppHeader (Logo + Barrierefreiheitsmenü)
   │
   ├─ [zuerst]   ──► AIWarningPage (KI-Hinweis, „OK“)
   │
   ├─ [initial]  ──► LandingPage (+ MultiPhotoCapture eingebettet)
   │                      │ Foto(s) aufgenommen
   │                      ▼
   ├─ [chatFlow] ──► ChatHeader (Punkte-Leiste) + ChatFlow.svelte
   │                      │ Bild(er) als Base64
   │                      ▼
   │               POST /api/chat
   │                      │
   │               gemini.service.ts
   │                      │
   │               Google Gemini API
   │               (gemini-3.8-flash, multimodal)
   │                      │
   │               ┌──────┼──────────┐
   │               ▼      ▼          ▼
   │          Zusammen- Schwierige  Folge-
   │          fassung   Wörter      fragen
   │          (Leichte  (Wort-      (/api/
   │          Sprache)  erklärung)  followup)
   │                      │
   │               (optional)
   │               ┌──────┴──────┐
   │               ▼             ▼
   │         /api/tts        /api/visualize
   │         Sprachausgabe   Bild-Illustration
   │         (Gemini TTS)    (gemini-3.1-flash-image)
   │
   └─ [Challenge] ──► ChallengeOverlay.svelte
                       Multiple-Choice-Quiz
                       + Belohnungssystem (Coins)
```

---

## KI-Modelle

**Kurz:** 5 Systemprompts, 3 Gemini-Modelle.
Davon ist nur `gemini-3.8-flash` ein Sprachmodell (LLM), die beiden anderen sind Spezialmodelle für Bild und Sprache.
Pro hochgeladenem Dokument laufen 4 Textaufrufe:

- die Zusammenfassung,
- danach gleichzeitig Folgefragen, schwierige Wörter und Quiz.

Bild und Vorlesen kommen nur auf Knopfdruck dazu.

| Modell | Verwendung |
|---|---|
| `gemini-3.8-flash` | Textzusammenfassung (Leichte Sprache), Chat, schwierige Wörter, Folgefragen, Challenge |
| `gemini-3.8-flash-tts` | Sprachausgabe (Stimme „Kore“, WAV) |
| `gemini-3.1-flash-image` | Verbildlichung: ein Bild pro KI-Antwort auf Knopfdruck (Gemini-Bildmodell, nicht Imagen) |

Alle drei Modelle sind am 23.09.2026 mit dem Hackathon-Schlüssel per `models.list` bestätigt.
Der Bild-Prompt steht fest im Code (`generateSentenceIllustration` in `gemini.service.ts`).
Er ist nicht als `.txt` ausgelagert.

### System-Prompts

Die KI-Anweisungen liegen als `.txt`-Dateien in `local-files/system-prompts/`.
Der Server cacht sie 5 Minuten lang, in Redis oder im Speicher.
So lassen sich die Prompts ohne neues Deployment anpassen.

| Prompt | Zweck |
|---|---|
| `SummarySystemPrompt_v2` | Dokumentzusammenfassung in Leichter Sprache |
| `AnswerSystemPrompt_v2` | Antworten auf Folgefragen |
| `DifficultWordsSystemPrompt` | Extraktion & Erklärung schwieriger Wörter |
| `FollowUpQuestionsSystemPrompt` | Generierung von 3 Folgefragen |
| `ChallengeSystemPrompt` | Multiple-Choice-Quiz als JSON |

---

## Session-Verwaltung & Cache

- **Chat-History:** Wird pro `chatId` (UUID) in Redis gespeichert (TTL: 30 Minuten, max. 30 Nachrichten).
- **System-Prompts:** Werden aus den `.txt`-Dateien geladen und **5 Minuten** gecacht, in Redis oder im Speicher.
  Der Ordner lässt sich mit `PROMPTS_DIR` ändern.
  Standard ist `local-files/system-prompts`, relativ zum Arbeitsverzeichnis.
- **Redis-Fallback:** Wenn Redis nicht erreichbar ist, wird automatisch ein In-Memory-Cache verwendet (keine Persistenz).
- **Audio-Cache:** TTS-Audiodateien werden im Browser für die aktuelle Sitzung zwischengespeichert.

---

## Belohnungssystem (Gamification)

Der Verainfacher enthält ein **Gamification-System** zur Förderung aktiver Nutzung:

- **Coins/Punkte** werden vergeben für: Texte vereinfachen, Fragen stellen, Quiz absolvieren, schwierige Wörter nachlesen.
- **Level-System** mit 7 Stufen, wie in einfachfuturium-web (seit 24.09.2026, vorher Tiernamen von „Maus“ bis „Säbelzahntiger“).
  Die Punktgrenzen sind unverändert (`LEVEL_DEFINITIONS` in `verainfacher.model.ts`).
  Die Icons kommen aus `phosphor-svelte` und werden einzeln importiert, damit nur diese 7 von über 1000 Icons im Bundle landen.

  | Stufe | Punkte | Icon |
  |---|---|---|
  | Entdecker | 0–199 | Rucksack (`BackpackIcon`) |
  | Sammler | 200–399 | Korb (`BasketIcon`) |
  | Chronist | 400–599 | Notizblock (`NotepadIcon`) |
  | Forscher | 600–799 | Lupe (`MagnifyingGlassIcon`) |
  | Wissenschaftler | 800–999 | Atom (`AtomIcon`) |
  | Visionär | 1000–1199 | Glühbirne (`LightbulbFilamentIcon`) |
  | Zukunftsforscher | ab 1200 | Rakete (`RocketLaunchIcon`) |
- **CoinCollectionOverlay:** Visuelle Animation beim Verdienen von Coins (GSAP-Animation).
- **ChallengeOverlay:** Multiple-Choice-Quiz zum Textverständnis, mit sofortigem Feedback und Punkte-Vergabe.

---

## Umgebungsvariablen

Kopiere `.env.example` nach `.env` und fülle die Werte aus:

```env
# Server
NODE_ENV=development
PORT=3000
BODY_SIZE_LIMIT=140M         # nur für node build: 5 Dateien × 20 MB plus Base64
ORIGIN=http://localhost:5173

# Pflicht: Google Gemini API-Schlüssel (Text, Bilder und Sprachausgabe)
# Zu beziehen über: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Nur setzen, um Google Cloud TTS statt Gemini TTS zu nutzen
# GOOGLE_TTS_API_KEY=your_google_cloud_tts_api_key_here

# Optional: anderer Ordner für die System-Prompts
# PROMPTS_DIR=/absoluter/pfad/zu/system-prompts

# Optional: Redis (ohne → automatischer In-Memory-Fallback)
# REDIS_URL=redis://localhost:6379
```

---

## Lokale Entwicklung

### Voraussetzungen

- Node.js **>= 24.0.0**
- npm oder ein kompatibler Package-Manager

### Setup & Start

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen einrichten
cp .env.example .env
# → .env öffnen und GEMINI_API_KEY eintragen

# 3. Entwicklungsserver starten (mit Hot Reload)
npm run dev

# → App läuft auf http://localhost:5173
```

> **Hinweis:** Der Entwicklungsserver ist auch im lokalen Netzwerk erreichbar (`--host` flag), z. B. für Tests auf dem Smartphone.

### Weitere NPM-Skripte

| Skript | Beschreibung |
|---|---|
| `npm run dev` | Entwicklungsserver starten (Vite HMR, im Netzwerk erreichbar) |
| `npm run build` | Produktions-Build erstellen (`./build`) |
| `npm run start` | Produktions-Build starten (`node build`) |
| `npm run preview` | Produktions-Build lokal vorschauen |
| `npm run check` | TypeScript + Svelte-Typen prüfen |
| `npm run lint` | Code-Qualität prüfen (ESLint + Prettier) |
| `npm run format` | Code automatisch formatieren |
| `npm run clean` | `node_modules` und `.svelte-kit` entfernen |

---

## Deployment

Die Anwendung verwendet `@sveltejs/adapter-node` und kann als **eigenständiger Node.js-Prozess** betrieben werden:

```bash
npm run build
node build
```

In `svelte.config.js` stehen als `trustedOrigins` nur lokale Adressen (`localhost:3000`, `localhost:5173`).
Für eine Demo unter einer eigenen Domain muss diese dort ergänzt werden.
`node build` muss im Hauptordner des Repos starten, sonst findet der Server die System-Prompts nicht.
Alternativ gibt `PROMPTS_DIR` den Ordner vor.

---

## Barrierefreiheit (A11y)

- **Sprache:** Easy Language Plus, eine Variante der Einfachen Sprache.
  Auf der Oberfläche steht jeder Satz in einer eigenen Zeile.
- **Barrierefreiheitsmenü** in der globalen Kopfzeile (`AppHeader.svelte`) mit sichtbarer Beschriftung:
  - **Schrift:** 3 Stufen (100 %, 112,5 %, 125 %).
  - **Kontrast:** schwarz auf weiß.
  - **Vorlesen:** liest den Text der aktuellen Ansicht.
  - Schrift und Kontrast bleiben im Browser gespeichert (`a11y-settings.svelte.ts`).
- **Sprachausgabe** über Gemini TTS (`gemini-3.8-flash-tts`, Stimme „Kore“, WAV).
  Mit gesetztem `GOOGLE_TTS_API_KEY` läuft sie stattdessen über Google Cloud TTS (`de-DE-Neural2-B`, MP3, etwas langsamer).
  Gemini TTS erhält nur den reinen Text.
  Stil-Anweisungen wie „Lies langsam vor:“ liest das Modell mit vor (getestet 23.09.2026).
- **Umgesetzte WCAG-Punkte:**
  - 1.3.3: Knöpfe werden über ihre Beschriftung beschrieben, nicht über die Farbe.
  - 2.5.3: Der Name für Screenreader ist gleich der sichtbaren Beschriftung.
  - 1.4.3: Der Kamera-Tipp hat 19:1 Kontrast.
  - 1.4.11: Sekundäre Knöpfe haben einen Rand mit mindestens 3,9:1.
  - Die Reihenfolge der Schritte ist als Helligkeits-Stufung umgesetzt.
  - Alle Werte sind nachgerechnet, nicht geschätzt.
- **Semantik:** Die Kopfzeile ist ein Seitenkopf (banner), und jede Ansicht hat genau ein `<main>`.
- **Mobile first, voll responsiv:** Die Inhaltsbreite reicht auf dem Handy über den ganzen Bildschirm, auf großen Bildschirmen bis 1280 px.
  Raster greifen ab 768 px bzw. 1280 px.
  Das fehlende `<meta name="viewport">` ist ergänzt.
- **Offene Punkte:** siehe Korrekturliste in `docs/DESIGN-UMSETZUNG.md`.

---

## Hinweise für Entwickler:innen

- **Svelte 5 Runes Mode** ist für das gesamte Projekt aktiv (`runes: true` in `svelte.config.js`). Kein `$store`, keine `onMount` mit Writable-Stores – stattdessen `$state`, `$derived`, `$effect`.
- **System-Prompts anpassen:** Einfach die `.txt`-Dateien in `local-files/system-prompts/` bearbeiten. Änderungen wirken spätestens nach 5 Minuten, wenn der Prompt-Cache abläuft.
  Sofort wirken sie nach einem Neustart des Servers oder wenn die Redis-Schlüssel `vair:prompts:*` gelöscht werden.
- **Typen bei `$state`:** `$state<T | null>(null)` schreiben, nicht `let x: T | null = $state(null)`.
  Sonst leitet TypeScript nur `null` ab.
- **Fotos und PDFs:**
  - `ChatFlow.svelte` verkleinert Fotos vor dem Senden über `src/lib/shared/image.client.ts` (max. 2048 px, JPEG 85 %).
  - PDFs gehen unverändert als `document` an Gemini (`gemini.service.ts`).
  - Die erlaubten Dateitypen und die Grenze von 20 MB pro Datei stehen in `const.client.ts`.
  - Gemini hat im Test PDFs bis 100 MB angenommen, die Grenze dient kurzen Upload-Zeiten.
- **Vorlesen anmelden:** Jede Ansicht meldet ihren Text mit `setReadAloudSource(() => text)` an (`a11y-settings.svelte.ts`).
  Die Funktion gibt eine Abmeldung zurück, die beim Verlassen der Ansicht aufgerufen wird.
- **Fixierte Overlays und `z-index`:** `layout.css` deckelt jedes `.fixed`-Element auf `z-index: 10`.
  Vollbild-Overlays brauchen die Klasse `layer-overlay`.
  Die Kopfzeilen im Fluss nutzen `z-[5]`.
- **Design-Tokens:** Farben und Schriften stehen in `layout.css` (`@theme`).
  Der Kontrast-Modus überschreibt dieselben Variablen.
  Neue Farben deshalb als Token anlegen und dort auch den Wert für den Kontrast-Modus setzen.
- **Texte in EL+:** Schritt-Texte der Startseite sind Zeilen-Listen (`lines`), ein Satz pro Zeile.
- **Knöpfe mit Symbol und Beschriftung:** Die Material-Symbols-Spans bekommen `aria-hidden="true"`.
  `aria-label` wiederholt genau die sichtbare Beschriftung.
- **Lokale Vorschau in Claude Code:** Eintrag `vairbildlicher-dev` in `Projects/.claude/launch.json`, Port 5181.
  Port 5173 belegt einfachfuturium-web.
- **Neue API-Endpunkte:** Im Ordner `src/routes/api/<endpunkt>/+server.ts` anlegen (SvelteKit-Konvention).
- **Kein globaler State-Manager:** Der App-State wird über Svelte Context (`setContext`/`getContext`) und Rune-State verwaltet.
