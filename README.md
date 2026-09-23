# Verainfacher (Material Design Web-App)

> [!NOTE]
> Dieses Repository ist eine **Hackathon-Technikprobe** (Google × Aktion Mensch) für Bilder in Echtzeit im Chat.
> Es ist keine neue Version des Verainfachers.
> Das Repo enthält zwei Teile:
> - die **SvelteKit-App** mit Gemini, siehe [PROJEKT.md](PROJEKT.md) und [docs/ANALYSE-2026-09-23.md](docs/ANALYSE-2026-09-23.md)
> - das unten beschriebene **statische Mockup** (`index.html`, `styles.css`, `app.js`)

Eine barrierefreie Webanwendung für den **Verainfacher**, entwickelt im modernen **Material Design 3 (Material You)**.

![Original-Design](./icon.svg)

## Funktionen

- **Einfache Sprache & Barrierefreiheit**:
  - Klare, leicht verständliche Anweisungen ("Machen Sie ein Foto von dem Text. Der Verainfacher hilft beim Verstehen...").
  - Hoher Kontrast nach WCAG-Richtlinien mit integriertem Hochkontrast-Umschalter.
  - Vollständige Tastaturbedienbarkeit mit sichtbaren Fokus-Ringen und Screenreader-Unterstützung (`aria-label`).
- **Material Design 3**:
  - Google Fonts (Roboto) & Google Material Symbols (Rounded).
  - Großer runder Kamera-Aktionsbutton (Primary FAB) mit M3-Schatten und Ripple-Effekt.
  - Runder Upload-Button für bestehende Fotos/Dateien mit Textbeschriftung "Bild hochladen".
  - M3-Cards für Bildvorschau und vereinfachte Textanzeige.
- **Kamera & Upload**:
  - Direkte Kamera-Unterstützung auf Smartphones (`capture="environment"`).
  - Datei-Upload und Drag & Drop für Desktop-Rechner.
  - "Beispiel-Dokument laden"-Funktion zum schnellen Testen ohne eigenes Foto.
- **Interaktiver Mockup-Ablauf**:
  - Foto aufnehmen oder hochladen ➔ Vorschau im Material Card-Format ➔ Klick auf "Text jetzt vereinfachen" ➔ Realistischer Ladeindikator ➔ Aufbereitung in Leichter Sprache mit Vorlese-Funktion (Web Speech API).

## Schnelle Ausführung

Die Anwendung benötigt keine schweren Build-Tools und läuft direkt im Browser:

1. Öffne die Datei `index.html` direkt in einem beliebigen modernen Browser (Chrome, Edge, Firefox, Safari).
2. Alternativ kann ein beliebiger lokaler Webserver gestartet werden:
   ```bash
   npx serve .
   # oder
   python -m http.server 8000
   ```
