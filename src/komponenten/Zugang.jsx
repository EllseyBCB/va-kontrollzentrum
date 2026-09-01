// Die Schlüsselzeile - nur in der veröffentlichten Fassung zu sehen.
//
// Lokal hält der Server den Schlüssel, und diese Komponente erscheint nie. Im
// Netz bringt jede ihren eigenen mit: Der Worker hält keinen, sonst liefen
// fremde Durchläufe auf fremde Rechnung.
//
// Gestaltet wie ein Formularkopf auf einem Amtsbogen: eine Zeile, eine Angabe,
// darunter der Hinweis, was damit passiert. Kein Kasten, keine Warnfarbe -
// es ist ja nichts schiefgegangen.

import { useState, useSyncExternalStore } from 'react'
import { holeSchluessel, setzeSchluessel, beobachte, siehtEchtAus } from '../dienste/schluessel.js'

/** Nur die letzten vier Zeichen zeigen - genug zum Wiedererkennen, mehr nicht. */
function verkuerzt(schluessel) {
  return `sk-ant-…${schluessel.slice(-4)}`
}

export default function Zugang() {
  const schluessel = useSyncExternalStore(beobachte, holeSchluessel, () => '')
  const [entwurf, setEntwurf] = useState('')
  const [dauerhaft, setDauerhaft] = useState(false)
  const [gemeckert, setGemeckert] = useState(false)

  // Steht einer da, reicht die schmale Bestätigungszeile.
  if (schluessel) {
    return (
      <div className="zugang zugang--steht">
        <span className="zugang__marke">Schlüssel</span>
        <code className="zugang__wert">{verkuerzt(schluessel)}</code>
        <span className="randnotiz">bleibt in diesem Browser</span>
        <button
          type="button"
          className="knopf knopf--klein"
          onClick={() => {
            setzeSchluessel('')
            setEntwurf('')
            setGemeckert(false)
          }}
        >
          Entfernen
        </button>
      </div>
    )
  }

  const uebernehmen = (ereignis) => {
    ereignis.preventDefault()
    if (!siehtEchtAus(entwurf)) {
      setGemeckert(true)
      return
    }
    setzeSchluessel(entwurf, dauerhaft)
    setEntwurf('')
  }

  return (
    <form className="zugang" onSubmit={uebernehmen}>
      <p className="zugang__vorspann">
        Diese Fassung im Netz hat keinen eigenen Schlüssel – deshalb arbeiten die
        Agenten hier nur mit deinem. Er geht an{' '}
        <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">
          Anthropic
        </a>{' '}
        und sonst nirgendwohin; gespeichert wird er in deinem Browser, nicht bei
        uns. Lesen, Einrichten und Sichern geht auch ohne.
      </p>

      <div className="zugang__zeile">
        <input
          type="password"
          className="feld feld--zeile"
          value={entwurf}
          onChange={(e) => {
            setEntwurf(e.target.value)
            setGemeckert(false)
          }}
          placeholder="sk-ant-…"
          autoComplete="off"
          spellCheck="false"
          aria-label="Anthropic-Schlüssel"
        />
        <button type="submit" className="knopf" disabled={!entwurf.trim()}>
          Übernehmen
        </button>
      </div>

      <label className="zugang__merken">
        <input
          type="checkbox"
          checked={dauerhaft}
          onChange={(e) => setDauerhaft(e.target.checked)}
        />
        <span>
          Über das Schließen des Tabs hinaus merken.{' '}
          <span className="randnotiz">
            Ohne Haken ist er weg, sobald du den Tab schließt – der sicherere Weg.
          </span>
        </span>
      </label>

      {gemeckert && (
        <p className="randnotiz randnotiz--warnung">
          Das sieht nicht nach einem Anthropic-Schlüssel aus. Sie beginnen mit
          <code> sk-ant-</code> und stehen in der Console unter „API Keys".
        </p>
      )}
    </form>
  )
}
