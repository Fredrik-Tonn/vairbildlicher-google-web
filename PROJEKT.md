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

---

## Was ist der Verainfacher?

Der **Verainfacher** ist eine barrierefreie Web-Anwendung, die Menschen mit eingeschränkter Lesekompetenz (z. B. Menschen mit kognitiven Beeinträchtigungen, Lernbehinderung oder geringen Deutschkenntnissen) dabei hilft, schwer verständliche Texte – insbesondere Behördenpost und Amtsschreiben – schnell und einfach zu verstehen.

**Kernfunktion:** Nutzer:innen fotografieren oder laden ein Bild eines Dokuments hoch. Die KI (Google Gemini) liest den Text aus dem Bild und gibt ihn in **Leichter und Einfacher Sprache** zurück – inklusive Erklärung schwieriger Wörter, Folgefragen und optionaler Sprachausgabe.

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
   ├─ [initial]  ──► LandingPage (+ MultiPhotoCapture eingebettet)
   │                      │ Foto(s) aufgenommen
   │                      ▼
   ├─ [chatFlow] ──► ChatFlow.svelte
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
   │         (Google TTS)    (gemini-3.1-flash-image)
   │
   └─ [Challenge] ──► ChallengeOverlay.svelte
                       Multiple-Choice-Quiz
                       + Belohnungssystem (Coins)
```

---

## KI-Modelle

| Modell | Verwendung |
|---|---|
| `gemini-3.8-flash` | Textzusammenfassung (Leichte Sprache), Chat, schwierige Wörter, Folgefragen, Challenge |
| `gemini-3.8-flash-tts` | Sprachausgabe (Stimme „Kore“, WAV) |
| `gemini-3.1-flash-image` | Verbildlichung: ein Bild pro KI-Antwort auf Knopfdruck (Gemini-Bildmodell, nicht Imagen) |

Beide Modelle sind am 23.09.2026 mit dem Hackathon-Schlüssel per `models.list` bestätigt.
Der Bild-Prompt steht fest im Code (`generateSentenceIllustration` in `gemini.service.ts`).
Er ist nicht als `.txt` ausgelagert.

### System-Prompts

Die KI-Anweisungen sind als externe `.txt`-Dateien im Ordner `local-files/system-prompts/` abgelegt und werden beim Start in Redis gecacht. So können Prompts ohne Code-Deployment angepasst werden.

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
- **Level-System** mit verschiedenen Stufen.
- **CoinCollectionOverlay:** Visuelle Animation beim Verdienen von Coins (GSAP-Animation).
- **ChallengeOverlay:** Multiple-Choice-Quiz zum Textverständnis, mit sofortigem Feedback und Punkte-Vergabe.

---

## Umgebungsvariablen

Kopiere `.env.example` nach `.env` und fülle die Werte aus:

```env
# Server
NODE_ENV=development
PORT=3000
BODY_SIZE_LIMIT=15M          # Fotos werden im Browser vorher verkleinert
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

- Texte in **Leichter und Einfacher Sprache** (Zielgruppe: Menschen mit kognitiven Beeinträchtigungen)
- **ARIA-Attribute** auf allen interaktiven Elementen
- **Tastaturnavigation** vollständig unterstützt
- **Sichtbare Fokus-Ringe** für Tastaturnutzer:innen
- **Sprachausgabe** über Gemini TTS (`gemini-3.8-flash-tts`, Stimme „Kore“, WAV).
  Mit gesetztem `GOOGLE_TTS_API_KEY` läuft sie stattdessen über Google Cloud TTS (`de-DE-Neural2-B`, MP3, etwas langsamer).
  Gemini TTS erhält nur den reinen Text.
  Stil-Anweisungen wie „Lies langsam vor:“ liest das Modell mit vor (getestet 23.09.2026).
- **Großes, klares Interface** mit hohem Kontrast
- Mobile-First-Design, optimiert für Smartphone-Nutzung

---

## Hinweise für Entwickler:innen

- **Svelte 5 Runes Mode** ist für das gesamte Projekt aktiv (`runes: true` in `svelte.config.js`). Kein `$store`, keine `onMount` mit Writable-Stores – stattdessen `$state`, `$derived`, `$effect`.
- **System-Prompts anpassen:** Einfach die `.txt`-Dateien in `local-files/system-prompts/` bearbeiten. Änderungen wirken spätestens nach 5 Minuten, wenn der Prompt-Cache abläuft.
  Sofort wirken sie nach einem Neustart des Servers oder wenn die Redis-Schlüssel `vair:prompts:*` gelöscht werden.
- **Typen bei `$state`:** `$state<T | null>(null)` schreiben, nicht `let x: T | null = $state(null)`.
  Sonst leitet TypeScript nur `null` ab.
- **Fotos:** `ChatFlow.svelte` verkleinert Fotos vor dem Senden über `src/lib/shared/image.client.ts` (max. 2048 px, JPEG 85 %).
- **Neue API-Endpunkte:** Im Ordner `src/routes/api/<endpunkt>/+server.ts` anlegen (SvelteKit-Konvention).
- **Kein globaler State-Manager:** Der App-State wird über Svelte Context (`setContext`/`getContext`) und Rune-State verwaltet.
