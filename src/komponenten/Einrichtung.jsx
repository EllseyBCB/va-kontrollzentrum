// Eine einzelne Stelle einrichten - fünf Schritte, dann die Dienstanweisung.
//
// Der Ablauf ist für alle acht derselbe, damit man ihn einmal lernt:
//
//   1 Zuständigkeit → 2 Arbeitsgrundlage → 3 Arbeitsweise → 4 Grenzen →
//   5 Erfolgsmaß → Anweisung schreiben lassen → lesen → freigeben → scharf
//
// Zu jedem Schritt gibt es einen Knopf "Vorschlag holen". Dann schlägt die
// Fachkraft selbst vor, wie ihre Stelle aussehen soll - sie kennt ja das
// Konzept. Der Vorschlag landet aber NIE ungefragt im Feld: Er steht daneben,
// und du übernimmst ihn oder verwirfst ihn. Wer eine Stelle einrichtet, muss
// gelesen haben, was er da festlegt.
//
// Getippt wird direkt in die Firmenakte - kein Speichern-Knopf, nichts geht
// verloren, wenn man den Reiter wechselt.

import { useEffect, useMemo, useState } from 'react'
import { DIENSTSTAND } from '../daten/agenten.js'
import { schritteFuer, STUFEN } from '../daten/einrichtung.js'
import { holeVorschlag, schreibeDienstanweisung } from '../dienste/api.js'
import { alsClaudeAgent, dienstanweisungSpeichern } from '../dienste/dateien.js'
import { useSchreiber } from '../zustand/useSchreiber.js'
import Markdown from './Markdown.jsx'
import Speicherstand from './Speicherstand.jsx'

// Der letzte Halt heißt nicht "6", sondern hat einen eigenen Namen - er ist
// kein weiterer Schritt, sondern das Ergebnis der fünf davor.
const ABSCHLUSS = STUFEN.length

