// Die Besprechung: mehrere Stellen reden über dasselbe Thema, reihum.
//
// Der Unterschied zum Betrieb steht in einem Satz: Dort bekommt eine Stelle
// einen Auftrag und liefert ab. Hier hört jede, was die Vorrednerinnen gesagt
// haben, und darf ihnen widersprechen. Am Ende schreibt eine den Beschluss.
//
// Wer hier weniger als zwei Stellen im Dienst hat, kann keine Besprechung
// halten. Das ist kein Fehler, sondern die Bedeutung des Wortes.

import { useState } from 'react'
import { beschlussAus } from '../zustand/useFirma.js'
import { agentNach } from '../daten/agenten.js'
import Markdown from './Markdown.jsx'

export default function Besprechung({ firma, sitzung, zurBelegschaft, serverBereit, apiHinweis }) {
  const imDienst = firma.scharfe
  const [archivOffen, setArchivOffen] = useState(false)

  if (imDienst.length < 2) {
    return (
      <section className="abschnitt">
        <h2 className="abschnitt__titel">
          <span className="abschnitt__marke">Quer zu allem</span>
          Die Besprechung
        </h2>
        <div className="leerseite">
          <p className="leerseite__text">
            {imDienst.length === 0
              ? 'Noch ist keine Stelle im Dienst.'
              : 'Erst eine Stelle ist im Dienst.'}
            <br />
            Eine Besprechung braucht mindestens zwei, die miteinander reden können.
          </p>
          <button className="knopf" onClick={zurBelegschaft}>
            Zur Belegschaft
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="abschnitt">
      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">Quer zu allem</span>
        Die Besprechung
      </h2>

      <p className="abschnitt__vorspann">
        Ein Thema, mehrere Stellen. Jede spricht nach ihrer eigenen
        Dienstanweisung und hört, was die Vorrednerinnen gesagt haben – sie darf
        ihnen ausdrücklich widersprechen. Wer zuletzt spricht, schreibt den
        Beschluss.
      </p>

      {/* ------------------------------------------------------- Das Thema */}
      <div className="schritt">
        <h3 className="schritt__frage">Worüber soll gesprochen werden?</h3>
        <p className="schritt__hinweis">
          Eine Frage, die mehrere Stellen betrifft – dafür gibt es die Runde.
          Was nur eine angeht, ist im Betrieb schneller und billiger erledigt.
        </p>

        <textarea
          className="feld"
          rows={3}
          value={sitzung.thema}
          onChange={(e) => sitzung.setThema(e.target.value)}
          placeholder="Zum Beispiel: Eine Kanzlei will einen Jahresvertrag zu 38 Euro die Stunde. Sollen wir das machen?"
          disabled={sitzung.laeuft}
        />
      </div>

      {/* -------------------------------------------------------- Der Tisch */}
      <div className="schritt">
        <p className="schritt__zaehler">
          {sitzung.tisch.length === 0
            ? 'Noch sitzt niemand am Tisch'
            : `${sitzung.tisch.length} von ${imDienst.length} am Tisch`}
        </p>

        <h3 className="schritt__frage">Wer sitzt am Tisch?</h3>
        <p className="schritt__hinweis">
          Jede Teilnehmerin ist ein eigener Aufruf. Vier gut gewählte Stellen
          sagen mehr als acht, von denen die Hälfte nichts beizutragen hat.
        </p>

        <div className="dienstplan">
          {imDienst.map((a) => {
            const dabei = sitzung.tisch.includes(a.id)
            return (
              <button
                key={a.id}
                className={`dienstmarke ${dabei ? 'dienstmarke--amtisch' : ''}`}
                onClick={() => sitzung.umschalten(a.id)}
                disabled={sitzung.laeuft}
                aria-pressed={dabei}
              >
                <span className="dienstmarke__ziffer">{a.ziffer}</span>
                <span className="dienstmarke__name">{a.name}</span>
                <span className="dienstmarke__stelle">{a.stelle}</span>
              </button>
            )
          })}
        </div>

        <div className="feld__fuss">
          {sitzung.laeuft ? (
            <button className="knopf knopf--still" onClick={sitzung.abbrechen}>
              Besprechung abbrechen
            </button>
          ) : (
            <button
              className="knopf"
              onClick={sitzung.einberufen}
              disabled={!sitzung.bereit || !serverBereit}
            >
              Besprechung einberufen
            </button>
          )}

          <button
            className="knopf knopf--klein"
            onClick={sitzung.alleAnDenTisch}
            disabled={sitzung.laeuft}
          >
            Alle im Dienst
          </button>

          {sitzung.tisch.length > 0 && (
            <button
              className="knopf knopf--klein"
              onClick={sitzung.tischLeeren}
              disabled={sitzung.laeuft}
            >
              Tisch leeren
            </button>
          )}

          {!serverBereit && apiHinweis && (
            <span className="randnotiz randnotiz--warnung">{apiHinweis}</span>
          )}
        </div>

        {/* Die Reihenfolge, bevor es losgeht. Sie ist nicht die Klickreihenfolge,
            deshalb steht sie hier - sonst wundert man sich hinterher. */}
        {sitzung.runde.length >= 2 && (
          <p className="reihenfolge">
            <span className="abschnitt__marke">Sprechreihenfolge</span>
            {sitzung.runde.map((a, i) => (
              <span key={a.id}>
                {i > 0 && <span className="reihenfolge__pfeil">→</span>}
                {a.name}
              </span>
            ))}
            <span className="randnotiz">
              {sitzung.vorsitz?.name} spricht zuletzt und schreibt den Beschluss.
            </span>
          </p>
        )}
      </div>

      {sitzung.fehler && <p className="kapitel__fehler">{sitzung.fehler}</p>}

      {/* ------------------------------------------------ Die laufende Runde */}
      {sitzung.beitraege.length > 0 && (
        <div className="sitzung">
          <div className="ergebnis__kopf">
            <span className="abschnitt__marke">
              {sitzung.laeuft ? 'Die Runde läuft' : 'Das Protokoll'}
            </span>
            {!sitzung.laeuft && (
              <button className="knopf knopf--klein" onClick={sitzung.zuruecksetzen}>
                Tisch abräumen
              </button>
            )}
          </div>

          {sitzung.beitraege.map((b, i) => (
            <Wortmeldung key={`${b.agentId}-${i}`} beitrag={b} />
          ))}
        </div>
      )}

      {/* ------------------------------------------- Was früher besprochen wurde */}
      {firma.besprechungen.length > 0 && (
        <div className="protokoll">
          <div className="ergebnis__kopf">
            <span className="abschnitt__marke">
              Frühere Besprechungen ({firma.besprechungen.length})
            </span>
            <button className="knopf knopf--klein" onClick={() => setArchivOffen(!archivOffen)}>
              {archivOffen ? 'Zuklappen' : 'Aufklappen'}
            </button>
            {archivOffen && (
              <button className="knopf knopf--klein" onClick={firma.besprechungenLeeren}>
                Alle löschen
              </button>
            )}
          </div>

          {archivOffen && (
            <ol className="protokoll__liste">
              {[...firma.besprechungen].reverse().map((b, i) => (
                <li key={i}>
                  <details>
                    <summary>
                      <span className="protokoll__datum">
                        {b.datum ? new Date(b.datum).toLocaleDateString('de-DE') : ''}
                      </span>
                      {b.thema}
                    </summary>
                    <div className="protokoll__antwort">
                      <p className="randnotiz">
                        {b.tisch.map((id) => agentNach(id)?.name ?? id).join(' · ')}
                        {!beschlussAus(b) && ' – abgebrochen, ohne Beschluss'}
                      </p>
                      {b.beitraege.map((e, n) => (
                        <Wortmeldung key={n} beitrag={e} />
                      ))}
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

// Eine einzelne Wortmeldung. Der Beitrag mit dem Vorsitz wird abgesetzt - er
// enthält den Beschluss, und den sucht man später als Einziges wieder.
function Wortmeldung({ beitrag }) {
  const agent = agentNach(beitrag.agentId)
  if (!agent) return null

  return (
    <article className={`wortmeldung ${beitrag.vorsitz ? 'wortmeldung--vorsitz' : ''}`}>
      <div className="wortmeldung__kopf">
        <span className="wortmeldung__ziffer">{agent.ziffer}</span>
        <span className="wortmeldung__name">{agent.name}</span>
        <span className="wortmeldung__stelle">{agent.stelle}</span>
        {beitrag.vorsitz && <span className="wortmeldung__vorsitz">Vorsitz</span>}
      </div>
      {beitrag.text ? (
        <Markdown text={beitrag.text} />
      ) : (
        <p className="randnotiz">{beitrag.laeuft ? 'meldet sich zu Wort …' : '– nichts gesagt –'}</p>
      )}
    </article>
  )
}
