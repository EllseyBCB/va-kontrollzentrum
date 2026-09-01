// Die Ablaufsteuerung: ruft die acht Fachleute NACHEINANDER auf und gibt jeder
// die Ergebnisse der Vorherigen mit. Genau das macht aus acht Einzelantworten
// ein zusammenhängendes Konzept.
//
// Bewusst als eigener Haken (Hook) und nicht in App.jsx: Die Oberfläche soll nur
// anzeigen, die Ablauf-Logik liegt an einer einzigen, testbaren Stelle.
//
// Was sich von hier aus steuern lässt:
//   starten()            - alle acht der Reihe nach
//   abbrechen()          - laufenden Durchlauf stoppen
//   wiederholen(id)      - eine einzelne Fachkraft noch einmal, mit demselben
//                          Wissensstand wie beim ersten Mal
//   zuruecksetzen()      - alles leeren und von vorn

import { useCallback, useEffect, useRef, useState } from 'react'
import { AGENTEN, STATUS } from '../daten/agenten.js'
import { fuehreAgentAus } from '../dienste/api.js'

// Startzustand: alle acht offen, ohne Ergebnis.
function frischerZustand() {
  const z = {}
  for (const a of AGENTEN) {
    z[a.id] = { status: STATUS.WARTET, text: '', fehler: null }
  }
  return z
}

// Idee und Konzept gehören nicht hierher, sondern in die Firmenakte - sie
// überleben den Besuch. Beides wird deshalb hereingereicht, statt hier zu
// entstehen: der Durchlauf ist flüchtig, sein Ergebnis nicht.
export function useDurchlauf({ idee, setIdee, konzeptSichern }) {
  const [schritte, setSchritte] = useState(frischerZustand)
  const [laeuft, setLaeuft] = useState(false)
  const [aktiv, setAktiv] = useState(null) // id der Fachkraft, die gerade arbeitet

  // Zum Abbrechen. In einem Ref, weil es Neuzeichnungen überleben muss.
  const abbruchRef = useRef(null)

  // Hilfsfunktion: einen einzelnen Schritt verändern, ohne die anderen anzufassen.
  const setzeSchritt = useCallback((id, aenderung) => {
    setSchritte((alt) => ({ ...alt, [id]: { ...alt[id], ...aenderung } }))
  }, [])

  // Führt eine Fachkraft aus und schreibt das Ergebnis in den Zustand.
  // "vorwissen" ist das, was die Vorherigen geschrieben haben.
  const einenAusfuehren = useCallback(
    async (agent, text, vorwissen, signal) => {
      setAktiv(agent.id)
      setzeSchritt(agent.id, { status: STATUS.LAEUFT, text: '', fehler: null })

      try {
        const ergebnis = await fuehreAgentAus({
          agentId: agent.id,
          idee: text,
          bisherige: vorwissen,
          signal,
          // Bei jedem Textstück sofort anzeigen - man sieht beim Schreiben zu.
          beiText: (stueck) => {
            setSchritte((alt) => ({
              ...alt,
              [agent.id]: { ...alt[agent.id], text: alt[agent.id].text + stueck },
            }))
          },
        })

        setzeSchritt(agent.id, { status: STATUS.FERTIG, text: ergebnis, fehler: null })
        return ergebnis
      } catch (f) {
        // Ein Abbruch ist kein Fehler - der Schritt geht einfach zurück auf offen.
        if (signal?.aborted) {
          setzeSchritt(agent.id, { status: STATUS.WARTET, text: '', fehler: null })
          return null
        }
        setzeSchritt(agent.id, { status: STATUS.FEHLER, fehler: f.message })
        throw f
      } finally {
        setAktiv(null)
      }
    },
    [setzeSchritt],
  )

  // Alle acht der Reihe nach.
  const starten = useCallback(async () => {
    const text = idee.trim()
    if (text.length < 10 || laeuft) return

    const steuerung = new AbortController()
    abbruchRef.current = steuerung

    setSchritte(frischerZustand())
    setLaeuft(true)

    // Wächst mit jedem Schritt - das ist das gemeinsame Gedächtnis des Durchlaufs.
    const vorwissen = []

    try {
      for (const agent of AGENTEN) {
        if (steuerung.signal.aborted) break

        const ergebnis = await einenAusfuehren(agent, text, vorwissen, steuerung.signal)
        if (ergebnis === null) break // abgebrochen

        vorwissen.push({ id: agent.id, name: agent.name, text: ergebnis })
      }
    } catch {
      // Der fehlgeschlagene Schritt steht schon auf FEHLER. Der Durchlauf hält
      // hier an - die Teilnehmerin kann ihn einzeln wiederholen.
    } finally {
      setLaeuft(false)
      abbruchRef.current = null
    }
  }, [idee, laeuft, einenAusfuehren])

  // Einen einzelnen Schritt noch einmal - mit demselben Wissensstand wie beim
  // ersten Mal, also nur mit den Ergebnissen der Vorherigen.
  const wiederholen = useCallback(
    async (agentId) => {
      const text = idee.trim()
      if (text.length < 10 || laeuft) return

      const platz = AGENTEN.findIndex((a) => a.id === agentId)
      if (platz < 0) return
      const agent = AGENTEN[platz]

      const vorwissen = AGENTEN.slice(0, platz)
        .filter((a) => schritte[a.id]?.status === STATUS.FERTIG)
        .map((a) => ({ id: a.id, name: a.name, text: schritte[a.id].text }))

      const steuerung = new AbortController()
      abbruchRef.current = steuerung
      setLaeuft(true)

      try {
        await einenAusfuehren(agent, text, vorwissen, steuerung.signal)
      } catch {
        // Fehler steht bereits am Schritt.
      } finally {
        setLaeuft(false)
        abbruchRef.current = null
      }
    },
    [idee, laeuft, schritte, einenAusfuehren],
  )

  const abbrechen = useCallback(() => {
    abbruchRef.current?.abort()
    abbruchRef.current = null
    setLaeuft(false)
    setAktiv(null)
  }, [])

  const zuruecksetzen = useCallback(() => {
    abbruchRef.current?.abort()
    abbruchRef.current = null
    setSchritte(frischerZustand())
    setLaeuft(false)
    setAktiv(null)
  }, [])

  // Abgeleitete Werte für die Oberfläche.
  const fertige = AGENTEN.filter((a) => schritte[a.id]?.status === STATUS.FERTIG)
  const alleFertig = fertige.length === AGENTEN.length

  // Das Konzept ist schlicht die Aneinanderreihung der acht Abschnitte,
  // in der Reihenfolge, in der sie entstanden sind.
  const konzept = fertige.map((a) => schritte[a.id].text.trim()).join('\n\n')

  // Jeder fertige Abschnitt wandert sofort in die Firmenakte. Nicht erst am
  // Ende: Bricht der Durchlauf bei Kapitel VI ab, sind die fünf davor trotzdem
  // gesichert und die Agenten können damit eingerichtet werden.
  useEffect(() => {
    if (konzept.trim()) konzeptSichern(konzept)
  }, [konzept, konzeptSichern])

  return {
    idee,
    setIdee,
    schritte,
    laeuft,
    aktiv,
    fertigeAnzahl: fertige.length,
    alleFertig,
    konzept,
    starten,
    abbrechen,
    wiederholen,
    zuruecksetzen,
  }
}
