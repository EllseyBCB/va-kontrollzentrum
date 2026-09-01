// Eingabe der Geschäftsidee und der Startknopf.
//
// Während ein Durchlauf läuft, ist das Feld gesperrt und der Knopf wird zum
// Abbrechen - damit ist immer klar, in welchem Zustand die Seite gerade ist.

const MINDESTLAENGE = 10

export default function IdeeFormular({
  idee,
  setIdee,
  laeuft,
  starten,
  abbrechen,
  zuruecksetzen,
  fertigeAnzahl,
  schluesselFehlt,
  apiHinweis,
}) {
  const zuKurz = idee.trim().length < MINDESTLAENGE
  const etwasDa = fertigeAnzahl > 0

  return (
    <section className="abschnitt">
      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">Erster Schritt</span>
        Deine Idee
      </h2>

      <p className="abschnitt__vorspann">
        Beschreibe in ein paar Sätzen, was du als Virtuelle Assistenz anbieten
        möchtest und für wen. Je konkreter du bist, desto brauchbarer wird das
        Konzept.
      </p>

      <textarea
        className="feld"
        rows={5}
        value={idee}
        onChange={(e) => setIdee(e.target.value)}
        placeholder="Zum Beispiel: Ich möchte Steuerberatungskanzleien bei der Terminvergabe und der Mandantenkorrespondenz entlasten …"
        disabled={laeuft}
      />

      <div className="feld__fuss">
        {laeuft ? (
          <button className="knopf knopf--still" onClick={abbrechen}>
            Abbrechen
          </button>
        ) : (
          <button className="knopf" onClick={starten} disabled={zuKurz || schluesselFehlt}>
            {etwasDa ? 'Noch einmal von vorn' : 'Konzept schreiben lassen'}
          </button>
        )}

        {!laeuft && etwasDa && (
          <button className="knopf knopf--still" onClick={zuruecksetzen}>
            Leeren
          </button>
        )}

        {/* Genau ein Hinweis, in der Reihenfolge der Dringlichkeit. */}
        {schluesselFehlt && apiHinweis ? (
          <span className="randnotiz randnotiz--warnung">{apiHinweis}</span>
        ) : laeuft ? (
          <span className="randnotiz">
            Die Fachleute arbeiten nacheinander. Das dauert ein paar Minuten.
          </span>
        ) : zuKurz ? (
          <span className="randnotiz">Schreib noch ein paar Worte mehr.</span>
        ) : null}
      </div>
    </section>
  )
}
