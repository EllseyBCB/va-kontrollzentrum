// Stammdaten der 8 Agenten.
//
// Hier steht bewusst NUR, WER die Agenten sind und in welcher Reihenfolge sie
// arbeiten - noch nicht, WIE sie denken. Die eigentlichen Prompts kommen später
// nach server/agenten/, damit sie nicht im Browser landen und leicht zu pflegen sind.
//
// Diese Liste ist die einzige Stelle, an der die Reihenfolge festgelegt wird.
// Ein Agent mehr oder weniger = eine Zeile hier ändern, sonst nichts.

export const AGENTEN = [
  {
    id: 'ceo',
    nummer: 1,
    name: 'CEO',
    aufgabe: 'Schärft die Idee zu einem klaren Geschäftsmodell und setzt das Ziel.',
    symbol: '🎯',
  },
  {
    id: 'markt',
    nummer: 2,
    name: 'Markt',
    aufgabe: 'Prüft Zielgruppe, Wettbewerb und ob es für das Angebot überhaupt Nachfrage gibt.',
    symbol: '🔍',
  },
  {
    id: 'angebot',
    nummer: 3,
    name: 'Angebot',
    aufgabe: 'Formt konkrete Leistungspakete und Preise daraus.',
    symbol: '📦',
  },
  {
    id: 'marketing',
    nummer: 4,
    name: 'Marketing',
    aufgabe: 'Entwickelt Positionierung, Botschaft und Sichtbarkeit.',
    symbol: '📣',
  },
  {
    id: 'akquise',
    nummer: 5,
    name: 'Akquise',
    aufgabe: 'Baut den Weg zu den ersten echten Kundinnen und Kunden.',
    symbol: '🤝',
  },
  {
    id: 'finanzen',
    nummer: 6,
    name: 'Finanzen',
    aufgabe: 'Rechnet Einnahmen, Kosten und den Weg zum ersten Gewinn durch.',
    symbol: '💶',
  },
  {
    id: 'risiko',
    nummer: 7,
    name: 'Risiko',
    aufgabe: 'Sucht die Schwachstellen, bevor der Markt sie findet.',
    symbol: '⚠️',
  },
  {
    id: 'investor',
    nummer: 8,
    name: 'Investor / Kunden-Check',
    aufgabe: 'Schaut von außen drauf: Würde man das kaufen, würde man da investieren?',
    symbol: '🧐',
  },
]

// Die möglichen Zustände eines Agenten während eines Durchlaufs.
// Wird später von der Ablaufsteuerung gesetzt und von der Oberfläche angezeigt.
export const STATUS = {
  WARTET: 'wartet',
  LAEUFT: 'läuft',
  FERTIG: 'fertig',
  FEHLER: 'fehler',
}
