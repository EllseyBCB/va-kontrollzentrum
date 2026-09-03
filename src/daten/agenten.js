// Stammdaten der acht Positionen.
//
// Hier steht bewusst NUR, WER sie sind und in welcher Reihenfolge sie arbeiten -
// nicht, WIE sie denken. Die Rollen-Prompts liegen auf dem Server
// (server/agenten/), damit sie nicht im Browser lesbar sind.
//
// Diese Liste ist die einzige Stelle, an der die Reihenfolge festgelegt wird.
// Eine Position mehr oder weniger = ein Eintrag hier, sonst nichts.
//
// Jede Position hat zwei Gesichter, und beide stehen hier:
//   aufgabe       - was sie EINMALIG zum Gründungskonzept beiträgt
//   dauerauftrag  - was sie DAUERHAFT tut, sobald sie scharf gestellt ist
//
// Die römische Ziffer ist reine Gestaltung (Kapitelzählung wie in einem Heft) und
// steht hier bei den Daten, damit die Nummerierung nicht in der Komponente
// errechnet werden muss.

export const AGENTEN = [
  {
    id: 'ceo',
    nummer: 1,
    ziffer: 'I',
    name: 'CEO',
    stelle: 'Geschäftsführung',
    kurz: 'Richtung',
    aufgabe: 'Schärft die Idee zu einem klaren Geschäftsmodell und setzt das Ziel.',
    dauerauftrag:
      'Hält die Richtung. Prüft regelmäßig, ob das Geschäft noch auf Kurs ist, und bereitet die Entscheidungen vor, die du treffen musst.',
  },
  {
    id: 'markt',
    nummer: 2,
    ziffer: 'II',
    name: 'Markt',
    stelle: 'Marktbeobachtung',
    kurz: 'Nachfrage',
    aufgabe: 'Prüft Zielgruppe, Wettbewerb und ob es für das Angebot überhaupt Nachfrage gibt.',
    dauerauftrag:
      'Beobachtet Zielgruppe und Wettbewerb weiter. Meldet, wenn sich Nachfrage, Preise oder Mitbewerber verschieben.',
  },
  {
    id: 'angebot',
    nummer: 3,
    ziffer: 'III',
    name: 'Angebot',
    stelle: 'Leistung und Preise',
    kurz: 'Leistung',
    aufgabe: 'Formt konkrete Leistungspakete und Preise daraus.',
    dauerauftrag:
      'Pflegt Pakete und Preise. Schreibt Angebote für einzelne Anfragen und passt den Zuschnitt an, wenn er nicht mehr trägt.',
  },
  {
    id: 'marketing',
    nummer: 4,
    ziffer: 'IV',
    name: 'Marketing',
    stelle: 'Positionierung und Sichtbarkeit',
    kurz: 'Sichtbarkeit',
    aufgabe: 'Entwickelt Positionierung, Botschaft und Sichtbarkeit.',
    dauerauftrag:
      'Sorgt für Sichtbarkeit. Liefert Beiträge, Texte und Themen für die gewählten Kanäle - in einem gleichbleibenden Ton.',
  },
  {
    id: 'akquise',
    nummer: 5,
    ziffer: 'V',
    name: 'Akquise',
    stelle: 'Kundengewinnung',
    kurz: 'Erste Kunden',
    aufgabe: 'Baut den Weg zu den ersten echten Kundinnen und Kunden.',
    dauerauftrag:
      'Füllt die Liste der Ansprechpartner, schreibt die Ansprachen vor und merkt vor, bei wem nachzufassen ist.',
  },
  {
    id: 'finanzen',
    nummer: 6,
    ziffer: 'VI',
    name: 'Finanzen',
    stelle: 'Zahlen und Steuern',
    kurz: 'Zahlen',
    aufgabe: 'Rechnet Einnahmen, Kosten und den Weg zum ersten Gewinn durch.',
    dauerauftrag:
      'Führt die Zahlen mit. Rechnet Monat für Monat nach, mahnt Rücklagen an und warnt, bevor es eng wird.',
  },
  {
    id: 'risiko',
    nummer: 7,
    ziffer: 'VII',
    name: 'Risiko',
    stelle: 'Risiko und Recht',
    kurz: 'Schwachstellen',
    aufgabe: 'Sucht die Schwachstellen, bevor der Markt sie findet.',
    dauerauftrag:
      'Prüft jede größere Entscheidung auf Schwachstellen, Abhängigkeiten und offene rechtliche Punkte - vor der Unterschrift, nicht danach.',
  },
  {
    id: 'investor',
    nummer: 8,
    ziffer: 'VIII',
    name: 'Investor / Kunden-Check',
    stelle: 'Blick von außen',
    kurz: 'Blick von außen',
    aufgabe: 'Schaut von außen drauf: Würde man das kaufen, würde man da investieren?',
    dauerauftrag:
      'Liest gegen. Sagt zu Angeboten, Texten und Plänen, wie sie von außen wirken - als Kundin und als Geldgeber.',
  },
]

// Nachschlagen einer Position über ihre Kennung.
export function agentNach(id) {
  return AGENTEN.find((a) => a.id === id) ?? null
}

/**
 * Wer in einer Besprechung wann spricht.
 *
 * Grundsätzlich die Reihenfolge von oben - sie ist ja nicht willkürlich, sondern
 * baut aufeinander auf: erst der Markt, dann das Angebot, dann die Zahlen.
 *
 * Mit einer Ausnahme: Die Geschäftsführung spricht zuletzt, auch wenn sie oben
 * steht. Wer den Beschluss schreibt, muss alle gehört haben - und eine
 * Geschäftsführung, die als Erste ihre Meinung sagt, bekommt von den anderen
 * sieben Zustimmung statt Widerspruch. Das ist im Sitzungssaal nicht anders.
 *
 * Und deshalb steht die Regel hier bei den Stammdaten: Reihenfolge gehört an
 * eine einzige Stelle, sonst legen zwei Dateien sie unterschiedlich fest.
 */
export function sprechreihenfolge(ids = []) {
  const gewaehlt = AGENTEN.filter((a) => ids.includes(a.id))
  const chef = gewaehlt.find((a) => a.id === 'ceo')
  if (!chef) return gewaehlt
  return [...gewaehlt.filter((a) => a.id !== 'ceo'), chef]
}

// --- Stände während eines Konzept-Durchlaufs --------------------------------

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

// --- Stände einer Stelle im Unternehmen ------------------------------------
//
// Das ist etwas anderes als der Status oben: der Status beschreibt einen
// laufenden Schreibvorgang, der Dienststand die Besetzung der Stelle.
// Er wird nicht gespeichert, sondern aus der Firmenakte errechnet
// (siehe useFirma.dienststand) - so kann er nie veralten.

export const DIENSTSTAND = {
  UNBESETZT: 'unbesetzt', // noch kein einziger Schritt beantwortet
  EINRICHTUNG: 'einrichtung', // Einrichtung angefangen, noch nicht durch
  ENTWURF: 'entwurf', // alle Schritte beantwortet, Dienstanweisung fehlt
  BEREIT: 'bereit', // Dienstanweisung liegt vor, noch nicht scharf
  SCHARF: 'scharf', // im Dienst
}

export const DIENSTSTAND_TEXT = {
  [DIENSTSTAND.UNBESETZT]: 'unbesetzt',
  [DIENSTSTAND.EINRICHTUNG]: 'in Einrichtung',
  [DIENSTSTAND.ENTWURF]: 'Anweisung fehlt',
  [DIENSTSTAND.BEREIT]: 'bereit',
  [DIENSTSTAND.SCHARF]: 'im Dienst',
}
