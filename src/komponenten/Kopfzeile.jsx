// Kopfzeile im Stil eines Heftkopfs: Kolumnentitel, große Überschrift, Vorspann.
// Sobald das Unternehmen einen Namen hat, steht er oben rechts - wie der
// Zeitschriftentitel über einer Heftseite.
export default function Kopfzeile({ name }) {
  return (
    <header className="kopf">
      {/* Kolumnentitel - die schmale Zeile ganz oben, wie über einer Heftseite. */}
      <div className="kolumnentitel">
        <span>Kontrollzentrum</span>
        <span>{name?.trim() || 'Virtuelle Assistenz'}</span>
      </div>

      <h1 className="kopf__titel">
        Acht Stellen,<br />
        acht Agenten
      </h1>

      <p className="kopf__vorspann">
        Zuerst schreiben sie gemeinsam dein Konzept. Dann besetzt du mit ihnen die
        Positionen deines Unternehmens – eine nach der anderen, jede mit eigener
        Dienstanweisung.
      </p>
    </header>
  )
}
