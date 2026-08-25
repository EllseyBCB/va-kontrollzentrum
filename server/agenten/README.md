# Prompts der 8 Agenten

Hier liegt später pro Agent eine Datei (`ceo.js`, `markt.js`, …) mit:

- **Rolle** – wer der Agent ist und worauf er achtet
- **Aufgabe** – was er aus der Idee und den Vorergebnissen machen soll
- **Ausgabeform** – in welcher Struktur er antwortet, damit der nächste Agent
  damit weiterarbeiten kann

**Warum auf dem Server und nicht im Frontend?**
Prompts sind Betriebsgeheimnis und Qualitätsmerkmal. Im Browser könnte sie jede
Person mit Rechtsklick lesen und kopieren. Außerdem lassen sie sich hier ändern,
ohne dass das Frontend neu gebaut werden muss.

Die Reihenfolge der Agenten steht **nicht** hier, sondern in
`src/daten/agenten.js` – an genau einer Stelle.
