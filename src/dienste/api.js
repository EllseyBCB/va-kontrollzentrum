// Einziger Draht vom Browser zur API.
//
// Es gibt sie an zwei Orten, und diese Datei ist die einzige, die das merkt:
//
//   lokal            "/api/..."  - Vite reicht an den Node-Server weiter
//                                  (siehe vite.config.js). Der Schlüssel liegt
//                                  dort in der .env, der Browser sieht ihn nie.
//   veröffentlicht   VITE_API_BASIS zeigt auf den Cloudflare-Worker. Der hält
//                                  keinen Schlüssel - deshalb geht der der
//                                  Besucherin bei jedem Aufruf mit.
//
// Wenn später der Anbieter oder die Endpunkte wechseln, ändert sich nur hier etwas.

import { holeSchluessel } from './schluessel.js'

// Wird beim Bauen eingesetzt (siehe .github/workflows/deploy.yml). Fehlt die
// Variable, bleibt es beim lokalen Weg über den Vite-Proxy.
const BASIS = (import.meta.env.VITE_API_BASIS || '/api').replace(/\/+$/, '')

// Der Schlüssel der Besucherin reist in diesem Feld - passend zum Worker.
const SCHLUESSEL_FELD = 'X-Anthropic-Key'

// Kopfzeilen für einen Aufruf. Ohne eigenen Schlüssel bleibt das Feld weg;
// lokal ist das der Normalfall.
function koepfe(weitere = {}) {
  const schluessel = holeSchluessel()
  return {
    ...weitere,
    ...(schluessel ? { [SCHLUESSEL_FELD]: schluessel } : {}),
  }
}

// Kleiner Verbindungstest. Sagt auch, ob überhaupt ein Schlüssel hinterlegt ist
// und ob die Oberfläche selbst nach einem fragen muss (Worker: ja, lokal: nein).
export async function pruefeVerbindung() {
  const antwort = await fetch(`${BASIS}/health`)
  if (!antwort.ok) throw new Error(`Server antwortet mit ${antwort.status}`)
  return antwort.json()
}

/**
 * Der gemeinsame Weg für alle vier Endpunkte: hinschicken, stückweise zurücklesen.
 *
 * Der Server schickt Server-Sent-Events. Wir lesen sie hier von Hand aus dem
 * Datenstrom, statt EventSource zu benutzen - EventSource kann nämlich nur GET,
 * und wir müssen Idee, Konzept und Festlegungen per POST mitschicken.
 *
 * @param {string} weg    Endpunkt ohne "/api", z. B. "agent"
 * @param {object} daten  wird als JSON gesendet
 * @param {(stueck: string) => void} [beiText]  wird bei jedem Textstück gerufen
 * @param {AbortSignal} [signal] zum Abbrechen
 * @returns {Promise<string>} der vollständige Text
 */
async function stroem(weg, daten, beiText, signal) {
  const antwort = await fetch(`${BASIS}/${weg}`, {
    method: 'POST',
    headers: koepfe({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(daten),
    signal,
  })

  // Fehler vor dem Streamen kommen als normales JSON zurück.
  if (!antwort.ok) {
    let meldung = `Server antwortet mit ${antwort.status}`
    try {
      const d = await antwort.json()
      if (d?.fehler) meldung = d.fehler
    } catch {
      // Dann bleibt es bei der Statusmeldung.
    }
    throw new Error(meldung)
  }

  const leser = antwort.body.getReader()
  const dekoder = new TextDecoder()
  let puffer = ''
  let vollstaendig = ''

  while (true) {
    const { done, value } = await leser.read()
    if (done) break

    puffer += dekoder.decode(value, { stream: true })

    // Ereignisse sind durch eine Leerzeile getrennt. Das letzte Stück im Puffer
    // kann unvollständig sein - das bleibt bis zum nächsten Durchlauf liegen.
    const teile = puffer.split('\n\n')
    puffer = teile.pop() ?? ''

    for (const teil of teile) {
      const zeile = teil.trim()
      if (!zeile.startsWith('data:')) continue

      let nutzlast
      try {
        nutzlast = JSON.parse(zeile.slice(5).trim())
      } catch {
        continue // kaputtes Ereignis überspringen statt alles abzubrechen
      }

      if (nutzlast.art === 'text') {
        vollstaendig += nutzlast.stueck
        beiText?.(nutzlast.stueck)
      } else if (nutzlast.art === 'fertig') {
        // Der Server schickt den Gesamttext noch einmal - der gilt.
        vollstaendig = nutzlast.text || vollstaendig
      } else if (nutzlast.art === 'fehler') {
        throw new Error(nutzlast.text)
      }
    }
  }

  if (!vollstaendig.trim()) {
    throw new Error('Die Antwort kam leer zurück.')
  }
  return vollstaendig
}

// --- 1. Gründungskonzept ----------------------------------------------------

/** Eine Fachkraft schreibt ihren Abschnitt des Gründungskonzepts. */
export function fuehreAgentAus({ agentId, idee, bisherige, beiText, signal }) {
  return stroem('agent', { agentId, idee, bisherige }, beiText, signal)
}

// --- 2. Einrichtung ---------------------------------------------------------

/**
 * Die Fachkraft schlägt vor, wie ihre eigene Stelle eingerichtet werden soll -
 * für genau einen der fünf Schritte.
 *
 * @param {object} p
 * @param {string} p.agentId
 * @param {object} p.firma        {name, idee, konzept}
 * @param {string} p.stufeTitel   Überschrift des Schritts
 * @param {string} p.frage        die Frage, die auf dem Bildschirm steht
 * @param {string} p.hinweis      worauf es dabei ankommt
 * @param {Array}  p.bisher       [{titel, antwort}] der schon festgelegten Schritte
 */
export function holeVorschlag({ agentId, firma, stufeTitel, frage, hinweis, bisher, beiText, signal }) {
  return stroem(
    'vorschlag',
    { agentId, firma, stufeTitel, frage, hinweis, bisher },
    beiText,
    signal,
  )
}

/**
 * Aus den fünf Festlegungen schreibt die Fachkraft ihre Dienstanweisung.
 *
 * @param {Array} p.antworten [{titel, frage, antwort}]
 */
export function schreibeDienstanweisung({ agentId, firma, antworten, beiText, signal }) {
  return stroem('dienstanweisung', { agentId, firma, antworten }, beiText, signal)
}

// --- 3. Betrieb -------------------------------------------------------------

/**
 * Eine scharf gestellte Stelle erledigt einen Auftrag.
 *
 * Die Dienstanweisung wird mitgeschickt, weil sie im Browser freigegeben und
 * dort auch bearbeitet wurde - der Server soll genau den Text binden, den die
 * Gründerin gelesen hat.
 *
 * @param {Array} p.verlauf [{auftrag, antwort}] die letzten Aufträge dieser Stelle
 */
export function gibAuftrag({ agentId, firma, dienstanweisung, auftrag, verlauf, beiText, signal }) {
  return stroem(
    'auftrag',
    { agentId, firma, dienstanweisung, auftrag, verlauf },
    beiText,
    signal,
  )
}
