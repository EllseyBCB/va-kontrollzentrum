// Ablaufsteuerung des Durchlaufs - noch nicht gebaut, aber der Platz steht.
//
// Geplante Aufgabe: Sie hält die Idee, den Status jedes der 8 Agenten und deren
// Ergebnisse. Sie ruft die Agenten NACHEINANDER auf und gibt jedem das Ergebnis
// der Vorgänger mit - genau das macht aus 8 Einzelantworten ein zusammenhängendes
// Konzept.
//
// Bewusst als eigener Haken (Hook) und nicht in App.jsx: Die Oberfläche soll nur
// anzeigen, die Reihenfolge-Logik liegt an einer einzigen, testbaren Stelle.

import { AGENTEN, STATUS } from '../daten/agenten.js'

export function useDurchlauf() {
  // Platzhalter, damit die Struktur schon sichtbar ist.
  const agenten = AGENTEN.map((agent) => ({
    ...agent,
    status: STATUS.WARTET,
    ergebnis: null,
  }))

  return {
    agenten,
    läuft: false,
    starten: () => {
      throw new Error('Noch nicht gebaut - kommt im nächsten Schritt.')
    },
  }
}
