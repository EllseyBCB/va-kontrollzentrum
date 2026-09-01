// Lokaler API-Server - die Fassung für den eigenen Rechner.
//
// Warum es ihn überhaupt gibt: Der Anthropic-API-Schlüssel darf NICHT im Browser
// stehen - jede Besucherin könnte ihn sonst auslesen. Deshalb läuft jeder
// Aufruf einer Fachkraft über diesen kleinen Server, und der Schlüssel bleibt
// hier in der .env.
//
// Bewusst ohne Express o. Ä.: Node bringt alles Nötige mit, das spart eine
// Abhängigkeit und macht die Datei für jeden lesbar.
//
// WAS gefragt wird, steht nicht hier, sondern in agenten/anfragen.js - dieselbe
// Datei benutzt der Cloudflare-Worker (worker/index.js). Hier steht nur, WIE es
// unter Node läuft: zuhören, streamen, Fehler übersetzen.
//
// Vier Endpunkte, alle vier streamen ihre Antwort:
//   POST /api/agent            eine Fachkraft schreibt ihren Konzeptabschnitt
//   POST /api/vorschlag        sie schlägt vor, wie ihre Stelle eingerichtet wird
//   POST /api/dienstanweisung  aus den Festlegungen wird ihre Dienstanweisung
//   POST /api/auftrag          die scharf gestellte Stelle erledigt einen Auftrag
//   GET  /api/health           Lebenszeichen

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import Anthropic from '@anthropic-ai/sdk'
import { baueAnfrage, WEGE } from './agenten/anfragen.js'

// .env einlesen (klein und ohne Zusatzpaket).
try {
  for (const zeile of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
    const treffer = zeile.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (treffer) process.env[treffer[1]] ??= treffer[2].trim()
  }
} catch {
  // Keine .env vorhanden - dann muss der Schlüssel aus der Umgebung kommen.
}

const PORT = Number(process.env.PORT) || 8787

// Das Modell steht in der .env, damit es sich ohne Codeänderung wechseln lässt.
const MODELL = process.env.MODELL || 'claude-opus-5'

// Wird erst beim ersten Aufruf gebaut - so startet der Server auch ohne Schlüssel
// und die Oberfläche kann sauber melden, dass noch einer fehlt.
let anthropic = null
function klient() {
  if (!anthropic) anthropic = new Anthropic()
  return anthropic
}

function sendeJson(antwort, status, daten) {
  antwort.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  antwort.end(JSON.stringify(daten))
}

// Liest den Rumpf einer Anfrage als JSON. Bricht ab, wenn er unsinnig groß wird.
// Großzügig bemessen, weil Konzept und Dienstanweisung mitgeschickt werden.
function leseJson(anfrage, maxBytes = 2_000_000) {
  return new Promise((fertig, fehler) => {
    let roh = ''
    anfrage.on('data', (stueck) => {
      roh += stueck
      if (roh.length > maxBytes) {
        fehler(new Error('Anfrage zu groß'))
        anfrage.destroy()
      }
    })
    anfrage.on('end', () => {
      try {
        fertig(roh ? JSON.parse(roh) : {})
      } catch {
        fehler(new Error('Ungültiges JSON'))
      }
    })
    anfrage.on('error', fehler)
  })
}

