// Die Teile der Anwendung, als Reiterzeile.
//
// Die ersten drei stehen in der Reihenfolge, in der man sie braucht: erst das
// Konzept (die gemeinsame Grundlage), dann die Belegschaft (Stellen besetzen),
// dann der Betrieb (arbeiten lassen). Wer den Betrieb zuerst anklickt, findet
// dort niemanden vor - genau so soll es sein.
//
// Die Besprechung steht am Ende, weil sie keine vierte Stufe ist, sondern quer
// zu allem liegt: Sie setzt den Betrieb voraus, führt aber nirgendwohin weiter.
// Man geht hin, wenn eine Frage mehrere Stellen betrifft.

const REITER = [
  { id: 'konzept', name: 'Gründungsakte', unter: 'Die Grundlage' },
  { id: 'belegschaft', name: 'Belegschaft', unter: 'Acht Stellen' },
  { id: 'betrieb', name: 'Betrieb', unter: 'Aufträge' },
  { id: 'besprechung', name: 'Besprechung', unter: 'Gemeinsam' },
]

export default function Navigation({
  reiter,
  setReiter,
  konzeptFertig,
  scharfeAnzahl,
  besprechungenAnzahl,
}) {
  // Kleine Zahl rechts am Reiter - der Stand auf einen Blick.
  const marke = (id) => {
    if (id === 'belegschaft') return `${scharfeAnzahl}/8`
    if (id === 'betrieb') return scharfeAnzahl > 0 ? `${scharfeAnzahl}` : null
    // Am Tisch braucht es zwei. Solange nur eine im Dienst ist, wäre eine Zahl
    // hier ein Versprechen, das der Bereich nicht einlöst.
    if (id === 'besprechung') {
      if (scharfeAnzahl < 2) return null
      return besprechungenAnzahl > 0 ? `${besprechungenAnzahl}` : null
    }
    return konzeptFertig ? '✓' : null
  }

  return (
    <nav className="reiterzeile" aria-label="Bereiche">
      {REITER.map((r) => (
        <button
          key={r.id}
          className={`reiter ${reiter === r.id ? 'reiter--aktiv' : ''}`}
          onClick={() => setReiter(r.id)}
          aria-current={reiter === r.id ? 'page' : undefined}
        >
          <span className="reiter__name">{r.name}</span>
          <span className="reiter__unter">{marke(r.id) ?? r.unter}</span>
        </button>
      ))}
    </nav>
  )
}
