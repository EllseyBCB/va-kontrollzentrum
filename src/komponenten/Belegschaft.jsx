// Die acht Stellen des Unternehmens auf einer Seite.
//
// Das ist die Personalübersicht: Wer ist eingerichtet, wer ist im Dienst, wo
// fehlt noch etwas. Von hier aus geht es in die Einrichtung einer einzelnen
// Stelle - und von hier aus wird scharf gestellt.
//
// Der Scharfschalter sitzt bewusst hier und nicht in der Einrichtung: Man soll
// sehen, was man tut, während man sieht, wer sonst noch im Dienst ist.

import { AGENTEN, DIENSTSTAND, DIENSTSTAND_TEXT } from '../daten/agenten.js'
import { STUFEN } from '../daten/einrichtung.js'
import {
  akteSpeichern,
  akteWaehlen,
  alleAnweisungenSpeichern,
} from '../dienste/dateien.js'
import Speicherstand from './Speicherstand.jsx'

export default function Belegschaft({ firma, einrichten, hinweis }) {
  const akte = firma.firma

  const einlesen = async () => {
    try {
      const daten = await akteWaehlen()
      if (!daten) return
      if (!window.confirm('Die eingelesene Akte ersetzt die jetzige vollständig. Fortfahren?')) return
      firma.akteEinlesen(daten)
    } catch (f) {
      window.alert(f.message)
    }
  }

  const leeren = () => {
    if (!window.confirm('Wirklich alles löschen? Konzept, alle Festlegungen, alle Dienstanweisungen und alle Besprechungen sind dann weg.')) return
    firma.akteLeeren()
  }

  const anweisungenDa = AGENTEN.some((a) => akte.positionen[a.id]?.dienstanweisung.trim())

  return (
    <section className="abschnitt">
      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">Zweiter Schritt</span>
        Die Belegschaft
      </h2>

      <p className="abschnitt__vorspann">
        Acht Stellen, acht Agenten. Jede wird in fünf Schritten eingerichtet:
        Zuständigkeit, Arbeitsgrundlage, Arbeitsweise, Grenzen, Erfolgsmaß.
        Am Ende steht eine Dienstanweisung, die du liest und freigibst – erst
        dann lässt sich die Stelle scharf stellen.
      </p>

      {hinweis}

      {/* Name des Unternehmens. Steht hier, weil er zur Belegschaft gehört und
          in jede Dienstanweisung eingeht. */}
      <div className="firmenzeile">
        <label className="firmenzeile__marke" htmlFor="firmenname">
          Unternehmen
        </label>
        <input
          id="firmenname"
          className="feld feld--zeile"
          value={akte.name}
          onChange={(e) => firma.setName(e.target.value)}
          placeholder="Noch ohne Namen"
        />
        <span className="randnotiz">
          {firma.scharfeAnzahl === 0
            ? 'Noch niemand im Dienst.'
            : `${firma.scharfeAnzahl} von ${AGENTEN.length} Stellen im Dienst.`}
        </span>
      </div>

      <ol className="kapitelliste">
        {AGENTEN.map((agent) => {
          const pos = akte.positionen[agent.id]
          const stand = firma.dienststand(agent.id)
          const { beantwortet, gesamt } = firma.fortschritt(agent.id)
          const hatAnweisung = Boolean(pos.dienstanweisung.trim())

          return (
            <li key={agent.id} className={`kapitel stelle stelle--${stand}`}>
              <div className="kapitel__zeile">
                <span className="kapitel__ziffer" aria-hidden="true">
                  {agent.ziffer}
                </span>

                <div className="kapitel__text">
                  <h3 className="kapitel__name">
                    {agent.name}
                    <span className="kapitel__kurz">{agent.stelle}</span>
                  </h3>
                  <p className="kapitel__aufgabe">{agent.dauerauftrag}</p>

                  {/* Fünf Striche für fünf Schritte - der Einrichtungsstand,
                      ohne dass man Zahlen lesen muss. */}
                  <div className="stufenbalken" aria-hidden="true">
                    {STUFEN.map((s, i) => (
                      <span
                        key={s.id}
                        className={`stufenbalken__strich ${
                          i < beantwortet ? 'stufenbalken__strich--voll' : ''
                        }`}
                      />
                    ))}
                    <span className="stufenbalken__zahl">
                      {beantwortet}/{gesamt}
                      {hatAnweisung ? ' · Anweisung liegt vor' : ''}
                    </span>
                  </div>

                  <div className="kapitel__knoepfe">
                    <button className="knopf knopf--klein" onClick={() => einrichten(agent.id)}>
                      {stand === DIENSTSTAND.UNBESETZT
                        ? 'Einrichten'
                        : stand === DIENSTSTAND.SCHARF
                          ? 'Anweisung ansehen'
                          : 'Weiter einrichten'}
                    </button>

                    {pos.scharf ? (
                      <button
                        className="knopf knopf--klein"
                        onClick={() => firma.zurueckziehen(agent.id)}
                      >
                        Zurückziehen
                      </button>
                    ) : (
                      <button
                        className="knopf knopf--klein knopf--scharf"
                        onClick={() => firma.scharfStellen(agent.id)}
                        disabled={!hatAnweisung}
                        title={
                          hatAnweisung
                            ? 'Diese Stelle nimmt danach Aufträge an'
                            : 'Erst die Dienstanweisung schreiben lassen und freigeben'
                        }
                      >
                        Scharf stellen
                      </button>
                    )}
                  </div>
                </div>

                <span className="kapitel__stand">
                  {pos.scharf && <span className="punkt" aria-hidden="true" />}
                  {DIENSTSTAND_TEXT[stand]}
                </span>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Die Akte als Ganzes. Der Browserspeicher hängt an diesem einen Rechner -
          wer umzieht oder etwas sichern will, braucht diese Knöpfe. */}
      <div className="aktenzeile">
        <div className="aktenzeile__kopf">
          <span className="abschnitt__marke">Die Akte</span>
          <Speicherstand um={firma.gespeichertUm} />
        </div>
        <div className="kapitel__knoepfe">
          <button className="knopf knopf--klein" onClick={() => akteSpeichern(akte)}>
            Akte sichern
          </button>
          <button className="knopf knopf--klein" onClick={einlesen}>
            Akte einlesen
          </button>
          <button
            className="knopf knopf--klein"
            onClick={() => alleAnweisungenSpeichern(akte, AGENTEN)}
            disabled={!anweisungenDa}
          >
            Alle Anweisungen speichern
          </button>
          <button className="knopf knopf--klein" onClick={leeren}>
            Alles löschen
          </button>
        </div>
        <span className="randnotiz">
          Alles liegt in diesem Browser, auf diesem Rechner. Wer umzieht, sichert
          die Akte als Datei und liest sie drüben wieder ein.
        </span>
      </div>
    </section>
  )
}
