// Was bei jedem der vier Endpunkte gefragt wird - unabhängig davon, WO er läuft.
//
// Es gibt die App an zwei Orten:
//
//   lokal            server/index.js   - Node, Schlüssel aus der .env
//   veröffentlicht   worker/index.js   - Cloudflare, Schlüssel vom Besucher
//
// Beide brauchen exakt dieselben Prüfungen und exakt dieselben Prompts. Stünde
// das zweimal da, liefen die beiden Fassungen früher oder später auseinander -
// und der Fehler fiele erst auf, wenn jemand die veröffentlichte benutzt.
//
// Deshalb steht hier alles, was in beiden gleich ist, und zwar als reine
// Rechnung ohne Node, ohne fetch, ohne Umgebungsvariablen: rein die Daten aus
// dem Browser, heraus der fertige Auftrag ans Modell.

import { systemPrompt, nutzerNachricht, PROMPTS } from './prompts.js'
import {
  vorschlagSystem,
  vorschlagNachricht,
  dienstanweisungSystem,
  dienstanweisungNachricht,
  betriebSystem,
  betriebNachricht,
} from './dienst.js'
// Die Stammdaten der Positionen liegen im Frontend, weil sie dort angezeigt
// werden. Hier wird dieselbe Datei gelesen - eine reine Datendatei ohne React.
// So kann die Stellenbezeichnung in der Dienstanweisung nicht von der auf dem
// Bildschirm abweichen, und der Browser kann sie auch nicht fälschen.
import { AGENTEN } from '../../src/daten/agenten.js'

/** Stellenbezeichnung nachschlagen, für Dienstanweisung und Betrieb. */
function stelleVon(agentId) {
  return AGENTEN.find((a) => a.id === agentId)?.stelle ?? agentId
}

/** Ein abgelehnter Auftrag: Grund und passender HTTP-Status. */
function nein(status, fehler) {
  return { fehler, status }
}

// --- Die vier Endpunkte -----------------------------------------------------
//
// Jeder prüft, was nur er wissen kann, und liefert dann seinen Auftrag. Die
// Prüfung auf eine bekannte Fachkraft ist allen gemeinsam und steht weiter unten.

const BAUER = {
  // 1. Gründungskonzept: eine Fachkraft schreibt ihren Abschnitt.
  agent({ agentId, idee, bisherige = [] }) {
    if (typeof idee !== 'string' || idee.trim().length < 10) {
      return nein(400, 'Die Idee ist zu kurz.')
    }
    return {
      kennung: `konzept/${agentId}`,
      system: systemPrompt(agentId),
      nachricht: nutzerNachricht(idee, bisherige),
      maxTokens: 16000,
    }
  },

  // 2. Vorschlag für einen Einrichtungsschritt.
  //
  // Frage und Hinweis kommen aus dem Browser mit. Das ist Absicht: Sie stehen
  // ohnehin auf dem Bildschirm, sie sind der sichtbare Teil der Einrichtung.
  // Geheim ist nur, wie die Fachkraft daraus denkt - und das steht in dienst.js.
  vorschlag({ agentId, firma = {}, stufeTitel = '', frage = '', hinweis = '', bisher = [] }) {
    if (typeof frage !== 'string' || frage.trim().length < 5) {
      return nein(400, 'Zu diesem Schritt fehlt die Frage.')
    }
    return {
      kennung: `vorschlag/${agentId}`,
      system: vorschlagSystem(agentId),
      nachricht: vorschlagNachricht({ firma, stufeTitel, frage, hinweis, bisher }),
      maxTokens: 1500, // ein Vorschlag ist kurz; die Grenze hält ihn kurz
    }
  },

  // 3. Aus den Festlegungen wird die Dienstanweisung.
  dienstanweisung({ agentId, firma = {}, antworten = [] }) {
    const beantwortet = antworten.filter((a) => a?.antwort?.trim()).length
    if (beantwortet === 0) {
      return nein(400, 'Für diese Stelle wurde noch nichts festgelegt.')
    }
    return {
      kennung: `dienstanweisung/${agentId}`,
      system: dienstanweisungSystem(agentId, stelleVon(agentId)),
      nachricht: dienstanweisungNachricht({ firma, antworten }),
      maxTokens: 4000,
    }
  },

  // 4. Im Dienst: die scharf gestellte Stelle erledigt einen Auftrag.
  //
  // Die Dienstanweisung wird mitgeschickt, weil sie im Browser freigegeben und
  // dort auch bearbeitet wurde - gebunden werden soll genau der Text, den die
  // Gründerin gelesen hat.
  auftrag({ agentId, firma = {}, dienstanweisung = '', auftrag = '', verlauf = [] }) {
    if (typeof dienstanweisung !== 'string' || dienstanweisung.trim().length < 50) {
      return nein(400, 'Diese Stelle hat keine Dienstanweisung - sie darf noch nicht arbeiten.')
    }
    if (typeof auftrag !== 'string' || auftrag.trim().length < 5) {
      return nein(400, 'Der Auftrag ist zu kurz.')
    }
    return {
      kennung: `auftrag/${agentId}`,
      system: betriebSystem(agentId, stelleVon(agentId), dienstanweisung),
      nachricht: betriebNachricht({ firma, auftrag, verlauf }),
      maxTokens: 8000,
    }
  },
}

/** Die Wege, die es gibt - für den Verteiler in beiden Fassungen. */
export const WEGE = Object.keys(BAUER)

/**
 * Aus dem, was der Browser schickt, den Auftrag ans Modell bauen.
 *
 * @param {string} weg    "agent" | "vorschlag" | "dienstanweisung" | "auftrag"
 * @param {object} daten  der Rumpf der Anfrage
 * @returns {{kennung, system, nachricht, maxTokens} | {fehler, status}}
 *          Im Fehlerfall steht `fehler` drin - dann wurde nichts gebaut.
 */
export function baueAnfrage(weg, daten = {}) {
  const bauen = BAUER[weg]
  if (!bauen) return nein(404, `Unbekannter Endpunkt: ${weg}`)

  if (!PROMPTS[daten.agentId]) {
    return nein(400, `Unbekannte Fachkraft: ${daten.agentId}`)
  }
  return bauen(daten)
}