export default function Einrichtung({
  agent,
  firma,
  zurueck,
  naechsteStelle,
  serverBereit,
  apiHinweis,
}) {
  const akte = firma.firma
  const pos = akte.positionen[agent.id]
  const schritte = useMemo(() => schritteFuer(agent.id), [agent.id])

  // Beim Öffnen dort anfangen, wo es liegen geblieben ist.
  const [halt, setHalt] = useState(() => {
    const offen = schritte.findIndex((s) => !pos.antworten[s.id]?.trim())
    return offen === -1 ? ABSCHLUSS : offen
  })

  const vorschlag = useSchreiber()
  const anweisung = useSchreiber()
  const [bearbeiten, setBearbeiten] = useState(false)

  // Bei jedem Wechsel - des Schritts wie der Stelle - den alten Vorschlag
  // wegräumen. Sonst steht der Vorschlag zu Frage 2 noch unter Frage 3.
  useEffect(() => {
    vorschlag.abbrechen()
    vorschlag.leeren()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [halt, agent.id])

  // Beim Wechsel der Stelle ganz von vorn anfangen.
  useEffect(() => {
    const offen = schritte.findIndex((s) => !akte.positionen[agent.id].antworten[s.id]?.trim())
    setHalt(offen === -1 ? ABSCHLUSS : offen)
    setBearbeiten(false)
    anweisung.leeren()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id])

  // Der Hintergrund, den die Fachkraft für jeden Aufruf braucht.
  const firmenkontext = { name: akte.name, idee: akte.idee, konzept: akte.konzept }

  // Was vor diesem Schritt schon festgelegt wurde - damit der Vorschlag dazu passt.
  const bisherFuer = (index) =>
    schritte
      .slice(0, index)
      .filter((s) => pos.antworten[s.id]?.trim())
      .map((s) => ({ titel: s.titel, antwort: pos.antworten[s.id] }))

  const schritt = halt < ABSCHLUSS ? schritte[halt] : null
  const antwort = schritt ? (pos.antworten[schritt.id] ?? '') : ''
  const hatAnweisung = Boolean(pos.dienstanweisung.trim())
  const stand = firma.dienststand(agent.id)

  // --- Handlungen ----------------------------------------------------------

  const vorschlagHolen = () =>
    vorschlag.schreiben(({ beiText, signal }) =>
      holeVorschlag({
        agentId: agent.id,
        firma: firmenkontext,
        stufeTitel: schritt.titel,
        frage: schritt.frage,
        hinweis: schritt.hinweis,
        bisher: bisherFuer(halt),
        beiText,
        signal,
      }),
    )

  const vorschlagUebernehmen = () => {
    firma.setzeAntwort(agent.id, schritt.id, vorschlag.text.trim())
    vorschlag.leeren()
  }

  const anweisungSchreiben = async () => {
    setBearbeiten(false)
    const fertig = await anweisung.schreiben(({ beiText, signal }) =>
      schreibeDienstanweisung({
        agentId: agent.id,
        firma: firmenkontext,
        antworten: schritte.map((s) => ({
          titel: s.titel,
          frage: s.frage,
          antwort: pos.antworten[s.id] ?? '',
        })),
        beiText,
        signal,
      }),
    )
    if (fertig) firma.setzeDienstanweisung(agent.id, fertig)
  }

  const offeneSchritte = schritte.filter((s) => !pos.antworten[s.id]?.trim())

  return (
    <section className="abschnitt einrichtung">
      {/* Kopf der Stelle */}
      <div className="stellenkopf">
        <button className="knopf knopf--klein" onClick={zurueck}>
          ← Belegschaft
        </button>
        <div className="stellenkopf__rechts">
          <Speicherstand um={firma.gespeichertUm} />
          <span className="kapitel__stand">
            {pos.scharf && <span className="punkt" aria-hidden="true" />}
            {stand === DIENSTSTAND.SCHARF ? 'im Dienst' : 'noch nicht im Dienst'}
          </span>
        </div>
      </div>

      <h2 className="abschnitt__titel">
        <span className="abschnitt__marke">
          {agent.ziffer} · {agent.stelle}
        </span>
        {agent.name} einrichten
      </h2>

      <p className="abschnitt__vorspann">{agent.dauerauftrag}</p>

      {/* Die Schrittleiste. Springt man hin und her, geht nichts verloren -
          jede Eingabe steht sofort in der Akte. */}
      <ol className="schrittleiste">
        {schritte.map((s, i) => (
          <li key={s.id}>
            <button
              className={`schrittmarke ${i === halt ? 'schrittmarke--hier' : ''} ${
                pos.antworten[s.id]?.trim() ? 'schrittmarke--voll' : ''
              }`}
              onClick={() => setHalt(i)}
            >
              <span className="schrittmarke__ziffer">{s.ziffer}</span>
              <span className="schrittmarke__titel">{s.kurz}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            className={`schrittmarke schrittmarke--abschluss ${
              halt === ABSCHLUSS ? 'schrittmarke--hier' : ''
            } ${hatAnweisung ? 'schrittmarke--voll' : ''}`}
            onClick={() => setHalt(ABSCHLUSS)}
          >
            <span className="schrittmarke__ziffer">✓</span>
            <span className="schrittmarke__titel">Anweisung</span>
          </button>
        </li>
      </ol>

      {/* ------------------------------------------------ einer der fünf Schritte */}
      {schritt && (
        <div className="schritt">
          <p className="schritt__zaehler">
            Schritt {schritt.nummer} von {STUFEN.length} · {schritt.worum}
          </p>

          <h3 className="schritt__frage">{schritt.frage}</h3>
          <p className="schritt__hinweis">{schritt.hinweis}</p>

          <textarea
            className="feld"
            rows={5}
            value={antwort}
            onChange={(e) => firma.setzeAntwort(agent.id, schritt.id, e.target.value)}
            placeholder={schritt.beispiel}
          />

          <div className="feld__fuss">
            {vorschlag.laeuft ? (
              <button className="knopf knopf--still" onClick={vorschlag.abbrechen}>
                Abbrechen
              </button>
            ) : (
              <button
                className="knopf knopf--still"
                onClick={vorschlagHolen}
                disabled={!serverBereit}
                title={
                  serverBereit
                    ? `${agent.name} schlägt selbst vor, wie diese Stelle aussehen soll`
                    : apiHinweis || ''
                }
              >
                Vorschlag holen
              </button>
            )}

            {!antwort.trim() && !vorschlag.laeuft && (
              <span className="randnotiz">
                Bleibt der Punkt leer, steht er später als „Noch nicht festgelegt"
                in der Anweisung.
              </span>
            )}
          </div>

          {/* Der Vorschlag steht NEBEN dem Feld, nie darin. */}
          {(vorschlag.laeuft || vorschlag.text || vorschlag.fehler) && (
            <div className="vorschlag">
              <span className="abschnitt__marke">
                {vorschlag.laeuft ? `${agent.name} überlegt …` : `Vorschlag von ${agent.name}`}
              </span>

              {vorschlag.fehler ? (
                <p className="kapitel__fehler">{vorschlag.fehler}</p>
              ) : (
                <p className="vorschlag__text">{vorschlag.text || 'denkt nach …'}</p>
              )}

              {!vorschlag.laeuft && vorschlag.text && (
                <div className="kapitel__knoepfe">
                  <button className="knopf knopf--klein" onClick={vorschlagUebernehmen}>
                    {antwort.trim() ? 'Übernehmen und ersetzen' : 'Übernehmen'}
                  </button>
                  <button className="knopf knopf--klein" onClick={vorschlag.leeren}>
                    Verwerfen
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="schrittfuss">
            <button
              className="knopf knopf--still"
              onClick={() => setHalt(halt - 1)}
              disabled={halt === 0}
            >
              Zurück
            </button>
            <button className="knopf" onClick={() => setHalt(halt + 1)}>
              {halt === STUFEN.length - 1 ? 'Zur Dienstanweisung' : 'Weiter'}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- der Abschluss */}
      {halt === ABSCHLUSS && (
        <div className="schritt">
          <p className="schritt__zaehler">Abschluss · Die Dienstanweisung</p>

          <h3 className="schritt__frage">
            Aus deinen Festlegungen schreibt {agent.name} die eigene Dienstanweisung.
          </h3>
          <p className="schritt__hinweis">
            Das ist der Text, an den sich die Stelle künftig hält. Lies ihn, ändere
            was nicht stimmt – und stell sie erst dann scharf.
          </p>

          {/* Was festgelegt wurde, in Kurzform. Damit man vor dem Schreiben sieht,
              was fehlt. */}
          <ul className="festlegungen">
            {schritte.map((s) => {
              const a = pos.antworten[s.id]?.trim()
              return (
                <li key={s.id} className={a ? '' : 'festlegungen--offen'}>
                  <button className="festlegungen__marke" onClick={() => setHalt(s.nummer - 1)}>
                    {s.ziffer} {s.titel}
                  </button>
                  <span>{a || 'noch offen'}</span>
                </li>
              )
            })}
          </ul>

          <div className="feld__fuss">
            {anweisung.laeuft ? (
              <button className="knopf knopf--still" onClick={anweisung.abbrechen}>
                Abbrechen
              </button>
            ) : (
              <button
                className="knopf"
                onClick={anweisungSchreiben}
                disabled={!serverBereit || offeneSchritte.length === STUFEN.length}
              >
                {hatAnweisung ? 'Neu schreiben lassen' : 'Dienstanweisung schreiben lassen'}
              </button>
            )}

            {offeneSchritte.length > 0 && !anweisung.laeuft && (
              <span className="randnotiz randnotiz--warnung">
                {offeneSchritte.length === STUFEN.length
                  ? 'Noch nichts festgelegt – geh die fünf Schritte durch.'
                  : `${offeneSchritte.length} Punkt${offeneSchritte.length === 1 ? '' : 'e'} noch offen. Die Anweisung bleibt an diesen Stellen leer.`}
              </span>
            )}
            {!hatAnweisung && !anweisung.laeuft && (
              <button className="knopf knopf--klein" onClick={() => setBearbeiten(true)}>
                Oder selbst schreiben
              </button>
            )}

            {!serverBereit && apiHinweis && (
              <span className="randnotiz randnotiz--warnung">
                {apiHinweis} Von Hand geht es auch hier.
              </span>
            )}
          </div>

          {anweisung.fehler && <p className="kapitel__fehler">{anweisung.fehler}</p>}

          {/* Die Anweisung: beim Schreiben mitlesen, danach aus der Akte.
              Auch offen, wenn jemand sie von Hand schreibt - dann ist noch
              nichts da, was man anzeigen könnte. */}
          {(anweisung.laeuft || hatAnweisung || bearbeiten) && (
            <div className="anweisung">
              {bearbeiten ? (
                <>
                  <textarea
                    className="feld feld--gross"
                    rows={22}
                    value={pos.dienstanweisung}
                    onChange={(e) => firma.setzeDienstanweisung(agent.id, e.target.value)}
                    placeholder={`## Dienstanweisung – ${agent.stelle}\n\n### Auftrag\nWofür es diese Stelle gibt …`}
                  />
                  <div className="kapitel__knoepfe">
                    <button className="knopf knopf--klein" onClick={() => setBearbeiten(false)}>
                      Fertig bearbeitet
                    </button>
                  </div>
                </>
              ) : (
                <Markdown text={anweisung.laeuft ? anweisung.text : pos.dienstanweisung} />
              )}

              {!anweisung.laeuft && hatAnweisung && !bearbeiten && (
                <div className="kapitel__knoepfe">
                  <button className="knopf knopf--klein" onClick={() => setBearbeiten(!bearbeiten)}>
                    {bearbeiten ? 'Fertig bearbeitet' : 'Bearbeiten'}
                  </button>
                  <button
                    className="knopf knopf--klein"
                    onClick={() => dienstanweisungSpeichern(agent, pos.dienstanweisung)}
                  >
                    Als Datei speichern
                  </button>
                  <button
                    className="knopf knopf--klein"
                    onClick={() => alsClaudeAgent(agent, pos.dienstanweisung, akte.name)}
                    title="Legt eine Agentendatei an, die in Claude Code unter .claude/agents/ arbeitet"
                  >
                    Als Claude-Code-Agent
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Die Freigabe. Der einzige Knopf, der eine Stelle in den Dienst stellt. */}
          {hatAnweisung && !anweisung.laeuft && (
            <div className="freigabe">
              {pos.scharf ? (
                <>
                  <p className="freigabe__text">
                    <strong>{agent.name} ist im Dienst.</strong> Die Stelle nimmt
                    im Reiter „Betrieb" Aufträge an und hält sich dabei an diese
                    Anweisung.
                  </p>
                  <div className="kapitel__knoepfe">
                    <button
                      className="knopf knopf--still"
                      onClick={() => firma.zurueckziehen(agent.id)}
                    >
                      Zurückziehen
                    </button>
                    {naechsteStelle && (
                      <button className="knopf" onClick={naechsteStelle.oeffnen}>
                        Weiter zu {naechsteStelle.name} →
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="freigabe__text">
                    Wenn dieser Text stimmt, gib die Stelle frei. Ab dann arbeitet
                    {' '}{agent.name} danach – und nur danach. Das hat keine Eile:
                    Die Anweisung ist gespeichert, auch wenn du jetzt weggehst.
                  </p>
                  <div className="kapitel__knoepfe">
                    <button
                      className="knopf knopf--scharf"
                      onClick={() => firma.scharfStellen(agent.id)}
                    >
                      Freigeben und scharf stellen
                    </button>
                    <button className="knopf knopf--still" onClick={zurueck}>
                      Später entscheiden
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
