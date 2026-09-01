// Alles, was den Browser dazu bringt, eine Datei herauszugeben oder einzulesen.
//
// An einer Stelle gebündelt, weil das Erzeugen eines Downloads im Browser
// umständlicher ist, als es sein müsste - und weil es sonst in vier Komponenten
// viermal fast gleich dastünde.

// Kern des Ganzen: Text in eine Datei verwandeln und den Download auslösen.
function herunterladen(dateiname, inhalt, typ = 'text/markdown;charset=utf-8') {
  const brocken = new Blob([inhalt], { type: typ })
  const adresse = URL.createObjectURL(brocken)
  const link = document.createElement('a')
  link.href = adresse
  link.download = dateiname
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(adresse)
}

// Für Dateinamen: Umlaute und Sonderzeichen raus, sonst streiten sich Windows
// und Mac darüber, wie der Name geschrieben wird.
export function alsDateiname(text) {
  return (
    String(text)
      .toLowerCase()
      .replaceAll('ä', 'ae')
      .replaceAll('ö', 'oe')
      .replaceAll('ü', 'ue')
      .replaceAll('ß', 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'ohne-namen'
  )
}

function heute() {
  return new Date().toISOString().slice(0, 10)
}

// --- Das Gründungskonzept ---------------------------------------------------

export function konzeptSpeichern(idee, konzept) {
  const inhalt = [
    '# Konzept für dein Business als Virtuelle Assistenz',
    '',
    `Erstellt am ${new Date().toLocaleDateString('de-DE')}`,
    '',
    '## Deine Idee',
    '',
    idee.trim(),
    '',
    konzept,
    '',
  ].join('\n')
  herunterladen('va-konzept.md', inhalt)
}

// --- Die Dienstanweisung einer Stelle ---------------------------------------

export function dienstanweisungSpeichern(agent, dienstanweisung) {
  herunterladen(`dienstanweisung-${agent.id}.md`, `${dienstanweisung.trim()}\n`)
}

/**
 * Dieselbe Dienstanweisung, aber als Agentendatei für Claude Code.
 *
 * Das ist die Brücke nach draußen: Eine Datei mit diesem Kopf, abgelegt unter
 * `.claude/agents/`, ist dort ein echter Unteragent - dieselbe Stelle, die hier
 * eingerichtet wurde, arbeitet dann im Terminal mit. Deshalb muss der Name
 * kleingeschrieben und ohne Umlaute sein, das verlangt das Format.
 */
export function alsClaudeAgent(agent, dienstanweisung, firmenname) {
  const beschreibung = `${agent.stelle} für ${firmenname?.trim() || 'das Unternehmen'}. ${agent.dauerauftrag}`
    .replace(/\s+/g, ' ')
    .trim()

  const inhalt = [
    '---',
    `name: ${alsDateiname(agent.name)}`,
    `description: ${beschreibung}`,
    '---',
    '',
    dienstanweisung.trim(),
    '',
  ].join('\n')

  herunterladen(`${alsDateiname(agent.name)}.md`, inhalt)
}

// Alle freigegebenen Anweisungen in einem Dokument - zum Ausdrucken oder
// Weitergeben. Ein Organigramm zum Mitnehmen.
export function alleAnweisungenSpeichern(firma, agenten) {
  const teile = [
    `# Dienstanweisungen${firma.name?.trim() ? ` – ${firma.name.trim()}` : ''}`,
    '',
    `Stand ${new Date().toLocaleDateString('de-DE')}`,
    '',
  ]

  for (const agent of agenten) {
    const pos = firma.positionen[agent.id]
    if (!pos?.dienstanweisung.trim()) continue
    teile.push(
      '---',
      '',
      `*${agent.ziffer} · ${agent.stelle} · ${pos.scharf ? 'im Dienst' : 'nicht scharf gestellt'}*`,
      '',
      pos.dienstanweisung.trim(),
      '',
    )
  }

  herunterladen(`dienstanweisungen-${heute()}.md`, teile.join('\n'))
}

// --- Die ganze Firmenakte ---------------------------------------------------
//
// Der Weg auf einen anderen Rechner. Der Browserspeicher hängt an diesem einen
// Browser; diese Datei nicht.

export function akteSpeichern(firma) {
  herunterladen(
    `firmenakte-${alsDateiname(firma.name || 'va')}-${heute()}.json`,
    JSON.stringify(firma, null, 2),
    'application/json;charset=utf-8',
  )
}

// Öffnet den Dateiauswahldialog und gibt den gelesenen Inhalt zurück.
// Ohne <input type="file"> im Markup - das ist ein Knopf, kein Formularfeld.
export function akteWaehlen() {
  return new Promise((fertig, fehler) => {
    const feld = document.createElement('input')
    feld.type = 'file'
    feld.accept = 'application/json,.json'
    feld.onchange = () => {
      const datei = feld.files?.[0]
      if (!datei) return fertig(null)
      datei
        .text()
        .then((roh) => {
          try {
            fertig(JSON.parse(roh))
          } catch {
            fehler(new Error('Die Datei ist keine gültige Firmenakte.'))
          }
        })
        .catch(() => fehler(new Error('Die Datei ließ sich nicht lesen.')))
    }
    feld.click()
  })
}
