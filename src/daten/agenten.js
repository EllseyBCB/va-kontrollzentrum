// Stammdaten der 8 Agenten.
//
// Hier steht bewusst NUR, WER sie sind und in welcher Reihenfolge sie arbeiten –
// noch nicht, WIE sie denken. Die eigentlichen Prompts kommen später nach
// server/agenten/, damit sie nicht im Browser landen und leicht zu pflegen sind.
//
// Diese Liste ist die einzige Stelle, an der die Reihenfolge festgelegt wird.
// Ein Agent mehr oder weniger = eine Zeile hier ändern, sonst nichts.
//
// Die römische Ziffer ist reine Gestaltung (Kapitelzählung wie in einem Heft) und
// steht bewusst hier bei den Daten, damit die Nummerierung nicht in der
// Komponente errechnet werden muss.

export const AGENTEN = [
  {
    id: 'ceo',
    nummer: 1,
    ziffer: 'I',
    name: 'CEO',
    kurz: 'Richtung',
    aufgabe: 'Schärft die Idee zu einem klaren Geschäftsmodell und setzt das Ziel.',
  },
  {
    id: 'markt',
    nummer: 2,
    ziffer: 'II',
    name: 'Markt',
    kurz: 'Nachfrage',
    aufgabe: 'Prüft Zielgruppe, Wettbewerb und ob es für das Angebot überhaupt Nachfrage gibt.',
  },
  {
    id: 'angebot',
    nummer: 3,
    ziffer: 'III',
    name: 'Angebot',
    kurz: 'Leistung',
    aufgabe: 'Formt konkrete Leistungspakete und Preise daraus.',
  },
  {
    id: 'marketing',
    nummer: 4,
    ziffer: 'IV',
    name: 'Marketing',
    kurz: 'Sichtbarkeit',
    aufgabe: 'Entwickelt Positionierung, Botschaft und Sichtbarkeit.',
  },
  {
    id: 'akquise',
    nummer: 5,
    ziffer: 'V',
    name: 'Akquise',
    kurz: 'Erste Kunden',
    aufgabe: 'Baut den Weg zu den ersten echten Kundinnen und Kunden.',
  },
  {
    id: 'finanzen',
    nummer: 6,
    ziffer: 'VI',
    name: 'Finanzen',
    kurz: 'Zahlen',
    aufgabe: 'Rechnet Einnahmen, Kosten und den Weg zum ersten Gewinn durch.',
  },
  {
    id: 'risiko',
    nummer: 7,
    ziffer: 'VII',
    name: 'Risiko',
    kurz: 'Schwachstellen',
    aufgabe: 'Sucht die Schwachstellen, bevor der Markt sie findet.',
  },
  {
    id: 'investor',
    nummer: 8,
    ziffer: 'VIII',
    name: 'Investor / Kunden-Check',
    kurz: 'Blick von außen',
    aufgabe: 'Schaut von außen drauf: Würde man das kaufen, würde man da investieren?',
  },
]

// Die möglichen Zustände eines Agenten während eines Durchlaufs.
// Wird später von der Ablaufsteuerung gesetzt und von der Oberfläche angezeigt.
export const STATUS = {
  WARTET: 'wartet',
  LAEUFT: 'laeuft',
  FERTIG: 'fertig',
  FEHLER: 'fehler',
}

// Wie die Zustände am Bildschirm heißen. Getrennt vom technischen Wert, damit
// sich die Beschriftung ändern lässt, ohne die Logik anzufassen.
export const STATUS_TEXT = {
  [STATUS.WARTET]: 'offen',
  [STATUS.LAEUFT]: 'in Arbeit',
  [STATUS.FERTIG]: 'fertig',
  [STATUS.FEHLER]: 'Fehler',
}
