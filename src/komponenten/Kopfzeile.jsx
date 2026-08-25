// Kopfzeile im Stil eines Heftkopfs: Kolumnentitel, große Überschrift, Vorspann.
export default function Kopfzeile() {
  return (
    <header className="kopf">
      {/* Kolumnentitel - die schmale Zeile ganz oben, wie über einer Heftseite. */}
      <div className="kolumnentitel">
        <span>Ausgabe 01</span>
        <span>Konzeptbogen</span>
      </div>

      <h1 className="kopf__titel">
        Aus deiner Idee<br />
        ein Geschäft
      </h1>

      <p className="kopf__vorspann">
        Acht Fachleute lesen, was du vorhast – und schreiben daraus ein Konzept
        für dein Business als Virtuelle Assistenz.
      </p>
    </header>
  )
}
