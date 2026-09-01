// Die Hauptkomponente. Sie hält zwei Dinge zusammen:
//
//   firma      - was bleibt: Idee, Konzept, die acht Stellen, ihre Anweisungen
//   durchlauf  - was flüchtig ist: der laufende Schreibvorgang des Konzepts
//
// Und sie entscheidet, welcher der drei Bereiche gerade zu sehen ist. Mehr
// nicht: Gearbeitet wird in den Haken, angezeigt in den Komponenten.

import { useEffect, useState, useSyncExternalStore } from 'react'
import Kopfzeile from './komponenten/Kopfzeile.jsx'
import Navigation from './komponenten/Navigation.jsx'
import Zugang from './komponenten/Zugang.jsx'
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
import { holeSchluessel, beobachte } from './dienste/schluessel.js'

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

  // Der eigene Schlüssel - nur in der veröffentlichten Fassung überhaupt gefragt.
  const eigenerSchluessel = useSyncExternalStore(beobachte, holeSchluessel, () => '')

  const serverWeg = serverStand?.status === 'weg'
  // Zwei Fassungen, zwei Herkünfte des Schlüssels:
  //   lokal   liegt er in der .env  -> "schluesselHinterlegt" sagt, ob er da ist
  //   Worker  bringt ihn die Besucherin mit -> "schluesselNoetig" ist gesetzt
  const schluesselNoetig = serverStand?.schluesselNoetig === true
  const schluesselFehlt =
    serverWeg ||
    serverStand?.schluesselHinterlegt === false ||
    (schluesselNoetig && !eigenerSchluessel)
  // Erst wenn geprüft UND alles in Ordnung ist, dürfen Knöpfe drücken.
  const serverBereit = serverStand !== null && !schluesselFehlt

  // Warum die Knöpfe aus sind - in einem Satz, hier zusammengestellt. Die
  // Bausteine zeigen ihn nur noch an: Sie sollen nicht wissen müssen, ob sie
  // lokal laufen oder im Netz, sonst steht in der veröffentlichten Fassung ein
  // Rat, den dort niemand befolgen kann ("trag ihn in die .env ein").
  const apiHinweis = serverWeg
    ? 'Dafür muss eine API erreichbar sein – auf dem eigenen Rechner über npm run dev.'
    : schluesselNoetig && !eigenerSchluessel
      ? 'Dafür fehlt noch dein Anthropic-Schlüssel – trag ihn oben ein.'
      : serverStand?.schluesselHinterlegt === false
        ? 'Es ist noch kein API-Schlüssel hinterlegt – trag ihn in die Datei .env ein und starte den Server neu.'
        : null

  // Wenn gar keine API erreichbar ist, bleibt die Seite eine Vorschau. Der
  // Hinweis steht in jedem Bereich, damit niemand vergeblich klickt.
  const hinweis = serverWeg ? (
    <p className="warnleiste">
      Hier ist keine API erreichbar, deshalb können die Agenten gerade nicht
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

      {/* Nur in der veröffentlichten Fassung: dort hält die API keinen Schlüssel. */}
      {schluesselNoetig && <Zugang />}

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
              apiHinweis={apiHinweis}
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
              apiHinweis={apiHinweis}
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
              apiHinweis={apiHinweis}
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
