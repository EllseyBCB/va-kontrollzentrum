# Aufbau des Projekts

## Warum React + Vite (und nicht pures HTML/CSS/JS)?

Die App muss 8 Agenten anzeigen, die nacheinander ihren Status ändern
(wartet → läuft → fertig), dabei laufend Text nachliefern und am Ende zu einem
Konzept zusammenwachsen. Das ist viel wechselnder Zustand auf einer Seite.

Mit purem JavaScript hieße das: von Hand DOM-Knoten suchen, Klassen umschreiben,
Listen neu aufbauen – bei 8 Agenten × 4 Zuständen wird das schnell unübersichtlich
und fehleranfällig. React nimmt genau diese Arbeit ab: Zustand ändern, Anzeige
folgt automatisch.

Vite liefert Startzeit unter einer Sekunde und lädt Änderungen sofort im Browser
nach. **Kein TypeScript**, kein Tailwind, keine UI-Bibliothek – jede zusätzliche
Schicht müsste man erst lernen, bevor man etwas baut.

## Der Server – warum es ihn braucht

Ein API-Schlüssel im Browser ist öffentlich. Jeder Agentenaufruf läuft deshalb
über `server/index.js`. Vite reicht alles unter `/api/…` dorthin weiter
(konfiguriert in `vite.config.js`), sodass beides sich lokal wie eine App anfühlt.

## Ordner und Dateien

| Pfad | Wofür es zuständig ist |
|---|---|
| `index.html` | Einstiegsseite. Enthält nur ein leeres `<div id="root">`, alles andere baut React. |
| `vite.config.js` | Entwicklungsserver + Weiterleitung von `/api` an den Node-Server. |
| `.env.example` | Vorlage für Zugangsdaten. Kopie als `.env` anlegen; die echte `.env` bleibt lokal. |
| `src/main.jsx` | Startpunkt des Frontends – hängt die App in die Seite. |
| `src/App.jsx` | Setzt das Layout zusammen und hält später den Zustand des Durchlaufs. |
| `src/komponenten/` | Die sichtbaren Bausteine: Kopfzeile, Ideeformular, Agentenleiste, Ergebnisbereich. Eine Datei pro Baustein. |
| `src/daten/agenten.js` | **Die 8 Agenten und ihre Reihenfolge.** Einzige Stelle, an der die Abfolge festgelegt ist. |
| `src/zustand/useDurchlauf.js` | Später: die Ablaufsteuerung – ruft die Agenten nacheinander auf, gibt jedem die Vorergebnisse mit, verwaltet Status und Fehler. |
| `src/dienste/api.js` | Einziger Draht zum Server. Wechselt der Anbieter, ändert sich nur diese Datei. |
| `src/stile/tokens.css` | Farben, Abstände, Schrift – zentral an einer Stelle. |
| `src/stile/global.css` | Layout und Aussehen der Bausteine. |
| `server/index.js` | Lokaler API-Server. Hält den Schlüssel, führt später die Agentenaufrufe aus. |
| `server/agenten/` | Später: ein Prompt pro Agent. Liegt auf dem Server, damit die Prompts nicht im Browser lesbar sind. |
| `public/` | Dateien, die unverändert ausgeliefert werden (Logo, Favicon). |
| `docs/` | Diese Dokumentation. |

## Was als Nächstes kommt

1. Prompts für die 8 Agenten in `server/agenten/`
2. `POST /api/agent` im Server
3. Ablaufsteuerung in `useDurchlauf.js` – Agenten nacheinander, jeder kennt die Vorergebnisse
4. Formular scharfschalten, Status live an den Karten anzeigen
5. Konzept zusammensetzen und zum Download anbieten
