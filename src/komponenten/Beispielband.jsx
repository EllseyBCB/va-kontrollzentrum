// Das Band unter der Reiterzeile. Es hat zwei Gesichter und sonst keines:
//
//   Akte leer            -> "Erst mal ansehen?" mit dem Knopf zum Laden
//   Beispielakte geladen -> der Hinweis, dass das hier erfunden ist
//   eigene Arbeit da     -> nichts. Wer angefangen hat, will kein Angebot,
//                           sich seine Arbeit überschreiben zu lassen.
//
// Warum der Hinweis dauerhaft stehen bleibt und nicht nur einmal aufblitzt:
// Die Beispielfirma sieht echt aus - sie hat Zahlen, Protokolle und Beschlüsse.
// Nach zehn Minuten Durchklicken weiß man sonst nicht mehr sicher, ob man
// gerade seine eigene Akte vor sich hat oder die erfundene. Ein Band, das
// stehen bleibt, kostet eine Zeile und beantwortet die Frage für immer.

import { useState } from 'react'

export default function Beispielband({ firma }) {
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState(null)

  // Weder leer noch Beispiel: Hier arbeitet jemand. Nicht stören.
  if (!firma.istBeispiel && !firma.istLeer) return null

  const laden = async () => {
    setLaedt(true)
    setFehler(null)
    try {
      // Erst jetzt nachgeladen - Vite macht daraus ein eigenes Stück, das die
      // Seite beim ersten Aufruf nicht mitbringen muss.
      const { beispielAkte } = await import('../daten/beispiel.js')
      firma.beispielLaden(beispielAkte())
      window.scrollTo({ top: 0 })
    } catch {
      setFehler('Das Beispiel ließ sich nicht laden. Lade die Seite neu.')
    } finally {
      setLaedt(false)
    }
  }

  const entfernen = () => {
    if (!window.confirm('Die Beispielakte wird gelöscht. Danach fängst du mit deiner eigenen Idee an.')) return
    firma.akteLeeren()
    window.scrollTo({ top: 0 })
  }

  if (firma.istBeispiel) {
    return (
      <div className="beispielband beispielband--laeuft">
        <span className="beispielband__marke">Beispielakte</span>
        <p className="beispielband__text">
          „Assistenz Mayer" ist erfunden – eine fertige Firma zum Durchklicken.
          Alles darin lässt sich lesen, ändern und sichern. Arbeiten lassen sich
          die Stellen auch, das kostet dann Aufrufe.
        </p>
        <button className="knopf knopf--klein" onClick={entfernen}>
          Beispiel entfernen
        </button>
      </div>
    )
  }

  return (
    <div className="beispielband">
      <span className="beispielband__marke">Erst mal ansehen?</span>
      <p className="beispielband__text">
        Eine fertige Beispielfirma: Konzept, sechs besetzte Stellen mit
        Dienstanweisungen, erledigte Aufträge und zwei Besprechungen mit
        Beschluss. Zum Durchklicken, ohne einen einzigen Aufruf.
      </p>
      <button className="knopf knopf--klein" onClick={laden} disabled={laedt}>
        {laedt ? 'lädt …' : 'Beispiel laden'}
      </button>
      {fehler && <span className="randnotiz randnotiz--warnung">{fehler}</span>}
    </div>
  )
}
