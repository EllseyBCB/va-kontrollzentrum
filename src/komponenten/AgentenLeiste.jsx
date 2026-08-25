// Zeigt alle 8 Agenten als Kartenreihe - die eigentliche "Kontrollzentrum"-Ansicht.
//
// Später bekommt jede Karte einen Status (wartet / läuft / fertig / fehler)
// und lässt sich aufklappen, um das Ergebnis des Agenten zu lesen.
// Heute stehen alle auf "wartet".

import { AGENTEN, STATUS } from '../daten/agenten.js'

export default function AgentenLeiste() {
  return (
    <section className="agentenleiste">
      <h2 className="karte__titel">Die 8 Agenten</h2>

      <ol className="agentenleiste__liste">
        {AGENTEN.map((agent) => (
          <li key={agent.id} className={`agentkarte agentkarte--${STATUS.WARTET}`}>
            <div className="agentkarte__kopf">
              <span className="agentkarte__symbol" aria-hidden="true">
                {agent.symbol}
              </span>
              <span className="agentkarte__nummer">Schritt {agent.nummer}</span>
            </div>
            <h3 className="agentkarte__name">{agent.name}</h3>
            <p className="agentkarte__aufgabe">{agent.aufgabe}</p>
            <span className="agentkarte__status">wartet</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
