# KI-Kontrollzentrum für Virtuelle Assistenz

Eine Teilnehmerin gibt ihre Idee für ein VA-Business ein – 8 spezialisierte
KI-Agenten arbeiten nacheinander daran und bauen daraus ein vollständiges
Business-Konzept.

**Stand: Grundgerüst (v0.1).** Die Oberfläche steht und startet lokal,
die Agenten-Logik ist noch nicht gebaut.

## Starten

```bash
npm install     # einmalig
npm run dev     # startet Oberfläche + API zusammen
```

Danach öffnet sich <http://localhost:5180> von selbst.
Der API-Server läuft daneben auf Port 8787.

Einzeln starten geht auch: `npm run dev:web` bzw. `npm run dev:api`.

## Schlüssel hinterlegen (erst für den nächsten Schritt nötig)

```bash
cp .env.example .env
# ANTHROPIC_API_KEY eintragen
```

Die `.env` wird von Git ignoriert. Der Schlüssel bleibt auf dem Server und
erreicht den Browser nie.

## Wo liegt was?

Siehe [docs/architektur.md](docs/architektur.md).
