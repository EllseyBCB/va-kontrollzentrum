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
| `src/App.jsx` | Setzt das Layout zusammen, hält den Durchlauf und reicht ihn an die Bausteine weiter. |
| `src/komponenten/` | Die sichtbaren Bausteine. Eine Datei pro Baustein, plus `Markdown.jsx` für die Darstellung der Abschnitte. |
| `src/daten/agenten.js` | **Die acht Positionen und ihre Reihenfolge.** Einzige Stelle, an der die Abfolge festgelegt ist. Enthält beide Gesichter jeder Stelle: Beitrag zum Konzept und Dauerauftrag im Dienst. |
| `src/daten/einrichtung.js` | **Die fünf Einrichtungsschritte und die 40 Fragen.** Der sichtbare Teil der Einrichtung – deshalb im Frontend, nicht auf dem Server. |
| `src/zustand/useFirma.js` | **Die Firmenakte.** Was bleibt: Idee, Konzept, Festlegungen, Dienstanweisungen, wer scharf ist. Schreibt bei jeder Änderung in den Browserspeicher. |
| `src/zustand/useDurchlauf.js` | **Die Ablaufsteuerung des Konzepts** – ruft die Fachleute nacheinander auf, gibt jeder die Vorergebnisse mit, verwaltet Stände, Abbruch und Wiederholung. |
| `src/zustand/useSchreiber.js` | Kleiner Helfer für jeden gestreamten Text (Vorschlag, Anweisung, Auftrag): Text, läuft, Fehler, Abbruch. |
| `src/dienste/api.js` | Einziger Draht zum Server. Liest den Datenstrom Stück für Stück. Wechselt der Anbieter, ändert sich nur diese Datei. |
| `src/dienste/dateien.js` | Alles, was der Browser als Datei herausgibt oder einliest. |
| `src/stile/tokens.css` | Farben, Abstände, Schrift – zentral an einer Stelle. |
| `src/stile/global.css` | Layout und Aussehen der Bausteine. |
| `server/index.js` | Lokaler API-Server. Hält den Schlüssel und führt die vier Aufrufe aus. |
| `server/agenten/prompts.js` | **Die acht Rollen** und der gemeinsame Ton. Liegt auf dem Server, damit sie nicht im Browser lesbar sind. |
| `server/agenten/dienst.js` | Die Prompts für Vorschlag, Dienstanweisung und Betrieb – dieselben Rollen, andere Aufgabe. |
| `public/` | Dateien, die unverändert ausgeliefert werden (Logo, Favicon). |
| `docs/` | Diese Dokumentation. |

## Wie der Durchlauf funktioniert

```
Idee eingeben
      │
      ▼
useDurchlauf.starten()
      │
      ├─► Fachkraft I  ──► POST /api/agent ──► Anthropic ──► Text kommt stückweise zurück
      │        │                                                      │
      │        └──────────── Ergebnis ins Vorwissen ◄─────────────────┘
      │
      ├─► Fachkraft II  (bekommt Idee + Vorwissen I)
      ├─► Fachkraft III (bekommt Idee + Vorwissen I, II)
      │   …
      └─► Fachkraft VIII (bekommt Idee + Vorwissen I…VII)
                    │
                    ▼
            Konzept = alle acht Abschnitte aneinander
```

Drei Entscheidungen, die dahinterstecken:

**Nacheinander, nicht gleichzeitig.** Acht parallele Aufrufe wären schneller,
aber dann wüsste keine Fachkraft, was die anderen schreiben. Das Aufeinander-
aufbauen ist der ganze Sinn der Kette.

**Der Text kommt stückweise.** Der Server schickt Server-Sent-Events, das
Frontend liest sie in `api.js` von Hand aus dem Datenstrom. Nicht `EventSource`,
weil das nur GET kann – wir müssen Idee und Vorergebnisse per POST mitschicken.
Ohne das Streamen starrt man vier Minuten auf eine leere Seite.

**Ein Fehler hält nur an, er wirft nichts weg.** Bricht eine Fachkraft ab,
bleibt der Durchlauf stehen und alles bereits Geschriebene bleibt erhalten.
Über „Nochmal schreiben" lässt sich der eine Schritt wiederholen – mit
demselben Wissensstand wie beim ersten Mal.

## Die drei Stufen

