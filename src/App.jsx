// Die Hauptkomponente. Sie setzt nur den Satzspiegel zusammen und hält
// (später) den gemeinsamen Zustand des Durchlaufs.
//
// Heute ist alles noch statisch: Formular ohne Funktion, Kapitelliste ohne
// Ergebnisse. Das ist Absicht – erst das Gerüst, dann die Logik.

import Kopfzeile from './komponenten/Kopfzeile.jsx'
import IdeeFormular from './komponenten/IdeeFormular.jsx'
import AgentenLeiste from './komponenten/AgentenLeiste.jsx'
import ErgebnisBereich from './komponenten/ErgebnisBereich.jsx'

export default function App() {
  return (
    <div className="blatt">
      <Kopfzeile />

      <main>
        {/* Schritt 1: Die Teilnehmerin gibt ihre Idee ein. */}
        <IdeeFormular />

        {/* Schritt 2: Die acht Fachleute arbeiten sichtbar nacheinander. */}
        <AgentenLeiste />

        {/* Schritt 3: Aus den Einzelbeiträgen entsteht das Konzept. */}
        <ErgebnisBereich />
      </main>

      <footer className="fussleiste">
        <span>Konzeptbogen für Virtuelle Assistenz</span>
        <span>Grundgerüst v0.1</span>
      </footer>
    </div>
  )
}
