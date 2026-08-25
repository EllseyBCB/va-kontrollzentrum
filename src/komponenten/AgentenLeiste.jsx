// Die acht Fachleute als durchnummerierte Liste – kein Kachelraster.
//
// Jede Zeile ist ein Kapitel: römische Ziffer, Name, Aufgabe, Stand.
// Später bekommt jede Zeile einen echten Status und lässt sich aufklappen,
// um das Ergebnis zu lesen. Heute steht alles auf "offen".

import { AGENTEN, STATUS, STATUS_TEXT } from '../daten/agenten.js'

export default function AgentenLeiste() {
  return (
    <section className="abschnitt">
      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">Zweiter Schritt</span>
        Die acht Fachleute
      </h2>

      <p className="abschnitt__vorspann">
        Sie arbeiten nacheinander. Jede und jeder liest, was die Vorherigen
        geschrieben haben, und baut darauf auf.
      </p>

      <ol className="kapitelliste">
        {AGENTEN.map((agent) => (
          <li key={agent.id} className={`kapitel kapitel--${STATUS.WARTET}`}>
            <span className="kapitel__ziffer" aria-hidden="true">
              {agent.ziffer}
            </span>

            <div className="kapitel__text">
              <h3 className="kapitel__name">
                {agent.name}
                <span className="kapitel__kurz">{agent.kurz}</span>
              </h3>
              <p className="kapitel__aufgabe">{agent.aufgabe}</p>
            </div>

            <span className="kapitel__stand">{STATUS_TEXT[STATUS.WARTET]}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