```
   Gründungsakte              Belegschaft                   Betrieb
   ─────────────              ───────────                   ───────
   Idee                       je Stelle 5 Schritte          Auftrag
     │                          │                             │
     ▼                          ▼                             ▼
   acht Abschnitte  ────────► Dienstanweisung  ──scharf──►  Ergebnis
     │                          ▲                             │
     └──── Konzept ─────────────┴─────────────────────────────┘
                       (Wissensgrundlage für beides)
```

Das Konzept ist nicht bloß ein Ergebnis, sondern die Grundlage: Es geht in jeden
Einrichtungsvorschlag, in jede Dienstanweisung und in jeden Auftrag mit ein.
Deshalb wird jeder fertige Abschnitt sofort in die Firmenakte geschrieben und
nicht erst am Ende – bricht der Durchlauf bei Kapitel VI ab, sind die fünf
davor trotzdem nutzbar.

### Warum der Scharfschalter an der Dienstanweisung hängt

Ein Agent, der Aufträge annimmt, ohne dass jemand gelesen hat, was er tun darf,
ist kein Mitarbeiter, sondern ein Risiko. Deshalb:

- Der Schalter geht nur um, wenn eine Dienstanweisung dasteht (`useFirma.scharfStellen`).
- Beim Einlesen einer Akte wird `scharf` verworfen, wenn die Anweisung fehlt.
- Der Vorschlag zu einem Einrichtungsschritt landet **nie** ungefragt im Feld.
  Er steht daneben und wird übernommen oder verworfen.
- Im Betrieb steht die Anweisung als bindender Text im System-Prompt. Was sie
  verbietet, tut die Stelle nicht – sie nennt dann die Stelle der Anweisung,
  die dagegensteht.
- Zurückziehen löscht nichts. Sonst traut sich niemand, den Schalter je umzulegen.

### Warum im Browser gespeichert wird

Ein Konzept schreibt man einmal, eine Stelle besetzt man einmal und arbeitet
dann lange mit ihr. Ohne Speicher wäre nach jedem Neuladen alles unbesetzt.
`localStorage` statt Datenbank, weil es zwei Dinge kann, die hier zählen: es
braucht keinen Server (die veröffentlichte Fassung funktioniert damit) und es
verlässt den Rechner nicht.

Der Preis: Die Akte hängt an diesem einen Browser. Deshalb gibt es „Akte sichern"
und „Akte einlesen" – das ist der Weg auf einen anderen Rechner.

## Gestaltung: der Konzeptbogen

Die Seite ist bewusst **nicht** im üblichen KI-Look gehalten (dunkler Hintergrund,
Emoji-Icons, gleichförmiges Kachelraster, Verläufe). Leitbild ist stattdessen ein
gedruckter Konzeptbogen aus einem Fachheft.

Vier Regeln, an die sich alles hält:

1. **Linien statt Kästen.** Die Gliederung entsteht durch Haarlinien und Weißraum –
   keine Schatten, keine Farbflächen, keine runden Ecken außer am Eingabefeld.
2. **Genau eine Akzentfarbe** (gedecktes Rot, `--akzent`), sparsam für Rubrikzeilen.
   Alles andere ist Papier und Tinte.
3. **Serif für Inhalt, Grotesk für Funktion.** Überschriften, Vorspann und das
   Eingabefeld in Source Serif; Beschriftungen, Stände und Knöpfe in Source Sans.
4. **Ziffern statt Symbole.** Die acht Fachleute sind mit römischen Ziffern
   durchnummeriert wie Kapitel – keine Emojis.

Wer die Anmutung ändern will, fasst `src/stile/tokens.css` an, nicht die Komponenten.
Die Schriften kommen von Google Fonts und fallen sauber auf Georgia bzw. die
Systemschrift zurück, wenn kein Netz da ist.

## Was als Nächstes kommt

1. Eine Funktion bei Cloudflare oder Vercel, damit die Agenten auch in der
   veröffentlichten Fassung arbeiten – heute läuft dort nur die Oberfläche.
2. Die Stellen untereinander sprechen lassen: heute bekommt jede das Konzept
   und ihr eigenes Protokoll, aber nicht die Ergebnisse der anderen.
3. Echte Anbindungen für die Arbeitsgrundlage (Kalender, Postfach, Zahlen),
   damit die Stellen nicht nur mit dem arbeiten, was man ihnen erzählt.
