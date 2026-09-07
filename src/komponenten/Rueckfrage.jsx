// Die Rückfrage: eine Stelle fragt kurz bei einer Kollegin nach.
//
// Der kurze Dienstweg neben der Besprechung. Dort setzt sich das halbe Haus an
// einen Tisch und fasst am Ende einen Beschluss; hier will jemand eine einzige
// Auskunft und arbeitet dann weiter. Ein Aufruf statt vier.
//
// Zwei Stellen müssen im Dienst sein - eine, die fragt, und eine, die
// antwortet. Wer nur eine besetzt hat, hat niemanden zum Fragen.
//
// Die Gefragte bleibt an ihre Dienstanweisung gebunden. Was sie im Betrieb
// nicht zusagen darf, sagt sie auch hier nicht zu - das ist der ganze Grund,
// warum die Anweisung mitgeschickt wird und nicht bloß die Frage.

import { useEffect, useState } from 'react'
import { stelleRueckfrage } from '../dienste/api.js'
import { useSchreiber } from '../zustand/useSchreiber.js'
import { agentNach } from '../daten/agenten.js'
import Markdown from './Markdown.jsx'

export default function Rueckfrage({ firma, zurBelegschaft, serverBereit, apiHinweis }) {
  const akte = firma.firma
  const imDienst = firma.scharfe

  const [fragerId, setFragerId] = useState(imDienst[0]?.id ?? null)
  const [gefragteId, setGefragteId] = useState(imDienst[1]?.id ?? null)
  const [frage, setFrage] = useState('')
  const [kontext, setKontext] = useState('')
  const [archivOffen, setArchivOffen] = useState(false)
  const antwort = useSchreiber()

  // Wird eine der beiden Stellen zurückgezogen, muss die Auswahl nachziehen -
  // sonst zeigt die Seite auf jemanden, der nicht mehr im Dienst ist.
  useEffect(() => {
    if (!imDienst.some((a) => a.id === fragerId)) setFragerId(imDienst[0]?.id ?? null)
  }, [imDienst, fragerId])

  useEffect(() => {
    if (gefragteId === fragerId || !imDienst.some((a) => a.id === gefragteId)) {
      setGefragteId(imDienst.find((a) => a.id !== fragerId)?.id ?? null)
    }
  }, [imDienst, fragerId, gefragteId])

  if (imDienst.length < 2) {
    return (
      <section className="abschnitt">
        <h2 className="abschnitt__titel">
          <span className="abschnitt__marke">Der kurze Weg</span>
          Die Rückfrage
        </h2>
        <div className="leerseite">
          <p className="leerseite__text">
            {imDienst.length === 0
              ? 'Noch ist keine Stelle im Dienst.'
              : 'Erst eine Stelle ist im Dienst.'}
            <br />
            Zum Nachfragen braucht es zwei: eine, die fragt, und eine, die antwortet.
          </p>
          <button className="knopf" onClick={zurBelegschaft}>
            Zur Belegschaft
          </button>
        </div>
      </section>
    )
  }

  const frager = agentNach(fragerId)
  const gefragte = agentNach(gefragteId)
  const bereit = Boolean(frager && gefragte) && frage.trim().length >= 5

  const abschicken = async () => {
    if (!bereit) return

    const fertig = await antwort.schreiben(({ beiText, signal }) =>
      stelleRueckfrage({
        // Die Gefragte ist die Hauptperson: Ihre Anweisung bindet, ihr gehört
        // der Prompt. Deshalb steht sie in agentId und nicht die Fragerin.
        agentId: gefragte.id,
        fragerId: frager.id,
        firma: { name: akte.name, idee: akte.idee, konzept: akte.konzept },
        dienstanweisung: akte.positionen[gefragte.id].dienstanweisung,
        frage: frage.trim(),
        kontext: kontext.trim(),
        beiText,
        signal,
      }),
    )

    if (fertig) {
      firma.rueckfrageSichern({
        fragerId: frager.id,
        agentId: gefragte.id,
        frage: frage.trim(),
        kontext: kontext.trim(),
        antwort: fertig,
      })
    }
  }

  return (
    <section className="abschnitt">
      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">Der kurze Weg</span>
        Die Rückfrage
      </h2>

      <p className="abschnitt__vorspann">
        Eine Frage, eine Kollegin, eine kurze Auskunft. Für alles, wofür eine
        Besprechung zu schwer ist – wenn jemand mitten in der Arbeit eine Zahl
        braucht und dann weitermacht. Die Gefragte bleibt dabei an ihre
        Dienstanweisung gebunden.
      </p>

      {/* Wer fragt. */}
      <div className="wahlzeile">
        <p className="wahlzeile__marke">Wer fragt?</p>
        <div className="dienstplan">
          {imDienst.map((a) => (
            <button
              key={a.id}
              className={`dienstmarke ${a.id === fragerId ? 'dienstmarke--gewaehlt' : ''}`}
              onClick={() => setFragerId(a.id)}
              disabled={antwort.laeuft}
            >
              <span className="dienstmarke__ziffer">{a.ziffer}</span>
              <span className="dienstmarke__name">{a.name}</span>
              <span className="dienstmarke__stelle">{a.stelle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wen sie fragt. Die fragende Stelle steht hier nicht mehr zur Wahl -
          niemand fragt sich selbst, und was gar nicht erst anklickbar ist,
          muss man auch nicht hinterher abweisen. */}
      <div className="wahlzeile">
        <p className="wahlzeile__marke">Wen fragt {frager?.name}?</p>
        <div className="dienstplan">
          {imDienst
            .filter((a) => a.id !== fragerId)
            .map((a) => (
              <button
                key={a.id}
                className={`dienstmarke ${a.id === gefragteId ? 'dienstmarke--gewaehlt' : ''}`}
                onClick={() => {
                  setGefragteId(a.id)
                  antwort.leeren()
                }}
                disabled={antwort.laeuft}
              >
                <span className="dienstmarke__ziffer">{a.ziffer}</span>
                <span className="dienstmarke__name">{a.name}</span>
                <span className="dienstmarke__stelle">{a.stelle}</span>
              </button>
            ))}
        </div>
      </div>

      <div className="schritt">
        <h3 className="schritt__frage">
          Was will {frager?.name} von {gefragte?.name} wissen?
        </h3>
        <p className="schritt__hinweis">
          Eine Frage, die sich in einem Satz beantworten lässt. Wer eine
          Ausarbeitung braucht, gibt im Betrieb einen Auftrag.
        </p>

        <textarea
          className="feld"
          rows={2}
          value={frage}
          onChange={(e) => setFrage(e.target.value)}
          placeholder={`Zum Beispiel: ${beispielFrage(gefragteId)}`}
          disabled={antwort.laeuft}
        />

        <label className="beiwerk" htmlFor="rueckfrage-kontext">
          Woran {frager?.name} gerade arbeitet <span className="beiwerk__zusatz">– kann leer bleiben</span>
        </label>
        <textarea
          id="rueckfrage-kontext"
          className="feld feld--klein"
          rows={2}
          value={kontext}
          onChange={(e) => setKontext(e.target.value)}
          placeholder="Ein Satz. Wer weiß, woran die Kollegin sitzt, antwortet brauchbarer."
          disabled={antwort.laeuft}
        />

        <div className="feld__fuss">
          {antwort.laeuft ? (
            <button className="knopf knopf--still" onClick={antwort.abbrechen}>
              Abbrechen
            </button>
          ) : (
            <button className="knopf" onClick={abschicken} disabled={!bereit || !serverBereit}>
              Fragen
            </button>
          )}

          {!serverBereit && apiHinweis && (
            <span className="randnotiz randnotiz--warnung">{apiHinweis}</span>
          )}
        </div>

        {antwort.fehler && <p className="kapitel__fehler">{antwort.fehler}</p>}

        {(antwort.laeuft || antwort.text) && (
          <div className="zuruf">
            <p className="zuruf__kopf">
              <span className="zuruf__ziffer">{gefragte?.ziffer}</span>
              <span className="zuruf__name">{gefragte?.name}</span>
              <span className="zuruf__stelle">{gefragte?.stelle}</span>
            </p>
            {antwort.text ? (
              <Markdown text={antwort.text} />
            ) : (
              <p className="randnotiz">überlegt kurz …</p>
            )}
          </div>
        )}
      </div>

      {/* Was schon gefragt wurde. Die letzten zuerst. */}
      {firma.rueckfragen.length > 0 && (
        <div className="protokoll">
          <div className="ergebnis__kopf">
            <span className="abschnitt__marke">
              Schon gefragt ({firma.rueckfragen.length})
            </span>
            <button className="knopf knopf--klein" onClick={() => setArchivOffen(!archivOffen)}>
              {archivOffen ? 'Zuklappen' : 'Aufklappen'}
            </button>
            {archivOffen && (
              <button className="knopf knopf--klein" onClick={firma.rueckfragenLeeren}>
                Alle löschen
              </button>
            )}
          </div>

          {archivOffen && (
            <ol className="protokoll__liste">
              {[...firma.rueckfragen].reverse().map((r, i) => (
                <li key={i}>
                  <details>
                    <summary>
                      <span className="protokoll__datum">
                        {r.datum ? new Date(r.datum).toLocaleDateString('de-DE') : ''}
                      </span>
                      {agentNach(r.fragerId)?.name} → {agentNach(r.agentId)?.name}: {r.frage}
                    </summary>
                    <div className="protokoll__antwort">
                      {r.kontext && <p className="randnotiz">Dabei ging es um: {r.kontext}</p>}
                      <Markdown text={r.antwort} />
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  )
}

// Eine Beispielfrage je gefragter Stelle - nur als Platzhalter im Feld. Sie
// zeigt die Flughöhe: eine Auskunft, kein Auftrag.
function beispielFrage(id) {
  return (
    {
      ceo: 'Hat sich an unserer Priorität für dieses Quartal etwas geändert?',
      markt: 'Was ist gerade das übliche Preisniveau bei unserer Zielgruppe?',
      angebot: 'Ist die Fristenüberwachung im Paket Fach enthalten oder nicht?',
      marketing: 'Wie nennen wir das Paket nach außen?',
      akquise: 'Steht Kanzlei Weber schon auf unserer Liste?',
      finanzen: 'Was ist unser Mindeststundensatz?',
      risiko: 'Brauche ich dafür einen AV-Vertrag?',
      investor: 'Wirkt der Satz von außen glaubwürdig?',
    }[id] ?? 'Eine kurze Frage.'
  )
}
