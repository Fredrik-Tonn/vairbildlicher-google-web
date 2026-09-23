# Umsetzung des Design-Mockups „A11y_Designs“ – 23.09.2026

> **Vorgehen:** Das Figma-Mockup wird zuerst **möglichst genau** umgesetzt, auch mit seinen Widersprüchen.
> Danach wird es Schritt für Schritt korrigiert.
> Die Korrekturliste steht unten.

Quelle: Figma-Prototyp `A11y_Designs`, 3 Ansichten.
Es gibt nur Zugriff auf den Prototyp, nicht auf die Design-Datei.
Deshalb sind alle Maße und Farben aus Screenshots geschätzt.

## Was umgesetzt ist

| Mockup | Umsetzung |
|---|---|
| Ansicht 3: Startseite | `src/lib/ui/modules/LandingPage.svelte`. Sie ersetzt `Infopage` und die großen runden Knöpfe auf der Startseite. |
| Ansicht 2: Ablagefeld | Erscheint beim Ziehen von Dateien über die Seite. Beim Ablegen kommen die Dateien in die Foto-Vorschau. |
| Ansicht 1: Kamera-Tipp | Text im Vollbild-Overlay der Desktop-Kamera (`MultiPhotoCapture.svelte`). Die Handy-Kamera ist nativ, dort gibt es keinen Tipp. |
| Knöpfe in der Kopfzeile | Schriftgröße in 3 Stufen (100 %, 112,5 %, 125 %) und Kontrast-Modus (schwarz auf weiß). Beides bleibt im Browser gespeichert (`src/lib/ui/a11y-settings.svelte.ts`). Vorlesen nutzt `/api/tts`. |
| Farben und Schriften | Tokens in `src/routes/layout.css` (`@theme`). Inter und Plus Jakarta Sans sowie die Material Symbols (Rounded) sind **lokal über npm** eingebunden, ohne Google-CDN. |
| Bilder bei den 3 Schritten | Aus Figma nicht exportierbar. Deshalb neu erzeugt mit `gemini-3.1-flash-image` (21:9, ohne Schrift und ohne Marken): `static/images/landing/`. |

Der bisherige Ablauf bleibt erhalten.
Die Knöpfe der neuen Startseite rufen die Foto-Logik von `MultiPhotoCapture` auf (eingebetteter Modus, `embedded`).
Darunter erscheinen die Foto-Vorschau sowie „Abbrechen“ und „Erklären“.

Getestet am 23.09.2026 in Handy-Breite (390 px):

- Drag & Drop, Vorschau, „Erklären“ und die Antwort funktionieren.
- Kontrast und Schriftgröße funktionieren und bleiben gespeichert.
- Das Vorlesen funktioniert.
- Typ-Prüfung und Build laufen fehlerfrei.

Nebenbei behoben: In `src/app.html` fehlte `<meta name="viewport">`.
Handys haben die ganze App deshalb 980 px breit dargestellt und verkleinert.

## Globale Kopfzeile (23.09.2026)

`src/lib/ui/modules/AppHeader.svelte` steht über allen Ansichten: Startseite, Chat und Foto-Ansichten.

- **Links:** Logo mit Wortmarke „Der Verainfacher – Im Dialog mit KI Texte verstehen“ (`static/images/verainfacher-logo.svg`, aus `Inputs/`). Es verlinkt auf die Projekt-Seite https://kopfhandundfuss.de/projekte/der-verainfacher/ und öffnet sie in einem neuen Fenster. Der Link-Name nennt das, und er beginnt mit der sichtbaren Wortmarke.
- **Rechts:** Barrierefreiheitsmenü mit „Schrift“, „Kontrast“ und „Vorlesen“.
- **Vorlesen** liest den Text, den die aktuelle Ansicht anmeldet (`setReadAloudSource` in `a11y-settings.svelte.ts`):
  - Startseite: ihre Texte.
  - Chat: die letzte Antwort.
