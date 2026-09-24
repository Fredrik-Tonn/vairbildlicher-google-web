# Verainfacher – Technikprobe (vairbildlicher-google-web)

> [!NOTE]
> Dieses Repository ist eine **Hackathon-Technikprobe** (Google × Aktion Mensch).
> Es prüft, ob sich im laufenden Chat **Bilder in Echtzeit** als Verständnishilfe erzeugen lassen.
> Es ist keine neue Version des Verainfachers.

Der Verainfacher liest ein fotografiertes Dokument oder eine PDF mit Google Gemini.
Er fasst den Text in Easy Language Plus zusammen und erzeugt auf Wunsch ein Bild zur Antwort.
Diese Bildfunktion heißt im Code „Verbildlicher“.
Dazu kommen schwierige Wörter, Folgefragen, ein kurzes Quiz und eine Sprachausgabe.

## Schnellstart

Voraussetzung: Node.js 24 oder neuer und ein Gemini-API-Schlüssel.

1. Installieren Sie die Abhängigkeiten:

   ```bash
   npm install
   ```

2. Kopieren Sie `.env.example` nach `.env`.
   Tragen Sie in der `.env` Ihren `GEMINI_API_KEY` ein.
3. Starten Sie den Entwicklungsserver:

   ```bash
   npm run dev
   ```

   Die App läuft auf `http://localhost:5173`.

## Verwendete Google-Modelle

| Aufgabe | Modell |
|---|---|
| Text, Chat, schwierige Wörter, Folgefragen, Quiz | `gemini-3.8-flash` |
| Bild zur Antwort | `gemini-3.1-flash-image` |
| Sprachausgabe | `gemini-3.8-flash-tts` (Google Cloud TTS, wenn `GOOGLE_TTS_API_KEY` gesetzt ist) |

## Weitere Doku

- [PROJEKT.md](PROJEKT.md): Aufbau, Ablauf, Konfiguration und Hinweise für Entwickler:innen
- [docs/ANALYSE-2026-09-23.md](docs/ANALYSE-2026-09-23.md): Analyse, gemessene Wartezeiten, Befunde und ihr Status
