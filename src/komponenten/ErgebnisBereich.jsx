// Das fertige Konzept aus allen acht Beiträgen - lesbar am Bildschirm und
// als Datei zum Mitnehmen.

import Markdown from './Markdown.jsx'
import { AGENTEN } from '../daten/agenten.js'
import { konzeptSpeichern } from '../dienste/dateien.js'

export default function ErgebnisBereich({ idee, konzept, fertigeAnzahl, alleFertig, weiter }) {
  const nochNichts = fertigeAnzahl === 0

  return (
    <section className="abschnitt">
      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">Ergebnis</span>
        Dein Konzept
      </h2>

      {nochNichts ? (
        <div className="leerseite">
          <p className="leerseite__text">
            Sobald die acht Fachleute gearbeitet haben,
            <br />
            steht dein Konzept an dieser Stelle.
          </p>
        </div>
      ) : (
        <>
          <div className="ergebnis__kopf">
            <span className="randnotiz">
              {alleFertig
                ? `Alle ${AGENTEN.length} Abschnitte sind fertig.`
                : `${fertigeAnzahl} von ${AGENTEN.length} Abschnitten fertig – es fehlt noch etwas.`}
            </span>
            <button
              className="knopf knopf--klein"
              onClick={() => konzeptSpeichern(idee, konzept)}
            >
              Als Datei speichern
            </button>
          </div>

          <article className="konzept">
            <Markdown text={konzept} />
          </article>

          {/* Ohne diesen Faden bliebe das Konzept ein Text. Von hier aus wird
              daraus ein Unternehmen mit besetzten Stellen. */}
          <div className="weiterfaden">
            <p className="weiterfaden__text">
              Das Konzept ist jetzt die Grundlage für alle acht. Als Nächstes
              besetzt du damit die Stellen: Jede Fachkraft wird in fünf Schritten
              eingerichtet und bekommt eine Dienstanweisung.
            </p>
            <button className="knopf" onClick={weiter}>
              Zur Belegschaft →
            </button>
          </div>
        </>
      )}
    </section>
  )
}