- **Chat:** Die Punkte-Leiste (`ChatHeader.svelte`) ist nicht mehr `fixed`. Sie steht jetzt direkt unter der globalen Kopfzeile im normalen Fluss.
- **Semantik:** Der äußere App-Container ist jetzt ein `<div>` statt `<main>`. Damit ist die Kopfzeile ein Seitenkopf (Landmark „banner“), und jede Ansicht hat genau ein `<main>`.

## KI-Hinweis als Seite und volle Responsivität (23.09.2026)

**KI-Hinweis** (`AIWarningPage.svelte`, vorher `AIWarningModal.svelte`):

- Er ist jetzt eine normale Seite im vollen Bildschirm unter der globalen Kopfzeile.
- Weggefallen sind der schwarze Hintergrund, die Zeile „Achtung!“ mit Warnsymbol und die Fokus-Falle.
- Die Überschrift steht auf allen Bildschirmgrößen in zwei Zeilen: „Nutzungs-Bedingungen“ und „Kurz-Fassung“.
- Beim Öffnen bekommt die Überschrift den Fokus.
- „Vorlesen“ liest den Hinweis.
- Der Text steht in einer Spalte mit höchstens 768 px Breite, damit die Zeilen gut lesbar bleiben.

**Grundsatz: Handy zuerst, aber der Bildschirm wird auf allen Geräten voll genutzt.**
Die feste Breite von 480 px ist entfallen.
Kopfzeile, Startseite und Footer nutzen dieselbe Inhaltsbreite: auf dem Handy die volle Breite, auf großen Bildschirmen bis 1280 px mit wachsendem Rand.

| Bereich | Handy | ab 768 px (md) | ab 1024 px (lg) | ab 1280 px (xl) |
|---|---|---|---|---|
| „Text fotografieren“ und „Datei hochladen“ | untereinander | nebeneinander | nebeneinander | nebeneinander |
| 3 Schritte | untereinander, Bild unten | untereinander, Bild rechts neben dem Text | wie md | 3 Spalten |
| Hilfe-Box | Knopf unten | Knopf rechts in einer Zeile | wie md | wie md |
| Footer-Links | 1 Spalte | 2 Spalten (ab 640 px) | 4 Spalten | 4 Spalten |
| Chat-Blasen | volle Breite | bis 36rem (ab 640 px) | bis 42rem | bis 42rem |

Die 3 Schritte stehen erst ab 1280 px in 3 Spalten.
Bei 1024 px waren die Spalten so schmal, dass fast jeder Satz mitten im Satz umbrach.
Gemessen am 23.09.2026:

- 1024 px: kein Satz bricht um.
- 1440 px: 1 Satz bricht um.
- 390 px: 2 Sätze brechen um (siehe Punkt 7).
- Es gibt keine waagerechte Scrollleiste.

## Korrekturliste (Schritt für Schritt)

### Aus dem Mockup übernommen, bewusst noch nicht korrigiert

1. **Etikett „WCAG AAA Konform“** im Footer: Die Aussage ist nicht belegbar und rechtlich riskant.
2. **„Nach oben“ mit Kamera-Symbol:** Symbol und Beschriftung widersprechen sich, und der Knopf überdeckt den Footer.
3. ~~**„Drücken Sie den großen blauen Knopf“:** Der Knopf wird nur über seine Farbe beschrieben (WCAG 1.3.3). Im Kontrast-Modus ist er schwarz.~~ **Erledigt 23.09.2026:**
   - **Startseite:** „Drücken Sie auf **Foto erstellen**.“ und „Ihre Kamera öffnet sich direkt.“ stehen jetzt in je einer eigenen Zeile. Der Vorlesetext ist angepasst.
   - **KI-Hinweisdialog:** Jetzt steht dort „Sind Sie einverstanden?“ und „Dann klicken Sie auf **OK**.“. Die doppelte Zeile „Auf dem Knopf steht: OK.“ ist entfernt.
   - **Knopf „OK“:** Sein unsichtbarer Name war „Zustimmen und fortfahren“ und wich damit von der sichtbaren Beschriftung ab (WCAG 2.5.3, Sprachsteuerung). Jetzt heißt er „OK“, und das 👍 ist für Screenreader ausgeblendet.
   - **Alte Foto-Ansicht** (`MultiPhotoCapture`, nicht eingebettet): „Dann drücken Sie den Knopf mit dem Kamera-Bild.“ Der Knopf dort hat keine sichtbare Beschriftung, deshalb bleibt der Hinweis auf das Symbol.
