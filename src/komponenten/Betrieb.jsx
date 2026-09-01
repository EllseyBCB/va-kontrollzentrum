// Der Betrieb: einer Stelle, die im Dienst ist, einen Auftrag geben.
//
// Hier zeigt sich, ob die Einrichtung etwas taugt. Die Fachkraft bekommt für
// jeden Auftrag drei Dinge mit: ihre Dienstanweisung, das Gründungskonzept und
// ihre letzten Aufträge. Was ihre Anweisung verbietet, tut sie nicht - sie sagt
// dann, welche Stelle der Anweisung dagegensteht.
//
// Wer hier niemanden vorfindet, hat noch niemanden scharf gestellt. Das ist
// kein Fehler, sondern die Reihenfolge.

import { useEffect, useState } from 'react'
import { gibAuftrag } from '../dienste/api.js'
import { useSchreiber } from '../zustand/useSchreiber.js'
import Markdown from './Markdown.jsx'

export default function Betrieb({ firma, zurBelegschaft, serverBereit }) {
  const akte = firma.firma
  const imDienst = firma.scharfe

  const [gewaehlt, setGewaehlt] = useState(imDienst[0]?.id ?? null)
  const [auftrag, setAuftrag] = useState('')
  const [anweisungOffen, setAnweisungOffen] = useState(false)
  const ergebnis = useSchreiber()

  // Wird die gewählte Stelle zurückgezogen, muss die Auswahl nachziehen.
  useEffect(() => {
    if (!imDienst.some((a) => a.id === gewaehlt)) {
      setGewaehlt(imDienst[0]?.id ?? null)
    }
  }, [imDienst, gewaehlt])

  if (imDienst.length === 0) {
    return (
      <section className="abschnitt">
        <h2 className="abschnitt__titel">
          <span className="abschnitt__marke">Dritter Schritt</span>
          Der Betrieb
        </h2>
        <div className="leerseite">
          <p className="leerseite__text">
            Noch ist keine Stelle im Dienst.
            <br />
            Richte in der Belegschaft eine Stelle ein und stell sie scharf.
          </p>
          <button className="knopf" onClick={zurBelegschaft}>
            Zur Belegschaft
          </button>
        </div>
      </section>
    )
  }

  const agent = imDienst.find((a) => a.id === gewaehlt) ?? imDienst[0]
  const pos = akte.positionen[agent.id]

  const abschicken = async () => {
    const text = auftrag.trim()
    if (text.length < 5) return

    const fertig = await ergebnis.schreiben(({ beiText, signal }) =>
      gibAuftrag({
        agentId: agent.id,
        firma: { name: akte.name, idee: akte.idee, konzept: akte.konzept },
        dienstanweisung: pos.dienstanweisung,
        auftrag: text,
        // Die letzten drei genügen als Gedächtnis; mehr bläht jeden Aufruf auf.
        verlauf: pos.protokoll.slice(-3),
        beiText,
        signal,
      }),
    )

    if (fertig) firma.protokollAnhaengen(agent.id, text, fertig)
  }

  return (
    <section className="abschnitt">
      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">Dritter Schritt</span>
        Der Betrieb
      </h2>

      <p className="abschnitt__vorspann">
        {imDienst.length === 1
          ? 'Eine Stelle ist im Dienst.'
          : `${imDienst.length} Stellen sind im Dienst.`}{' '}
        Wähl aus, wer den Auftrag bekommt. Jede arbeitet nach ihrer eigenen
        Anweisung und kennt das Gründungskonzept.
      </p>

      {/* Wer ist im Dienst - und wer bekommt den Auftrag. */}
      <div className="dienstplan">
        {imDienst.map((a) => (
          <button
            key={a.id}
            className={`dienstmarke ${a.id === agent.id ? 'dienstmarke--gewaehlt' : ''}`}
            onClick={() => {
              setGewaehlt(a.id)
              setAnweisungOffen(false)
              ergebnis.leeren()
            }}
          >
            <span className="dienstmarke__ziffer">{a.ziffer}</span>
            <span className="dienstmarke__name">{a.name}</span>
            <span className="dienstmarke__stelle">{a.stelle}</span>
          </button>
        ))}
      </div>

      <div className="schritt">
        <p className="schritt__zaehler">
          {agent.stelle} · {pos.protokoll.length === 0
            ? 'noch kein Auftrag erledigt'
            : `${pos.protokoll.length} Auftr${pos.protokoll.length === 1 ? 'ag' : 'äge'} erledigt`}
        </p>

        <h3 className="schritt__frage">Was soll {agent.name} tun?</h3>
        <p className="schritt__hinweis">{agent.dauerauftrag}</p>

        <textarea
          className="feld"
          rows={4}
          value={auftrag}
          onChange={(e) => setAuftrag(e.target.value)}
          placeholder={`Zum Beispiel: ${beispielAuftrag(agent.id)}`}
          disabled={ergebnis.laeuft}
        />

        <div className="feld__fuss">
          {ergebnis.laeuft ? (
            <button className="knopf knopf--still" onClick={ergebnis.abbrechen}>
              Abbrechen
            </button>
          ) : (
            <button
              className="knopf"
              onClick={abschicken}
              disabled={auftrag.trim().length < 5 || !serverBereit}
            >
              Bearbeiten lassen
            </button>
          )}

          <button
            className="knopf knopf--klein"
            onClick={() => setAnweisungOffen(!anweisungOffen)}
          >
            {anweisungOffen ? 'Anweisung zuklappen' : 'Anweisung nachlesen'}
          </button>

          {!serverBereit && (
            <span className="randnotiz randnotiz--warnung">
              Dafür muss der lokale Server laufen.
            </span>
          )}
        </div>

        {anweisungOffen && (
          <div className="anweisung anweisung--nachlesen">
            <Markdown text={pos.dienstanweisung} />
          </div>
        )}

        {ergebnis.fehler && <p className="kapitel__fehler">{ergebnis.fehler}</p>}

        {(ergebnis.laeuft || ergebnis.text) && (
          <div className="ergebnis__blatt">
            <span className="abschnitt__marke">
              {ergebnis.laeuft ? `${agent.name} arbeitet …` : `${agent.name} meldet`}
            </span>
            {ergebnis.text ? <Markdown text={ergebnis.text} /> : <p className="randnotiz">denkt nach …</p>}
          </div>
        )}
      </div>

      {/* Was diese Stelle bisher erledigt hat. Die letzten zuerst. */}
      {pos.protokoll.length > 0 && (
        <div className="protokoll">
          <div className="ergebnis__kopf">
            <span className="abschnitt__marke">Erledigt</span>
            <button className="knopf knopf--klein" onClick={() => firma.protokollLeeren(agent.id)}>
              Protokoll leeren
            </button>
          </div>
          <ol className="protokoll__liste">
            {[...pos.protokoll].reverse().map((e, i) => (
              <li key={i}>
                <details>
                  <summary>
                    <span className="protokoll__datum">
                      {e.datum ? new Date(e.datum).toLocaleDateString('de-DE') : ''}
                    </span>
                    {e.auftrag}
                  </summary>
                  <div className="protokoll__antwort">
                    <Markdown text={e.antwort} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}

// Ein Beispielauftrag je Stelle - nur als Platzhalter im Feld. Er zeigt die
// Flughöhe: ein Auftrag, kein Thema.
function beispielAuftrag(id) {
  return (
    {
      ceo: 'Schau dir den letzten Monat an und sag mir, welche drei Entscheidungen jetzt anstehen.',
      markt: 'Prüf, ob sich bei den Preisen in unserer Zielgruppe etwas bewegt hat.',
      angebot: 'Eine Kanzlei fragt nach Unterstützung bei der Mandantenkorrespondenz – schreib mir ein Angebot.',
      marketing: 'Drei LinkedIn-Beiträge für nächste Woche, Thema Terminvergabe.',
      akquise: 'Schreib mir die Ansprache für fünf Kanzleien aus meiner Liste.',
      finanzen: 'Hier sind meine Zahlen für August – wo stehe ich, was muss ich zurücklegen?',
      risiko: 'Ich soll einen Rahmenvertrag über zwölf Monate unterschreiben. Wo sind die Fallstricke?',
      investor: 'Lies meine Startseite gegen: Würdest du das kaufen?',
    }[id] ?? 'Beschreib, was zu tun ist.'
  )
}
