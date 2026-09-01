// Die acht Fachleute als durchnummerierte Liste - und die Stelle, an der man
// sie einzeln steuert.
//
// Jede Zeile ist ein Kapitel: römische Ziffer, Name, Aufgabe, Stand.
// Sobald etwas geschrieben wurde, lässt sich die Zeile aufklappen. Fertige und
// fehlgeschlagene Schritte lassen sich einzeln wiederholen - dabei bekommt die
// Fachkraft denselben Wissensstand wie beim ersten Mal.

import { useState } from 'react'
import { AGENTEN, STATUS, STATUS_TEXT } from '../daten/agenten.js'
import Markdown from './Markdown.jsx'

export default function AgentenLeiste({ schritte, laeuft, aktiv, wiederholen }) {
  // Welche Kapitel sind aufgeklappt? Wer läuft, ist immer offen.
  const [offen, setOffen] = useState({})

  const umschalten = (id) => setOffen((alt) => ({ ...alt, [id]: !alt[id] }))

  return (
    <section className="abschnitt">
      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">Die Kette</span>
        Die acht Fachleute
      </h2>

      <p className="abschnitt__vorspann">
        Sie arbeiten nacheinander. Jede liest, was die Vorherigen geschrieben
        haben, und baut darauf auf.
      </p>

      <ol className="kapitelliste">
        {AGENTEN.map((agent) => {
          const schritt = schritte[agent.id] ?? { status: STATUS.WARTET, text: '' }
          const arbeitetGerade = aktiv === agent.id
          const hatText = Boolean(schritt.text)
          const istOffen = arbeitetGerade || offen[agent.id]

          return (
            <li key={agent.id} className={`kapitel kapitel--${schritt.status}`}>
              <div className="kapitel__zeile">
                <span className="kapitel__ziffer" aria-hidden="true">
                  {agent.ziffer}
                </span>

                <div className="kapitel__text">
                  <h3 className="kapitel__name">
                    {agent.name}
                    <span className="kapitel__kurz">{agent.kurz}</span>
                  </h3>
                  <p className="kapitel__aufgabe">{agent.aufgabe}</p>

                  {schritt.fehler && (
                    <p className="kapitel__fehler">{schritt.fehler}</p>
                  )}

                  {/* Steuerung der einzelnen Fachkraft */}
                  <div className="kapitel__knoepfe">
                    {hatText && !arbeitetGerade && (
                      <button
                        className="knopf knopf--klein"
                        onClick={() => umschalten(agent.id)}
                      >
                        {istOffen ? 'Zuklappen' : 'Lesen'}
                      </button>
                    )}
                    {(schritt.status === STATUS.FERTIG ||
                      schritt.status === STATUS.FEHLER) && (
                      <button
                        className="knopf knopf--klein"
                        onClick={() => wiederholen(agent.id)}
                        disabled={laeuft}
                      >
                        Nochmal schreiben
                      </button>
                    )}
                  </div>
                </div>

                <span className="kapitel__stand">
                  {arbeitetGerade && <span className="punkt" aria-hidden="true" />}
                  {STATUS_TEXT[schritt.status]}
                </span>
              </div>

              {/* Der geschriebene Abschnitt. Wächst beim Streamen mit. */}
              {istOffen && hatText && (
                <div className="kapitel__beitrag">
                  <Markdown text={schritt.text} />
                </div>
              )}

              {/* Solange das Modell denkt, kommt noch kein Text. */}
              {arbeitetGerade && !hatText && (
                <div className="kapitel__beitrag kapitel__beitrag--wartet">
                  denkt nach …
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
