// Cloudflare Worker - die API für die veröffentlichte Fassung.
//
// Die Oberfläche liegt auf GitHub Pages. Pages liefert nur Dateien aus und kann
// nichts ausführen, also hat sie bis jetzt tote Knöpfe gezeigt. Dieser Worker
// ist der fehlende Teil: dieselben Endpunkte wie server/index.js, nur eben
// im Netz statt auf dem eigenen Rechner. Welche das sind, sagt WEGE - kommt
// einer dazu, muss hier nichts geändert werden.
//
// Der entscheidende Unterschied steht gleich am Anfang:
//
//   Lokal  hält der Server den Schlüssel (aus der .env).
//   Hier   hält er KEINEN. Jede Besucherin bringt ihren eigenen mit.
//
// Das ist Absicht. Ein Schlüssel im Worker wäre ein offener Hahn: Wer die
// Adresse kennt, ließe Agenten auf fremde Rechnung laufen. Der Worker reicht
// den mitgeschickten Schlüssel an Anthropic weiter, schreibt ihn nirgends hin
// und behält ihn nicht - er sieht ihn nur für die Dauer der Anfrage.
//
// Was WAS gefragt wird, steht in server/agenten/anfragen.js - dieselbe Datei
// wie beim lokalen Server. Hier steht nur, WIE es unter Cloudflare läuft.

import { baueAnfrage, WEGE } from '../server/agenten/anfragen.js'

// Die Anthropic-API. Die Version ist Pflicht und gehört in jeden Aufruf.
const API = 'https://api.anthropic.com/v1/messages'
const API_VERSION = '2023-06-01'

// Der Schlüssel der Besucherin reist in diesem Kopfzeilenfeld.
// Nicht "Authorization", damit unterwegs niemand auf die Idee kommt, ihn wie
// ein normales Sitzungstoken zu behandeln oder mitzuloggen.
const SCHLUESSEL_FELD = 'X-Anthropic-Key'

// Wer den Worker aufrufen darf. Alles andere bekommt keine CORS-Freigabe und
// wird vom Browser abgewiesen.
//
// Das schützt nicht den Schlüssel (den bringt die Besucherin ja selbst mit),
// sondern verhindert, dass eine fremde Seite diesen Worker als bequemen
// Anthropic-Umschlagplatz benutzt und der irgendwann als Missbrauch auffällt.
// Über die Variable ERLAUBTE_URSPRUENGE lässt sich die Liste erweitern, ohne
// den Code anzufassen (z. B. für eine eigene Domain).
const URSPRUENGE_STANDARD = [
  'https://ellseybcb.github.io',
  'http://localhost:5180',
  'http://localhost:5181',
]

function erlaubteUrspruenge(env) {
  const zusatz = (env.ERLAUBTE_URSPRUENGE || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
  return [...URSPRUENGE_STANDARD, ...zusatz]
}

// CORS-Kopfzeilen für genau diesen Ursprung. Kein "*": Mit einem Sternchen
// dürfte der Browser den Schlüssel-Kopf gar nicht erst mitschicken.
function corsKopf(anfrage, env) {
  const ursprung = anfrage.headers.get('Origin')
  if (!ursprung || !erlaubteUrspruenge(env).includes(ursprung)) return null
  return {
    'Access-Control-Allow-Origin': ursprung,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': `Content-Type, ${SCHLUESSEL_FELD}`,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(status, daten, cors) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(cors || {}),
    },
  })
}

