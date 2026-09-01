// Der Anthropic-Schlüssel der Besucherin - nur für die veröffentlichte Fassung.
//
// Lokal wird das hier nie gebraucht: Da hält der Node-Server den Schlüssel in
// der .env, und der Browser bekommt ihn nie zu sehen. Im Netz geht das nicht -
// ein Schlüssel im Worker wäre ein offener Hahn auf fremde Rechnung. Also
// bringt jede ihren eigenen mit.
//
// Wo er liegt, darf die Besucherin entscheiden:
//
//   sessionStorage  (Standard) - weg, sobald der Tab zu ist
//   localStorage    ("merken") - bleibt, bis sie ihn entfernt
//
// Der sichere Weg ist der Standard. Ein API-Schlüssel im localStorage überlebt
// das Schließen des Browsers, und jede Lücke, über die fremdes JavaScript auf
// diese Seite käme, käme damit auch an ihn. Wer das nicht will, tippt ihn eben
// pro Sitzung neu - und wer den Agenten wirklich arbeiten lassen will, ist mit
// der Fassung auf dem eigenen Rechner ohnehin besser bedient.
//
// Verlassen tut der Schlüssel den Browser nur in eine Richtung: als Kopfzeile
// an den eigenen Worker, der ihn unverändert an Anthropic weiterreicht.

const PLATZ = 'va-kontrollzentrum.schluessel.v1'

/** Beide Ablagen, in der Reihenfolge, in der gesucht wird. */
function ablagen() {
  try {
    return [sessionStorage, localStorage]
  } catch {
    return [] // Browser mit gesperrtem Speicher - dann eben nur im Arbeitsspeicher
  }
}

// Zusätzlich im Arbeitsspeicher, damit es auch dort funktioniert, wo der
// Browser jede Ablage verweigert (strenge Einstellungen, privates Fenster).
let gemerkt = null

let horcher = new Set()

function lies() {
  if (gemerkt !== null) return gemerkt
  for (const ablage of ablagen()) {
    const wert = ablage.getItem(PLATZ)
    if (wert) return (gemerkt = wert)
  }
  return ''
}

/**
 * Schlüssel setzen oder entfernen.
 *
 * @param {string} wert    leer = entfernen
 * @param {boolean} dauerhaft  true = localStorage statt sessionStorage
 */
export function setzeSchluessel(wert, dauerhaft = false) {
  const sauber = (wert || '').trim()
  gemerkt = sauber

  for (const ablage of ablagen()) {
    try {
      ablage.removeItem(PLATZ)
    } catch {
      // Nicht schlimm - dann stand dort auch nichts.
    }
  }
  if (sauber) {
    try {
      const ziel = dauerhaft ? localStorage : sessionStorage
      ziel.setItem(PLATZ, sauber)
    } catch {
      // Bleibt im Arbeitsspeicher. Nach dem Neuladen ist er weg, mehr nicht.
    }
  }
  for (const rufen of horcher) rufen()
}

/** Der aktuelle Schlüssel - '' wenn keiner da ist. */
export function holeSchluessel() {
  return lies()
}

/** Für useSyncExternalStore: sagt Bescheid, wenn sich der Schlüssel ändert. */
export function beobachte(rufen) {
  horcher.add(rufen)
  return () => horcher.delete(rufen)
}

/**
 * Sieht das nach einem Anthropic-Schlüssel aus?
 *
 * Nur eine Formprüfung, damit ein Tippfehler nicht als "Schlüssel abgelehnt"
 * zurückkommt. Ob er gilt, weiß am Ende nur Anthropic.
 */
export function siehtEchtAus(wert) {
  return /^sk-ant-[A-Za-z0-9_-]{20,}$/.test((wert || '').trim())
}
