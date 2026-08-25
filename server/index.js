// Lokaler API-Server.
//
// Warum es ihn überhaupt gibt: Der Anthropic-API-Schlüssel darf NICHT im Browser
// stehen - jede Besucherin könnte ihn sonst auslesen. Deshalb läuft jeder
// Agentenaufruf später über diesen kleinen Server.
//
// Bewusst ohne Express o. Ä.: Node bringt alles Nötige mit, das spart eine
// Abhängigkeit und macht die Datei für jeden lesbar.

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

// .env einlesen (klein und ohne Zusatzpaket).
try {
  for (const zeile of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
    const treffer = zeile.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (treffer) process.env[treffer[1]] ??= treffer[2]
  }
} catch {
  // Keine .env vorhanden - für das Grundgerüst völlig in Ordnung.
}

const PORT = Number(process.env.PORT) || 8787

function sendeJson(antwort, status, daten) {
  antwort.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  antwort.end(JSON.stringify(daten))
}

const server = createServer((anfrage, antwort) => {
  const pfad = new URL(anfrage.url, `http://localhost:${PORT}`).pathname

  // Lebenszeichen - damit man sofort sieht, ob Frontend und Server sich finden.
  if (pfad === '/api/health') {
    return sendeJson(antwort, 200, {
      status: 'ok',
      schluesselHinterlegt: Boolean(process.env.ANTHROPIC_API_KEY),
    })
  }

  // Hier kommt später POST /api/agent hin:
  // nimmt { agentId, idee, bisherigeErgebnisse } entgegen, lädt den passenden
  // Prompt aus server/agenten/ und gibt die Antwort des Modells zurück.

  sendeJson(antwort, 404, { fehler: 'Unbekannter Endpunkt', pfad })
})

server.listen(PORT, () => {
  console.log(`API läuft auf http://localhost:${PORT}`)
})
