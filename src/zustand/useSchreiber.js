// Ein kleiner Helfer für alles, was der Reihe nach in ein Feld geschrieben wird:
// den Vorschlag zu einem Einrichtungsschritt, die Dienstanweisung, die Antwort
// auf einen Auftrag.
//
// Drei Komponenten bräuchten sonst dreimal dieselben vier Zustände (Text, läuft,
// Fehler, Abbruch) und dieselbe try/catch/finally-Treppe. Einmal genügt.

import { useCallback, useRef, useState } from 'react'

export function useSchreiber() {
  const [text, setText] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState(null)
  const abbruchRef = useRef(null)

  /**
   * @param {(p:{beiText:(s:string)=>void, signal:AbortSignal}) => Promise<string>} aufruf
   * @returns {Promise<string|null>} der fertige Text, oder null bei Abbruch/Fehler
   */
  const schreiben = useCallback(async (aufruf) => {
    if (laeuft) return null

    const steuerung = new AbortController()
    abbruchRef.current = steuerung
    setText('')
    setFehler(null)
    setLaeuft(true)

    try {
      const fertig = await aufruf({
        beiText: (stueck) => setText((alt) => alt + stueck),
        signal: steuerung.signal,
      })
      setText(fertig)
      return fertig
    } catch (f) {
      // Abbruch ist kein Fehler - dann bleibt einfach stehen, was schon da ist.
      if (!steuerung.signal.aborted) setFehler(f.message)
      return null
    } finally {
      setLaeuft(false)
      abbruchRef.current = null
    }
  }, [laeuft])

  const abbrechen = useCallback(() => {
    abbruchRef.current?.abort()
    abbruchRef.current = null
    setLaeuft(false)
  }, [])

  // Wegräumen, ohne einen laufenden Vorgang anzufassen.
  const leeren = useCallback(() => {
    setText('')
    setFehler(null)
  }, [])

  return { text, laeuft, fehler, schreiben, abbrechen, leeren }
}
