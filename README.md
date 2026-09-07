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

Quer dazu liegt die **Besprechung**: Wenn eine Frage mehrere Stellen betrifft,
setzen sie sich an einen Tisch.

Alles bleibt gespeichert. Wer den Browser schließt, findet seine Belegschaft
wieder vor.

## Erst mal ansehen

Über der Reiterzeile steht **Beispiel laden**: eine fertige Firma zum
Durchklicken – Konzept, sechs besetzte Stellen mit Dienstanweisungen, erledigte
Aufträge und zwei Besprechungen mit Beschluss. Das kostet keinen einzigen
Aufruf und braucht keinen Schlüssel, weil alles schon dasteht.

„Assistenz Mayer" ist erfunden. Solange die Beispielakte geladen ist, sagt das
ein Band über der Seite – die Firma sieht echt genug aus, dass man sie nach
zehn Minuten sonst für die eigene hält. **Beispiel entfernen** räumt sie weg.

Das Angebot erscheint nur, solange die Akte leer ist. Wer angefangen hat, soll
sich seine Arbeit nicht mit einem Fehlklick überschreiben.

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

## Die Stellen reden miteinander

Acht Stellen, von denen keine weiß, was die anderen tun, sind kein Unternehmen,
sondern acht Einzelkämpfer. Dagegen gibt es drei Mittel:

**Der Aushang.** Bei jedem Auftrag geht mit, woran die anderen zuletzt
gearbeitet haben – je Stelle im Dienst ihre letzte Meldung, dazu der Beschluss
der letzten Besprechung. Die Finanzen rechnen dann nicht mehr mit Preisen, die
der Markt vorgestern verworfen hat. Unter „Aushang ansehen" steht, was
mitgeschickt wird: Was ungefragt in einen Aufruf hineingeht, soll man nachlesen
können.

**Die Besprechung.** Ein Thema, mehrere Stellen, reihum. Jede hört, was die
Vorrednerinnen gesagt haben, und darf ihnen widersprechen – ausdrücklich, mit
Namen. Wer zuletzt spricht, schreibt den Beschluss: Entscheidung, wer was bis
wann tut, und was offen blieb.

Die Reihenfolge ist die der acht Stellen, mit einer Ausnahme: **Die
Geschäftsführung spricht zuletzt.** Wer den Beschluss schreibt, muss alle gehört
haben – und eine Geschäftsführung, die als Erste ihre Meinung sagt, bekommt von
den anderen Zustimmung statt Widerspruch.

Am Tisch sitzen nur Stellen, die scharf gestellt sind, und jede bleibt an ihre
Dienstanweisung gebunden. Was sie im Betrieb nicht darf, verspricht sie auch am
Tisch nicht.

Eine Besprechung ist ein Aufruf je Teilnehmerin. Vier gut gewählte Stellen sagen
mehr als acht, von denen die Hälfte nichts beizutragen hat.

**Die Rückfrage.** Der kurze Dienstweg daneben: eine Stelle fragt genau eine
Kollegin etwas und bekommt eine knappe Auskunft – für alles, wofür eine
Besprechung zu schwer ist, wenn jemand mitten in der Arbeit eine Zahl braucht
und dann weitermacht. Die Gefragte bleibt dabei an ihre Dienstanweisung
gebunden: Eine Zusage, die im Betrieb eine Freigabe bräuchte, wird nicht dadurch
harmlos, dass sie im Vorbeigehen gemacht wurde. Und was sie nicht sicher weiß,
sagt sie auch so, statt eine Zahl zu erfinden – die Kollegin rechnet ja damit
weiter. Ein Aufruf, höchstens sechzig Wörter Antwort.

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
20 bis 60 Cent. Eine Besprechung ist ein Aufruf je Teilnehmerin, also bei vier
Stellen ungefähr ein halber Konzeptdurchlauf. Ein Vorschlag zu einem
Einrichtungsschritt oder ein Auftrag im Betrieb ist deutlich kleiner.

Wer viel ausprobiert, stellt in der `.env` auf
`MODELL=claude-sonnet-5` um – für die veröffentlichte Fassung steht dasselbe in
`wrangler.toml`.

## Die veröffentlichte Fassung

<https://ellseybcb.github.io/va-kontrollzentrum/> zeigt die Oberfläche. Wer
dort ankommt, lädt am besten zuerst das Beispiel – dann ist die Seite
vollständig zu besichtigen, ohne einen Schlüssel einzutippen.

GitHub Pages liefert reine Dateien aus und kann nichts ausführen – die
Endpunkte laufen deshalb als **Cloudflare Worker** daneben (`worker/index.js`).

Der Unterschied, auf den es dort ankommt:

| | lokal | im Netz |
|---|---|---|
| API | `server/index.js` (Node) | Cloudflare Worker |
| Schlüssel | liegt in der `.env` | bringt jede/r selbst mit |

Der Worker hält **keinen** Schlüssel. Täte er es, könnte jeder, der die Adresse
kennt, Agenten auf fremde Rechnung laufen lassen. Stattdessen fragt die Seite
oben nach einem eigenen Schlüssel, behält ihn im Browser und schickt ihn pro
Aufruf mit. Voreingestellt ist er weg, sobald der Tab zugeht; „merken" legt ihn
dauerhaft ab. Lesen, Einrichten von Hand und Sichern gehen ganz ohne.

Wer die Agenten wirklich arbeiten lassen will, ist mit der Fassung auf dem
eigenen Rechner besser bedient – dort sieht der Browser den Schlüssel nie.

### Den Worker veröffentlichen

```bash
npx wrangler login       # einmalig
npm run worker:deploy
```

Wrangler nennt danach die Adresse. Die gehört – mit `/api` am Ende – bei GitHub
unter **Settings → Secrets and variables → Actions → Variables** als
`VITE_API_BASIS` hinterlegt. Beim nächsten Push baut der Workflow die Oberfläche
damit. Ohne diese Variable entsteht wie früher eine Seite ohne erreichbare API.

Zum Ausprobieren läuft der Worker auch lokal: `npm run worker:dev`.

Eine eigene Domain kommt in `wrangler.toml` unter `ERLAUBTE_URSPRUENGE` dazu –
sonst weist der Worker sie ab.

## Wo liegt was?

Siehe [docs/architektur.md](docs/architektur.md).
