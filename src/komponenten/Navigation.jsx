// Die Teile der Anwendung, als Reiterzeile.
//
// Die ersten drei stehen in der Reihenfolge, in der man sie braucht: erst das
// Konzept (die gemeinsame Grundlage), dann die Belegschaft (Stellen besetzen),
// dann der Betrieb (arbeiten lassen). Wer den Betrieb zuerst anklickt, findet
// dort niemanden vor - genau so soll es sein.
//
// Besprechung und Rückfrage stehen am Ende, weil sie keine weiteren Stufen
// sind, sondern quer zu allem liegen: Beide setzen den Betrieb voraus, führen
// aber nirgendwohin weiter. Man geht hin, wenn eine Frage mehr als eine Stelle
// angeht - zur Besprechung, wenn ein Beschluss nötig ist, zur Rückfrage, wenn
// eine Auskunft genügt.

const REITER = [
  { id: 'konzept', name: 'Gründungsakte', unter: 'Die Grundlage' },
  { id: 'belegschaft', name: 'Belegschaft', unter: 'Acht Stellen' },
  { id: 'betrieb', name: 'Betrieb', unter: 'Aufträge' },
  { id: 'besprechung', name: 'Besprechung', unter: 'Gemeinsam' },
  { id: 'rueckfrage', name: 'Rückfrage', unter: 'Kurz gefragt' },
]

export default function Navigation({
  reiter,
  setReiter,
  konzeptFertig,
  scharfeAnzahl,
  besprechungenAnzahl,
  rueckfragenAnzahl,
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
    // Auch die Rückfrage braucht zwei: eine, die fragt, eine, die antwortet.
    if (id === 'rueckfrage') {
      if (scharfeAnzahl < 2) return null
      return rueckfragenAnzahl > 0 ? `${rueckfragenAnzahl}` : null
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
