// Eingabe der Geschäftsidee.
//
// Später: nimmt den Text entgegen, sperrt das Feld während des Durchlaufs und
// startet über die Ablaufsteuerung den ersten Agenten.
// Heute: reines Aussehen, der Knopf ist absichtlich deaktiviert.

export default function IdeeFormular() {
  return (
    <section className="karte ideeformular">
      <h2 className="karte__titel">Deine Idee</h2>
      <p className="karte__hinweis">
        Beschreibe in ein paar Sätzen, was du als Virtuelle Assistenz anbieten
        möchtest und für wen.
      </p>

      <textarea
        className="ideeformular__feld"
        rows={5}
        placeholder="Zum Beispiel: Ich möchte Steuerberatungskanzleien bei der Terminvergabe und der Mandantenkorrespondenz entlasten …"
        disabled
      />

      <button className="knopf knopf--gross" disabled>
        Konzept erstellen
      </button>
      <p className="karte__fussnote">
        Noch ohne Funktion – die Agenten werden im nächsten Schritt angeschlossen.
      </p>
    </section>
  )
}
