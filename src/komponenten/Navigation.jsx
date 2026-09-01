// Die drei Teile der Anwendung, als Reiterzeile.
//
// Sie stehen in der Reihenfolge, in der man sie braucht: erst das Konzept
// (die gemeinsame Grundlage), dann die Belegschaft (Stellen besetzen), dann
// der Betrieb (arbeiten lassen). Wer den Betrieb zuerst anklickt, findet dort
// niemanden vor - genau so soll es sein.

const REITER = [
  { id: 'konzept', name: 'Gründungsakte', unter: 'Die Grundlage' },
  { id: 'belegschaft', name: 'Belegschaft', unter: 'Acht Stellen' },
  { id: 'betrieb', name: 'Betrieb', unter: 'Aufträge' },
]

export default function Navigation({ reiter, setReiter, konzeptFertig, scharfeAnzahl }) {
  // Kleine Zahl rechts am Reiter - der Stand auf einen Blick.
  const marke = (id) => {
    if (id === 'belegschaft') return `${scharfeAnzahl}/8`
    if (id === 'betrieb') return scharfeAnzahl > 0 ? `${scharfeAnzahl}` : null
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