4. ~~**Kamera-Tipp:** dunkelgrau auf schwarz (`#3f3f46`), Kontrast geschätzt etwa 2:1.~~ **Erledigt 23.09.2026:** Nachgerechnet lag der Kontrast bei 2,01:1. Jetzt ist der Tipp `#f4f4f5` auf Schwarz, das ergibt 19,1:1.
5. ~~**Graue Knöpfe** auf grauem Grund: Die Kanten liegen vermutlich unter 3:1 (WCAG 1.4.11).~~ **Erledigt 23.09.2026:**
   - Nachgerechnet lagen die Kanten bei 1,12:1 („Foto oder Datei hochladen“ und die Footer-Links) und 1,25:1 („Zur Anleitung“).
   - Die graue Fläche aus dem Design bleibt. Dazu kommt ein 2 px breiter Rand `--color-control-line` (`#6b7280`). Er erreicht mindestens 3,9:1 zu Weiß, `#f1f2f5` und `#e4e6eb`. Im Kontrast-Modus ist er schwarz.
   - Mit korrigiert: „Abbrechen“ unter der Foto-Vorschau. Er hatte einen hellgrauen Rand auf Weiß (etwa 1,5:1).
   - Nicht geändert: Die Knöpfe im Barrierefreiheitsmenü haben keinen Rand. Sie sind über Symbol und Beschriftung erkennbar, und der Text hat mehr als 14:1 Kontrast.
6. ~~**Knöpfe in der Kopfzeile nur mit Symbol:** Eine sichtbare Beschriftung fehlt.~~ **Erledigt 23.09.2026** mit der globalen Kopfzeile (siehe unten):
   - Unter jedem Symbol steht jetzt „Schrift“, „Kontrast“ oder „Vorlesen“. Beim Vorlesen wechselt die Beschriftung zu „Stopp“.
   - Der Name für Screenreader ist genau die sichtbare Beschriftung (WCAG 2.5.3).
   - Die `title`-Tooltips sind entfernt, weil sie auf Touch-Geräten nicht erreichbar sind.
   - Noch offen: Der Knopf „Schrift“ zeigt nicht an, welche der 3 Stufen gerade aktiv ist.
7. **Sprache:**
   - ~~„KI“ wird nicht erklärt~~, ~~„Fremdwörtern“~~, ~~„&“ in Schritt 2~~. **Erledigt 23.09.2026:** Schritt 2 heißt jetzt „Der Verainfacher macht es einfach“. Darunter stehen 3 Sätze in je einer Zeile: „Sie müssen nur wenige Sekunden warten.“, „Der Verainfacher macht Fremd-Wörter einfach.“, „Lange Sätze werden kurz und klar.“
   - ~~„per Klick“~~ **Erledigt 23.09.2026:** Schritt 3 lautet jetzt „Der einfache Text wird angezeigt.“, „Sie können ihn leicht lesen.“, „Oder tippen auf Vorlesen.“ und „Zum Anhören.“, jeder Satz in einer eigenen Zeile.
   - Noch offen: „PDF, JPG“, „Maximal 20 MB“.
   - ~~„Smartphone“~~ **Erledigt 23.09.2026:** Schritt 1 lautet jetzt „Halten Sie die Kamera auf den Brief.“ und „Oder wählen Sie eine Datei aus.“, jeder Satz in einer eigenen Zeile. Die Schritt-Texte sind dafür als Zeilen-Liste angelegt (`lines`).
   - Das Zeichen „&“ steht noch im Ablagefeld („ziehen & ablegen“).
   - Auf dem Handy brechen längere Sätze mitten im Satz um, zum Beispiel „Sie müssen nur wenige Sekunden / warten.“. Nach EL+ sollten Zeilen an Sinn-Grenzen umbrechen.
   - „oder auf Knopf tippen“ ohne sichtbaren Knopf.
   - ~~Das Etikett sagt „Einfache Sprache“, der Dienst bietet Leichte Sprache.~~ Das war kein Fehler: Der Verainfacher nutzt Easy Language Plus, eine Variante der Einfachen Sprache.
   - ~~Etikett „Einfache Sprache • Für alle Menschen“ sieht aus wie ein Knopf~~ **Entfernt 23.09.2026:** Die abgerundete Form mit Häkchen-Symbol wirkte anklickbar, war es aber nicht. Das Etikett ist jetzt weg.
