// Die Hauptkomponente. Sie setzt nur das Layout zusammen und hält
// (später) den gemeinsamen Zustand des Durchlaufs.
//
// Heute ist alles noch statisch: Formular ohne Funktion, Agentenkarten ohne
// Ergebnisse. Das ist Absicht - erst das Gerüst, dann die Logik.

import Kopfzeile from './komponenten/Kopfzeile.jsx'
import IdeeFormular from './komponenten/IdeeFormular.jsx'
import AgentenLeiste from './komponenten/AgentenLeiste.jsx'
import ErgebnisBereich from './komponenten/ErgebnisBereich.jsx'

export default function App() {
  return (
    <div className="app">
      <Kopfzeile />

      <main className="app__inhalt">
        {/* Schritt 1: Die Teilnehmerin gibt ihre Idee ein. */}
        <IdeeFormular />

        {/* Schritt 2: Die 8 Agenten arbeiten sichtbar nacheinander. */}
        <AgentenLeiste />

        {/* Schritt 3: Aus den Einzelergebnissen entsteht das Konzept. */}
        <ErgebnisBereich />
      </main>

      <footer className="app__fuss">
        Grundgerüst v0.1 · noch ohne Agenten-Logik
      </footer>
    </div>
  )
}
