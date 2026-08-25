// Einziger Draht vom Browser zum Server.
//
// Alle Aufrufe gehen über "/api/..." und werden von Vite an den Node-Server
// weitergereicht (siehe vite.config.js). Der Browser kennt den API-Schlüssel nie.
//
// Wenn später der Anbieter oder die Endpunkte wechseln, ändert sich nur diese Datei.

const BASIS = '/api'

// Kleiner Verbindungstest - schon jetzt nutzbar.
export async function pruefeVerbindung() {
  const antwort = await fetch(`${BASIS}/health`)
  if (!antwort.ok) throw new Error(`Server antwortet mit ${antwort.status}`)
  return antwort.json()
}

// Lässt einen einzelnen Agenten arbeiten. Noch nicht implementiert.
export async function fuehreAgentAus(/* { agentId, idee, bisherigeErgebnisse } */) {
  throw new Error('Noch nicht gebaut - kommt im nächsten Schritt.')
}
