// Der Beleg, dass gespeichert wurde.
//
// Warum es das braucht, obwohl die Anwendung ohnehin bei jeder Änderung
// schreibt: Unsichtbares Speichern glaubt niemand. Ohne diesen Beleg sucht man
// nach einem Speichern-Knopf, findet keinen und traut sich nicht, die Seite zu
// verlassen - obwohl längst alles sicher liegt.
//
// Die Anzeige ist bewusst kein Knopf. Ein Knopf, der nur bestätigt, was schon
// passiert ist, wäre eine Attrappe.

export default function Speicherstand({ um }) {
  if (!um) {
    return (
      <span className="speicherstand">
        Alles wird beim Tippen gespeichert
      </span>
    )
  }

  const uhrzeit = um.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  return (
    <span className="speicherstand speicherstand--frisch">
      Gespeichert um {uhrzeit}
    </span>
  )
}