// --- Der gemeinsame Weg zum Modell ------------------------------------------
//
// Die Antwort geht als Server-Sent-Events zurück, Stück für Stück. Dadurch
// sieht man beim Arbeiten zu, statt auf eine leere Seite zu starren.
//
// Ereignisse, die gesendet werden:
//   {art:'start'}                 - Verbindung steht, das Modell denkt
//   {art:'text', stueck:'...'}    - ein weiteres Stück Text
//   {art:'fertig', text:'...'}    - alles zusammen, zur Sicherheit
//   {art:'fehler', text:'...'}    - etwas ist schiefgegangen
async function streame(anfrage, antwort, { kennung, system, nachricht, maxTokens }) {
  antwort.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  const sende = (nutzlast) => {
    antwort.write(`data: ${JSON.stringify(nutzlast)}\n\n`)
  }

  sende({ art: 'start' })

  // Bricht die Gründerin ab oder schließt den Tab, hört auch das Modell auf.
  const abbruch = new AbortController()
  anfrage.on('close', () => abbruch.abort())

  try {
    const strom = klient().messages.stream(
      {
        model: MODELL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: nachricht }],
      },
      { signal: abbruch.signal },
    )

    let gesammelt = ''
    strom.on('text', (stueck) => {
      gesammelt += stueck
      sende({ art: 'text', stueck })
    })

    const nachrichtZurueck = await strom.finalMessage()

    // Claude kann eine Anfrage ablehnen. Das ist keine Ausnahme, sondern
    // ein regulärer Abschlussgrund - also hier prüfen, nicht im catch.
    if (nachrichtZurueck.stop_reason === 'refusal') {
      sende({
        art: 'fehler',
        text: 'Die Anfrage wurde abgelehnt. Formuliere sie bitte anders.',
      })
    } else {
      sende({ art: 'fertig', text: gesammelt })
    }
  } catch (f) {
    // Abbruch durch die Gründerin ist kein Fehler, den man melden müsste.
    if (abbruch.signal.aborted) {
      antwort.end()
      return
    }
    console.error(`[${kennung}]`, f)

    let text = 'Unerwarteter Fehler beim Aufruf.'
    if (f instanceof Anthropic.AuthenticationError) {
      text = 'Der API-Schlüssel wird nicht akzeptiert. Prüf den Eintrag in .env.'
    } else if (f instanceof Anthropic.RateLimitError) {
      text = 'Zu viele Anfragen auf einmal. Warte einen Moment und versuch es noch einmal.'
    } else if (f instanceof Anthropic.APIError) {
      text = `Die API meldet einen Fehler (${f.status}): ${f.message}`
    } else if (f instanceof Error) {
      text = f.message
    }
    sende({ art: 'fehler', text })
  }

  antwort.end()
}

// --- Verteiler --------------------------------------------------------------

async function behandle(weg, anfrage, antwort) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return sendeJson(antwort, 503, {
      fehler: 'Kein API-Schlüssel hinterlegt. Trag ihn in die Datei .env ein.',
    })
  }

  let daten
  try {
    daten = await leseJson(anfrage)
  } catch (f) {
    return sendeJson(antwort, 400, { fehler: f.message })
  }

  const auftrag = baueAnfrage(weg, daten)
  if (auftrag.fehler) {
    return sendeJson(antwort, auftrag.status, { fehler: auftrag.fehler })
  }
  return streame(anfrage, antwort, auftrag)
}

const server = createServer(async (anfrage, antwort) => {
  const pfad = new URL(anfrage.url, `http://localhost:${PORT}`).pathname

  // Lebenszeichen - damit man sofort sieht, ob Oberfläche und Server sich finden
  // und ob ein Schlüssel hinterlegt ist. "schluesselNoetig" sagt der Oberfläche,
  // ob sie selbst nach einem fragen muss: lokal nie, beim Worker immer.
  if (pfad === '/api/health') {
    return sendeJson(antwort, 200, {
      status: 'ok',
      schluesselHinterlegt: Boolean(process.env.ANTHROPIC_API_KEY),
      schluesselNoetig: false,
      modell: MODELL,
    })
  }

  const weg = pfad.startsWith('/api/') ? pfad.slice(5) : null
  if (weg && WEGE.includes(weg) && anfrage.method === 'POST') {
    return behandle(weg, anfrage, antwort)
  }

  sendeJson(antwort, 404, { fehler: 'Unbekannter Endpunkt', pfad })
})

server.listen(PORT, () => {
  console.log(`API läuft auf http://localhost:${PORT}  (Modell: ${MODELL})`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('Hinweis: kein ANTHROPIC_API_KEY gefunden - die Fachleute können noch nicht arbeiten.')
  }
})