// --- Der Strom zurück in den Browser ----------------------------------------
//
// Nach außen sieht es genauso aus wie beim lokalen Server, damit src/dienste/api.js
// nichts von den zwei Fassungen wissen muss:
//   {art:'start'} {art:'text', stueck} {art:'fertig', text} {art:'fehler', text}
//
// Nach innen wird der Strom von Anthropic übersetzt: deren Ereignisse sind
// feiner (message_start, content_block_delta, ...), davon interessiert uns nur
// der Text und der Abschlussgrund.
function streame({ schluessel, modell, system, nachricht, maxTokens, signal }) {
  const { readable, writable } = new TransformStream()
  const schreiber = writable.getWriter()
  const koder = new TextEncoder()

  const sende = (nutzlast) => schreiber.write(koder.encode(`data: ${JSON.stringify(nutzlast)}\n\n`))

  // Läuft weiter, während die Antwort schon zurückgeht - genau darum geht es
  // beim Streamen. Deshalb hier bewusst kein await.
  ;(async () => {
    try {
      await sende({ art: 'start' })

      const antwort = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': API_VERSION,
          'x-api-key': schluessel,
        },
        body: JSON.stringify({
          model: modell,
          max_tokens: maxTokens,
          stream: true,
          system,
          messages: [{ role: 'user', content: nachricht }],
        }),
        // Schließt die Besucherin den Tab, hört auch das Modell auf zu schreiben.
        signal,
      })

      if (!antwort.ok) {
        await sende({ art: 'fehler', text: await fehlertext(antwort) })
        return
      }

      const leser = antwort.body.getReader()
      const dekoder = new TextDecoder()
      let puffer = ''
      let gesammelt = ''
      let abschlussgrund = null

      while (true) {
        const { done, value } = await leser.read()
        if (done) break
        puffer += dekoder.decode(value, { stream: true })

        // Ereignisse sind durch eine Leerzeile getrennt. Das letzte Stück im
        // Puffer kann unvollständig sein - das bleibt bis zum nächsten Mal liegen.
        const teile = puffer.split('\n\n')
        puffer = teile.pop() ?? ''

        for (const teil of teile) {
          const datenzeile = teil.split('\n').find((z) => z.startsWith('data:'))
          if (!datenzeile) continue

          let ereignis
          try {
            ereignis = JSON.parse(datenzeile.slice(5).trim())
          } catch {
            continue // kaputtes Ereignis überspringen statt alles abzubrechen
          }

          if (ereignis.type === 'content_block_delta' && ereignis.delta?.type === 'text_delta') {
            gesammelt += ereignis.delta.text
            await sende({ art: 'text', stueck: ereignis.delta.text })
          } else if (ereignis.type === 'message_delta' && ereignis.delta?.stop_reason) {
            abschlussgrund = ereignis.delta.stop_reason
          } else if (ereignis.type === 'error') {
            await sende({
              art: 'fehler',
              text: ereignis.error?.message || 'Die API meldet einen Fehler.',
            })
            return
          }
        }
      }

      // Claude kann eine Anfrage ablehnen. Das ist kein Fehler im Ablauf,
      // sondern ein regulärer Abschlussgrund - also hier prüfen.
      if (abschlussgrund === 'refusal') {
        await sende({ art: 'fehler', text: 'Die Anfrage wurde abgelehnt. Formuliere sie bitte anders.' })
      } else {
        await sende({ art: 'fertig', text: gesammelt })
      }
    } catch (f) {
      // Abbruch durch die Besucherin ist kein Fehler, den man melden müsste.
      if (signal?.aborted) return
      // Bewusst ohne console.error: In den Protokollen von Cloudflare hätte ein
      // Fehlerobjekt mit der ursprünglichen Anfrage nichts zu suchen.
      await sende({ art: 'fehler', text: f?.message || 'Unerwarteter Fehler beim Aufruf.' }).catch(
        () => {},
      )
    } finally {
      await schreiber.close().catch(() => {})
    }
  })()

  return readable
}

/** Aus einer abgelehnten Antwort von Anthropic einen brauchbaren Satz machen. */
async function fehlertext(antwort) {
  let meldung = ''
  try {
    const d = await antwort.json()
    meldung = d?.error?.message || ''
  } catch {
    // Dann bleibt es beim Status.
  }
  if (antwort.status === 401) {
    return 'Der Schlüssel wird nicht akzeptiert. Prüf ihn in der Console von Anthropic.'
  }
  if (antwort.status === 429) {
    return 'Zu viele Anfragen auf einmal. Warte einen Moment und versuch es noch einmal.'
  }
  if (antwort.status === 400 && meldung.includes('credit balance')) {
    return 'Auf diesem Schlüssel ist kein Guthaben mehr. Nachladen unter console.anthropic.com.'
  }
  return `Die API meldet einen Fehler (${antwort.status})${meldung ? ': ' + meldung : '.'}`
}

// --- Einstieg ---------------------------------------------------------------

export default {
  async fetch(anfrage, env) {
    const pfad = new URL(anfrage.url).pathname
    const cors = corsKopf(anfrage, env)
    const modell = env.MODELL || 'claude-opus-5'

    // Vorflug-Anfrage des Browsers, bevor er den Schlüssel-Kopf mitschicken darf.
    if (anfrage.method === 'OPTIONS') {
      return cors
        ? new Response(null, { status: 204, headers: cors })
        : new Response(null, { status: 403 })
    }

    if (!cors && anfrage.headers.get('Origin')) {
      return json(403, { fehler: 'Dieser Ursprung ist nicht freigegeben.' }, null)
    }

    // Lebenszeichen. "schluesselNoetig" ist der Unterschied zum lokalen Server:
    // Er sagt der Oberfläche, dass sie selbst nach einem Schlüssel fragen muss.
    if (pfad === '/api/health') {
      return json(200, { status: 'ok', schluesselNoetig: true, modell }, cors)
    }

    const weg = pfad.startsWith('/api/') ? pfad.slice(5) : null
    if (!weg || !WEGE.includes(weg)) {
      return json(404, { fehler: 'Unbekannter Endpunkt', pfad }, cors)
    }
    if (anfrage.method !== 'POST') {
      return json(405, { fehler: 'Nur POST.' }, cors)
    }

    const schluessel = anfrage.headers.get(SCHLUESSEL_FELD)
    if (!schluessel) {
      return json(
        401,
        {
          fehler:
            'Für die veröffentlichte Fassung brauchst du einen eigenen Anthropic-Schlüssel. Trag ihn oben ein - er bleibt in deinem Browser.',
        },
        cors,
      )
    }

    let daten
    try {
      daten = await anfrage.json()
    } catch {
      return json(400, { fehler: 'Ungültiges JSON' }, cors)
    }

    const auftrag = baueAnfrage(weg, daten)
    if (auftrag.fehler) {
      return json(auftrag.status, { fehler: auftrag.fehler }, cors)
    }

    return new Response(
      streame({ ...auftrag, schluessel, modell, signal: anfrage.signal }),
      {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-store',
          ...(cors || {}),
        },
      },
    )
  },
}
