// Die Hauptkomponente. Sie hält zwei Dinge zusammen:
//
//   firma      - was bleibt: Idee, Konzept, die acht Stellen, ihre Anweisungen
//   durchlauf  - was flüchtig ist: der laufende Schreibvorgang des Konzepts
//
// Und sie entscheidet, welcher der drei Bereiche gerade zu sehen ist. Mehr
// nicht: Gearbeitet wird in den Haken, angezeigt in den Komponenten.

import { useEffect, useState } from 'react'
import Kopfzeile from './komponenten/Kopfzeile.jsx'
import Navigation from './komponenten/Navigation.jsx'
import IdeeFormular from './komponenten/IdeeFormular.jsx'
import AgentenLeiste from './komponenten/AgentenLeiste.jsx'
import ErgebnisBereich from './komponenten/ErgebnisBereich.jsx'
import Belegschaft from './komponenten/Belegschaft.jsx'
import Einrichtung from './komponenten/Einrichtung.jsx'
import Betrieb from './komponenten/Betrieb.jsx'
import { AGENTEN, agentNach } from './daten/agenten.js'
import { useFirma } from './zustand/useFirma.js'
import { useDurchlauf } from './zustand/useDurchlauf.js'
import { pruefeVerbindung } from './dienste/api.js'

export default function App() {
  const firma = useFirma()
  const durchlauf = useDurchlauf({
    idee: firma.idee,
    setIdee: firma.setIdee,
    konzeptSichern: firma.konzeptSichern,
  })

  // Man kommt dort an, wo man steht: Wer schon jemanden im Dienst hat, will
  // arbeiten lassen; wer ein Konzept hat, will besetzen; sonst geht es von vorn
  // los. Nur beim ersten Aufruf ausgewertet.
  const [reiter, setReiter] = useState(() => {
    if (firma.scharfeAnzahl > 0) return 'betrieb'
    if (firma.hatKonzept) return 'belegschaft'
    return 'konzept'
  })

  // Welche Stelle gerade eingerichtet wird. null = die Übersicht.
  const [stelleInArbeit, setStelleInArbeit] = useState(null)

  // Beim Laden einmal fragen, ob der Server da ist und ein Schlüssel hinterlegt
  // wurde. So steht der Hinweis auf der Seite, bevor jemand vergeblich klickt.
  // null = noch nicht geprüft.
  const [serverStand, setServerStand] = useState(null)

  useEffect(() => {
    let abgemeldet = false
    pruefeVerbindung()
      .then((d) => !abgemeldet && setServerStand(d))
      .catch(() => !abgemeldet && setServerStand({ status: 'weg' }))
    return () => {
      abgemeldet = true
    }
  }, [])

  const serverWeg = serverStand?.status === 'weg'
  const schluesselFehlt = serverWeg || serverStand?.schluesselHinterlegt === false
  // Erst wenn geprüft UND beides in Ordnung ist, dürfen Knöpfe drücken.
  const serverBereit = serverStand !== null && !schluesselFehlt

  // Auf GitHub Pages gibt es keinen Server - dort ist die Seite eine Vorschau.
  // Der Hinweis muss deshalb beides abdecken und steht in jedem Bereich.
  const hinweis = serverWeg ? (
    <p className="warnleiste">
      Hier ist kein Server erreichbar, deshalb können die Agenten gerade nicht
      arbeiten. Einrichten, lesen und sichern geht trotzdem – alles bleibt in
      diesem Browser gespeichert. Zum Arbeiten die Fassung auf dem eigenen
      Rechner starten: <code>npm run dev</code>.
    </p>
  ) : null

  const einrichten = (agentId) => {
    setStelleInArbeit(agentId)
    setReiter('belegschaft')
  }

  // Nach dem Scharfstellen soll es weitergehen: die nächste Stelle, die noch
  // nicht im Dienst ist. Ohne diesen Faden bleibt es bei einem Agenten.
  const naechsteOffene = (agentId) => {
    const ab = AGENTEN.findIndex((a) => a.id === agentId)
    const kandidat =
      AGENTEN.slice(ab + 1).find((a) => !firma.firma.positionen[a.id].scharf) ??
      AGENTEN.find((a) => !firma.firma.positionen[a.id].scharf && a.id !== agentId)
    if (!kandidat) return null
    return { name: kandidat.name, oeffnen: () => setStelleInArbeit(kandidat.id) }
  }

  return (
    <div className="blatt">
      <Kopfzeile name={firma.name} />

      <Navigation
        reiter={reiter}
        setReiter={(r) => {
          setReiter(r)
          if (r !== 'belegschaft') setStelleInArbeit(null)
        }}
        konzeptFertig={firma.hatKonzept}
        scharfeAnzahl={firma.scharfeAnzahl}
      />

      <main>
        {/* ------------------------------------------------- Gründungsakte */}
        {reiter === 'konzept' && (
          <>
            {hinweis}

            <IdeeFormular
              idee={durchlauf.idee}
              setIdee={durchlauf.setIdee}
              laeuft={durchlauf.laeuft}
              starten={durchlauf.starten}
              abbrechen={durchlauf.abbrechen}
              zuruecksetzen={durchlauf.zuruecksetzen}
              fertigeAnzahl={durchlauf.fertigeAnzahl}
              schluesselFehlt={schluesselFehlt}
            />

            <AgentenLeiste
              schritte={durchlauf.schritte}
              laeuft={durchlauf.laeuft}
              aktiv={durchlauf.aktiv}
              wiederholen={durchlauf.wiederholen}
            />

            <ErgebnisBereich
              idee={durchlauf.idee}
              konzept={durchlauf.konzept}
              fertigeAnzahl={durchlauf.fertigeAnzahl}
              alleFertig={durchlauf.alleFertig}
              weiter={() => setReiter('belegschaft')}
            />
          </>
        )}

        {/* --------------------------------------------------- Belegschaft */}
        {reiter === 'belegschaft' &&
          (stelleInArbeit ? (
            <Einrichtung
              agent={agentNach(stelleInArbeit)}
              firma={firma}
              zurueck={() => setStelleInArbeit(null)}
              naechsteStelle={naechsteOffene(stelleInArbeit)}
              serverBereit={serverBereit}
            />
          ) : (
            <Belegschaft firma={firma} einrichten={einrichten} hinweis={hinweis} />
          ))}

        {/* ------------------------------------------------------- Betrieb */}
        {reiter === 'betrieb' && (
          <>
            {hinweis}
            <Betrieb
              firma={firma}
              zurBelegschaft={() => setReiter('belegschaft')}
              serverBereit={serverBereit}
            />
          </>
        )}
      </main>

      <footer className="fussleiste">
        <span>Kontrollzentrum für Virtuelle Assistenz</span>
        <span>{serverStand?.modell ? `Modell ${serverStand.modell}` : 'Vorschau ohne Server'}</span>
      </footer>
    </div>
  )
}
