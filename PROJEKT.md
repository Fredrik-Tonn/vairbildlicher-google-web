# PROJEKT.md – Verainfacher (vairbildlicher-google-web)

> **Träger:** KOPF, HAND + FUSS gGmbH  
> **Repository:** [KopfHandundFuss/vairbildlicher-google-web](https://github.com/KopfHandundFuss/vairbildlicher-google-web)  
> **Produktiv-URLs:** https://verainfacher.de · https://vair.kopfhandundfuss.net

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
| Styling | Tailwind CSS 4 |
| Animationen | GSAP 3 |
| Build-Tool | Vite 8 |
| Server/Adapter | `@sveltejs/adapter-node` (Node.js) |
| KI / Multimodal | Google Gemini API via `@google/genai` SDK |
| Text-to-Speech | Google Cloud TTS (`@google-cloud/text-to-speech`) |
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
│   │       ├── tts/                   # POST /api/tts → Google Text-to-Speech
│   │       ├── difficult-words/       # POST /api/difficult-words → Worterklärungen
│   │       ├── followup-questions/    # POST /api/followup-questions → Folgefragen
│   │       ├── multiple-choice-challenge/ # POST /api/multiple-choice-challenge
│   │       ├── visualize/             # POST /api/visualize → Bild-Illustration (Gemini Imagen)
│   │       └── getfile/               # GET /api/getfile → lokale Datei-Auslieferung
│   └── lib/
│       ├── server/
│       │   ├── services/
│       │   │   ├── gemini.service.ts  # Gesamte Gemini-KI-Logik (Chat, TTS, Bilder, Challenge)
│       │   │   ├── google-tts.service.ts # Google Cloud TTS Integration
│       │   │   ├── redis.adapter.ts   # Redis-Client mit In-Memory-Fallback
│       │   │   ├── chat.service.ts    # Chat-Koordination
│       │   │   └── polly.service.ts   # (reserviert)
│       │   └── db/                    # Datenbank-Helfer
│       ├── shared/
│       │   ├── domain/                # TypeScript-Typen & Domain-Modelle
│       │   ├── rewardSystem.ts        # Punkte-/Belohnungssystem (Coins, Level)
│       │   ├── audioCache.ts          # Client-seitiger Audio-Cache
│       │   ├── const.client.ts        # Client-Konstanten
│       │   ├── const.server.ts        # Server-Konstanten
│       │   └── helper.ts              # Utility-Funktionen
│       └── ui/
│           ├── modules/               # Haupt-UI-Komponenten (Svelte)
│           │   ├── ChatFlow.svelte         # Chat-Verlauf & Nachrichten-Anzeige
│           │   ├── ChatHeader.svelte       # App-Header mit Navigation & Aktionen
│           │   ├── MultiPhotoCapture.svelte # Multi-Bild-Kamera-Aufnahme
│           │   ├── SelectImageFiles.svelte  # Datei-Upload & Kamera-Trigger
│           │   ├── InitialImageUpload.svelte # Erste-Bild-Upload-Ansicht
│           │   ├── Infopage.svelte          # Startseite mit Anleitung
│           │   ├── ChallengeOverlay.svelte  # Multiple-Choice-Quiz-Overlay
│           │   ├── CoinCollectionOverlay.svelte # Belohnungs-Animation
│           │   ├── AIWarningModal.svelte    # KI-Hinweis-Dialog (beim ersten Besuch)
│           │   ├── DesktopCamera.svelte     # Desktop-Webcam-Unterstützung
│           │   ├── Gallery.svelte           # Bild-Galerie-Ansicht
│           │   └── UserChatBar.svelte       # Eingabeleiste für Nutzer-Fragen
│           ├── common/                # Wiederverwendbare UI-Bausteine
│           └── assets/                # Bilder, Icons etc.
├── static/                            # Statische Assets
│   ├── favicon.ico / favicon.png
│   ├── apple-touch-icon.png
│   ├── KHuF logo.png                  # KOPF, HAND + FUSS Logo
│   └── robots.txt
├── local-files/                       # Lokale Konfigurationsdateien (nicht im Build)
│   └── system-prompts/                # KI-System-Prompts als .txt-Dateien
│       ├── SummarySystemPrompt_v2.txt
│       ├── AnswerSystemPrompt_v2.txt
│       ├── DifficultWordsSystemPrompt.txt
│       ├── FollowUpQuestionsSystemPrompt.txt
│       └── ChallengeSystemPrompt.txt
├── index.html                         # Statisches HTML-Mockup (KI-unabhängig)
├── styles.css                         # Mockup-Styles (Material Design 3)
├── app.js                             # Mockup-JavaScript
├── manifest.json                      # PWA Web-App-Manifest
├── icon.svg                           # App-Icon (SVG)
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
   ├─ [initial]  ──► Infopage + MultiPhotoCapture
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
   │         (Google TTS)    (Gemini Imagen 3)
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
| `gemini-3.1-flash-image` | Bild-Illustration / Verbildlichung von Sätzen (Imagen) |

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
- **System-Prompts:** Werden beim ersten Start aus den `.txt`-Dateien geladen, dann in Redis gecacht.
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
BODY_SIZE_LIMIT=50M
ORIGIN=http://localhost:5173

# Pflicht: Google Gemini API-Schlüssel
# Zu beziehen über: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Google Cloud Text-to-Speech
# (ohne diesen Key wird ein Fallback verwendet)
GOOGLE_TTS_API_KEY=your_google_cloud_tts_api_key_here

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

### Statisches HTML-Mockup (ohne KI)

Für schnelle UI-Tests ohne API-Key kann das statische Mockup direkt im Browser geöffnet werden:

```bash
# Einfachste Option: Python-Webserver
python -m http.server 8000
# → http://localhost:8000
```

Das Mockup (`index.html`, `styles.css`, `app.js`) zeigt alle 4 Ansichten (Start, Vorschau, Laden, Ergebnis) mit simulierten Daten und ist unabhängig vom SvelteKit-Projekt.

---

## Deployment

Die Anwendung verwendet `@sveltejs/adapter-node` und kann als **eigenständiger Node.js-Prozess** betrieben werden:

```bash
npm run build
node build
```

**Produktiv-Domains** (eingetragen in `svelte.config.js` als `trustedOrigins`):
- `https://verainfacher.de`
- `https://www.verainfacher.de`
- `https://vair.kopfhandundfuss.net`

---

## Barrierefreiheit (A11y)

- Texte in **Leichter und Einfacher Sprache** (Zielgruppe: Menschen mit kognitiven Beeinträchtigungen)
- **ARIA-Attribute** auf allen interaktiven Elementen
- **Tastaturnavigation** vollständig unterstützt
- **Sichtbare Fokus-Ringe** für Tastaturnutzer:innen
- **Sprachausgabe** (Google Cloud TTS und Web Speech API als Fallback)
- **Großes, klares Interface** mit hohem Kontrast
- Mobile-First-Design, optimiert für Smartphone-Nutzung

---

## Hinweise für Entwickler:innen

- **Svelte 5 Runes Mode** ist für das gesamte Projekt aktiv (`runes: true` in `svelte.config.js`). Kein `$store`, keine `onMount` mit Writable-Stores – stattdessen `$state`, `$derived`, `$effect`.
- **System-Prompts anpassen:** Einfach die `.txt`-Dateien in `local-files/system-prompts/` bearbeiten. Redis-Cache leert sich automatisch nach 30 Minuten oder kann manuell geleert werden.
- **Neue API-Endpunkte:** Im Ordner `src/routes/api/<endpunkt>/+server.ts` anlegen (SvelteKit-Konvention).
- **Kein globaler State-Manager:** Der App-State wird über Svelte Context (`setContext`/`getContext`) und Rune-State verwaltet.
