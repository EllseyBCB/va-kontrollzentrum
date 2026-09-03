// Die Ablaufsteuerung einer Besprechung: mehrere Stellen reden reihum über
// dasselbe Thema, und jede sieht, was die Vorrednerinnen gesagt haben.
//
// Das ist dasselbe Verfahren wie im Gründungsdurchlauf (useDurchlauf.js), nur
// mit zwei Unterschieden, die zählen:
//
//   1. Es sitzen nur Stellen am Tisch, die im Dienst sind. Wer keine
//      freigegebene Dienstanweisung hat, redet auch nicht mit.
//   2. Jede spricht gebunden an ihre eigene Anweisung. Was sie laut Anweisung
//      nicht darf, verspricht sie am Tisch nicht - das ist der Unterschied
//      zwischen einer Belegschaft und acht Meinungen.
//
// Warum nacheinander und nicht gleichzeitig: Acht parallele Aufrufe wären
// schneller, aber dann redeten acht Stellen aneinander vorbei. Widerspruch
// setzt voraus, dass man gehört hat, wem man widerspricht.
//
// Der Server hält keine Sitzung. Bei jedem Aufruf geht mit, was bisher gesagt
// wurde - deshalb lässt sich eine Runde jederzeit abbrechen, ohne dass
// irgendwo etwas Halbes zurückbleibt.

import { useCallback, useRef, useState } from 'react'
import { sprechreihenfolge } from '../daten/agenten.js'
import { sprichInBesprechung } from '../dienste/api.js'

export function useBesprechung(firma) {
  const [thema, setThema] = useState('')
  const [tisch, setTisch] = useState([]) // Kennungen, ungeordnet - die Reihenfolge macht sprechreihenfolge()
  const [beitraege, setBeitraege] = useState([]) // [{agentId, text, vorsitz, laeuft}]
  const [laeuft, setLaeuft] = useState(false)
  const [aktiv, setAktiv] = useState(null)
  const [fehler, setFehler] = useState(null)

  // Zum Abbrechen. In einem Ref, weil es Neuzeichnungen überleben muss.
  const abbruchRef = useRef(null)

  // Eine Stelle an den Tisch holen oder wieder wegschicken.
  const umschalten = useCallback((agentId) => {
    setTisch((alt) =>
      alt.includes(agentId) ? alt.filter((id) => id !== agentId) : [...alt, agentId],
    )
  }, [])

  const alleAnDenTisch = useCallback(() => {
    setTisch(firma.scharfe.map((a) => a.id))
  }, [firma.scharfe])

  const tischLeeren = useCallback(() => setTisch([]), [])

  // Die Runde. Der Reihe nach, jede mit allem, was vorher gesagt wurde.
  const einberufen = useCallback(async () => {
    const frage = thema.trim()
    const runde = sprechreihenfolge(tisch)
    if (frage.length < 5 || runde.length < 2 || laeuft) return

    const steuerung = new AbortController()
    abbruchRef.current = steuerung

    setBeitraege([])
    setFehler(null)
    setLaeuft(true)

    // Das gemeinsame Gedächtnis der Runde. Wächst mit jeder Wortmeldung.
    const gesagt = []

    try {
      for (let i = 0; i < runde.length; i++) {
        if (steuerung.signal.aborted) break

        const agent = runde[i]
        // Die Letzte schreibt den Beschluss. Wer das ist, entscheidet die
        // Sprechreihenfolge - in der Regel die Geschäftsführung.
        const vorsitz = i === runde.length - 1

        setAktiv(agent.id)
        setBeitraege((alt) => [...alt, { agentId: agent.id, text: '', vorsitz, laeuft: true }])

        const text = await sprichInBesprechung({
          agentId: agent.id,
          firma: {
            name: firma.firma.name,
            idee: firma.firma.idee,
            konzept: firma.firma.konzept,
          },
          dienstanweisung: firma.firma.positionen[agent.id].dienstanweisung,
          thema: frage,
          tisch: runde.map((a) => a.id),
          beitraege: gesagt,
          vorsitz,
          signal: steuerung.signal,
          // Bei jedem Textstück sofort anzeigen - man sieht dem Tisch beim
          // Reden zu, statt zwei Minuten auf eine leere Seite zu starren.
          beiText: (stueck) => {
            setBeitraege((alt) =>
              alt.map((b, n) => (n === alt.length - 1 ? { ...b, text: b.text + stueck } : b)),
            )
          },
        })

        setBeitraege((alt) =>
          alt.map((b, n) => (n === alt.length - 1 ? { ...b, text, laeuft: false } : b)),
        )
        gesagt.push({ agentId: agent.id, text, vorsitz })
      }
    } catch (f) {
      // Ein Abbruch ist kein Fehler - dann bleibt stehen, was schon gesagt wurde.
      if (!steuerung.signal.aborted) setFehler(f.message)
      // Die angefangene Wortmeldung ist nicht zu Ende geschrieben. Sie bleibt
      // sichtbar, wird aber nicht mit ins Protokoll genommen: gesagt ist nur,
      // was fertig gesagt wurde.
      setBeitraege((alt) => alt.map((b) => ({ ...b, laeuft: false })))
    } finally {
      setAktiv(null)
      setLaeuft(false)
      abbruchRef.current = null

      // Auch eine abgebrochene Runde kommt in die Akte. Sie hat Geld gekostet
      // und enthält, was gesagt wurde - nur eben keinen Beschluss. Genau das
      // erkennt beschlussAus() daran, dass kein Beitrag den Vorsitz trägt.
      if (gesagt.length > 0) {
        firma.besprechungSichern(frage, runde.map((a) => a.id), gesagt)
      }
    }
  }, [thema, tisch, laeuft, firma])

  const abbrechen = useCallback(() => {
    abbruchRef.current?.abort()
    abbruchRef.current = null
    setLaeuft(false)
    setAktiv(null)
  }, [])

  // Den Tisch abräumen für die nächste Runde. Das Protokoll bleibt in der Akte.
  const zuruecksetzen = useCallback(() => {
    abbruchRef.current?.abort()
    abbruchRef.current = null
    setBeitraege([])
    setFehler(null)
    setLaeuft(false)
    setAktiv(null)
  }, [])

  const runde = sprechreihenfolge(tisch)

  return {
    thema,
    setThema,
    tisch,
    runde, // dieselben Stellen, aber in Sprechreihenfolge
    umschalten,
    alleAnDenTisch,
    tischLeeren,
    beitraege,
    laeuft,
    aktiv,
    fehler,
    einberufen,
    abbrechen,
    zuruecksetzen,
    // Wer den Beschluss schreiben wird - für den Hinweis am Bildschirm.
    vorsitz: runde[runde.length - 1] ?? null,
    bereit: thema.trim().length >= 5 && runde.length >= 2,
  }
}