8. ~~**Uneinheitliche Farben** der Schritt-Nummern (blau, blau, mint) und Symbole ohne einheitlichen Stil.~~
   **Erledigt 23.09.2026:**
   - Im Mockup unterschieden sich Schritt 1 und 2 gar nicht (1,00:1) und Schritt 2 und 3 kaum (1,03:1).
   - Jetzt zeigt eine Helligkeits-Stufung in der Markenfarbe die Reihenfolge: hell `#dce7fb`, mittel `#5b8ae6`, dunkel `#0b2f80`. Sie ist auch bei Farbfehlsichtigkeit und in Graustufen lesbar.
   - Der Abstand beträgt 2,7:1 von Schritt 1 zu 2 und 3,6:1 von Schritt 2 zu 3.
   - Die Zahlen haben mindestens 5,6:1 Kontrast.
   - Kreis 1 hat einen Rand, weil er sich kaum von der weißen Karte abhebt.
   - Alle Symbole sind einheitlich `--color-icon`.
   - Die Tokens heißen `--color-step-1` bis `--color-step-3` (in `layout.css`).
9. ~~**Name:** „Verainfacher“ im Design, „Verbildlicher“ in Chat und Seitentitel.~~ **Erledigt 23.09.2026:** überall „Verainfacher“. Nur die Bildfunktion heißt im Code weiter „Verbildlicher“.
10. **Angaben passen nicht zur App:**
    - Das Design nennt „PDF, JPG“. Die App nimmt nur Bilder an (PNG, JPEG, GIF, WebP).
    - Das Design nennt „Maximal 20 MB“. Die App prüft 30 MB.
11. **Link „Erklärung zur Barrierefreiheit“:** Er hat kein Ziel, weil es auf kopfhandundfuss.de keine solche Seite gibt (404).
12. **Kein Impressum** im Footer: Das Design sieht keins vor.

### Beim Umsetzen gefunden

13. **Vorlesen der Startseite ist langsam:** 17 Sekunden bis zum ersten Ton. Der Text ist fest, deshalb kann die Audiodatei einmal erzeugt und zwischengespeichert werden.
14. **Satztrennung zerlegt Datumsangaben:** Aus „bis zum 15. November 2026“ werden zwei Sätze (`completion_items` in `gemini.service.ts`). Das ist wichtig für Bilder pro Satz.
15. ~~**Hinweisdialog (KI-Warnung) mit schwarzem Hintergrund:** `bg-opacity-50` gibt es in Tailwind 4 nicht mehr.~~ **Erledigt 23.09.2026:** Der Dialog ist jetzt eine eigene Seite ohne Hintergrund-Ebene (siehe oben).
    Der verfehlte Klick auf „OK“ lag am Prüfwerkzeug bei emulierter Handy-Größe, nicht an der App.
16. **Chat-Ansicht noch im alten Stil:** Schriftwahl, Farben und Kopfzeile passen nicht zur neuen Startseite. Der Chat ist im Mockup nicht enthalten.
