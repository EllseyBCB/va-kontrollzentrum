# Kontrollzentrum für Virtuelle Assistenz

Acht Positionen eines Unternehmens, besetzt mit acht Agenten. Die Anwendung
führt in drei Stufen dorthin:

1. **Gründungsakte** – die acht schreiben nacheinander ein Geschäftskonzept aus
   deiner Idee. Das ist die gemeinsame Wissensgrundlage für alles Weitere.
2. **Belegschaft** – jede Position wird in fünf Schritten eingerichtet und
   bekommt eine Dienstanweisung, die du liest und freigibst. Erst dann lässt
   sie sich scharf stellen.
3. **Betrieb** – wer im Dienst ist, nimmt Aufträge an und hält sich dabei an
   seine Anweisung.

Alles bleibt gespeichert. Wer den Browser schließt, findet seine Belegschaft
wieder vor.

## Einrichten

```bash
npm install              # einmalig, holt auch das Anthropic-SDK
cp .env.example .env     # dann ANTHROPIC_API_KEY eintragen
```

Den Schlüssel gibt es unter [console.anthropic.com](https://console.anthropic.com)
unter „API Keys". Die `.env` wird von Git ignoriert – der Schlüssel bleibt auf
deinem Rechner und erreicht den Browser nie.

## Starten

```bash
npm run dev
```

Öffnet <http://localhost:5180>. Der API-Server läuft daneben auf Port 8787.
Einzeln starten geht auch: `npm run dev:web` bzw. `npm run dev:api`.

## Die fünf Schritte einer Einrichtung

Für alle acht Positionen dieselben fünf – wer es einmal gemacht hat, kann es
für alle:

| # | Schritt | Worum es geht |
|---|---|---|
| 1 | Zuständigkeit | Was die Stelle übernimmt, und was ausdrücklich nicht |
| 2 | Arbeitsgrundlage | Womit sie arbeitet: Zahlen, Unterlagen, Quellen |
| 3 | Arbeitsweise | In welchem Takt sie sich meldet, in welcher Form |
| 4 | Grenzen und Freigaben | Was sie allein darf, wofür sie dich fragen muss |
| 5 | Erfolgsmaß und Alarm | Woran man sie misst, wann sie dich weckt |

Zu jedem Schritt gibt es **Vorschlag holen**: Die Fachkraft schlägt selbst vor,
wie ihre Stelle aussehen soll – sie kennt ja das Konzept. Der Vorschlag steht
daneben, nicht im Feld. Du übernimmst ihn oder verwirfst ihn.

Der vierte Schritt ist der wichtigste. Eine Stelle ohne gezogene Grenze sollte
nicht scharf gestellt werden.

## Scharf stellen

Der Schalter geht nur um, wenn eine Dienstanweisung vorliegt. Sie entsteht am
Ende der Einrichtung, lässt sich von Hand nachbessern – und schreiben kann man
sie auch selbst. Zurückziehen löscht nichts: die Stelle ruht dann nur.

## Was man mitnehmen kann

- **Dienstanweisung als Datei** – die einzelne Anweisung als Markdown
- **Als Claude-Code-Agent** – dieselbe Anweisung mit Kopfzeile. Abgelegt unter
  `.claude/agents/` ist das ein echter Unteragent: dieselbe Stelle arbeitet
  dann im Terminal mit.
- **Alle Anweisungen** – alle acht in einem Dokument, zum Ausdrucken
- **Akte sichern / einlesen** – der ganze Stand als JSON-Datei. Der Weg auf
  einen anderen Rechner, denn gespeichert wird im Browser.

## Kosten

Ein vollständiger Konzeptdurchlauf sind acht Aufrufe – mit `claude-opus-5` grob
20 bis 60 Cent. Ein Vorschlag zu einem Einrichtungsschritt oder ein Auftrag im
Betrieb ist deutlich kleiner. Wer viel ausprobiert, stellt in der `.env` auf
`MODELL=claude-sonnet-5` um.

## Die veröffentlichte Fassung

<https://ellseybcb.github.io/va-kontrollzentrum/> zeigt die Oberfläche.
GitHub Pages liefert reine Dateien aus und kann keinen Server ausführen – die
Agenten arbeiten dort nicht. Einrichten von Hand, lesen und sichern geht
trotzdem, der Speicher liegt im Browser. Damit die Agenten auch dort arbeiten,
bräuchte es eine Funktion bei Cloudflare oder Vercel.

## Wo liegt was?

Siehe [docs/architektur.md](docs/architektur.md).
