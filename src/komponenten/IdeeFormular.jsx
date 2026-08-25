// Eingabe der Geschäftsidee.
//
// Später: nimmt den Text entgegen, sperrt das Feld während des Durchlaufs und
// startet über die Ablaufsteuerung den ersten Agenten.
// Heute: reines Aussehen, der Knopf ist absichtlich abgeschaltet.

export default function IdeeFormular() {
  return (
    <section className="abschnitt">
      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">Erster Schritt</span>
        Deine Idee
      </h2>

      <p className="abschnitt__vorspann">
        Beschreibe in ein paar Sätzen, was du als Virtuelle Assistenz anbieten
        möchtest und für wen.
      </p>

      <textarea
        className="feld"
        rows={5}
        placeholder="Zum Beispiel: Ich möchte Steuerberatungskanzleien bei der Terminvergabe und der Mandantenkorrespondenz entlasten …"
        disabled
      />

      <div className="feld__fuss">
        <button className="knopf" disabled>
          Konzept schreiben lassen
        </button>
        <span className="randnotiz">
          Noch ohne Funktion – die Fachleute werden im nächsten Schritt angeschlossen.
        </span>
      </div>
    </section>
  )
}
