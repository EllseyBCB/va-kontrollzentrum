// Ein kleiner Markdown-Darsteller - gerade so viel, wie die Fachleute benutzen:
// Überschriften, Absätze, Listen, Tabellen, Trennlinien, **fett** und *kursiv*.
//
// Warum selbst gebaut statt einer Bibliothek:
// 1. Eine Abhängigkeit weniger.
// 2. Er erzeugt React-Elemente statt HTML-Text. Damit gibt es kein
//    dangerouslySetInnerHTML und keinen Weg, über die Modellantwort
//    fremdes HTML in die Seite zu bekommen.

// Wandelt **fett** und *kursiv* in echte Elemente um.
// Läuft über die Zeichenkette, statt HTML zusammenzubauen.
function auszeichnen(text, schluesselBasis) {
  const teile = []
  const muster = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let letzte = 0
  let treffer
  let n = 0

  while ((treffer = muster.exec(text)) !== null) {
    if (treffer.index > letzte) {
      teile.push(text.slice(letzte, treffer.index))
    }
    const stueck = treffer[0]
    const schluessel = `${schluesselBasis}-${n++}`

    if (stueck.startsWith('**')) {
      teile.push(<strong key={schluessel}>{stueck.slice(2, -2)}</strong>)
    } else if (stueck.startsWith('`')) {
      teile.push(<code key={schluessel}>{stueck.slice(1, -1)}</code>)
    } else {
      teile.push(<em key={schluessel}>{stueck.slice(1, -1)}</em>)
    }
    letzte = treffer.index + stueck.length
  }

  if (letzte < text.length) teile.push(text.slice(letzte))
  return teile
}

// Eine Tabellenzeile "| a | b |" in ihre Zellen zerlegen.
function zellen(zeile) {
  return zeile
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((z) => z.trim())
}

export default function Markdown({ text }) {
  if (!text) return null

  const zeilen = text.split('\n')
  const blocks = []
  let absatz = []
  let liste = null // { geordnet: boolean, punkte: string[] }

  const absatzSchliessen = () => {
    if (absatz.length) {
      const inhalt = absatz.join(' ')
      blocks.push(
        <p key={`p${blocks.length}`}>{auszeichnen(inhalt, `p${blocks.length}`)}</p>,
      )
      absatz = []
    }
  }

  const listeSchliessen = () => {
    if (liste) {
      const Tag = liste.geordnet ? 'ol' : 'ul'
      blocks.push(
        <Tag key={`l${blocks.length}`}>
          {liste.punkte.map((punkt, i) => (
            <li key={i}>{auszeichnen(punkt, `l${blocks.length}-${i}`)}</li>
          ))}
        </Tag>,
      )
      liste = null
    }
  }

  const allesSchliessen = () => {
    absatzSchliessen()
    listeSchliessen()
  }

  for (let i = 0; i < zeilen.length; i++) {
    const zeile = zeilen[i]
    const roh = zeile.trim()

    // Leerzeile beendet Absatz und Liste.
    if (!roh) {
      allesSchliessen()
      continue
    }

    // Trennlinie
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(roh)) {
      allesSchliessen()
      blocks.push(<hr key={`hr${blocks.length}`} />)
      continue
    }

    // Überschriften
    const ueberschrift = roh.match(/^(#{1,4})\s+(.*)$/)
    if (ueberschrift) {
      allesSchliessen()
      const stufe = ueberschrift[1].length
      const Tag = `h${Math.min(stufe + 1, 6)}` // ## wird zu h3, damit h2 der Seite gehört
      blocks.push(
        <Tag key={`h${blocks.length}`}>
          {auszeichnen(ueberschrift[2], `h${blocks.length}`)}
        </Tag>,
      )
      continue
    }

    // Tabelle: beginnt mit | und die nächste Zeile ist die Trennzeile |---|---|
    if (roh.startsWith('|') && /^\|[\s:|-]+\|$/.test((zeilen[i + 1] || '').trim())) {
      allesSchliessen()
      const kopf = zellen(roh)
      const koerper = []
      i += 2 // Kopf- und Trennzeile überspringen
      while (i < zeilen.length && zeilen[i].trim().startsWith('|')) {
        koerper.push(zellen(zeilen[i]))
        i++
      }
      i-- // die Schleife zählt gleich wieder hoch

      blocks.push(
        <div className="tabellenhuelle" key={`t${blocks.length}`}>
          <table>
            <thead>
              <tr>
                {kopf.map((z, k) => (
                  <th key={k}>{auszeichnen(z, `th${blocks.length}-${k}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {koerper.map((reihe, r) => (
                <tr key={r}>
                  {reihe.map((z, k) => (
                    <td key={k}>{auszeichnen(z, `td${blocks.length}-${r}-${k}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    // Listenpunkte
    const ungeordnet = roh.match(/^[-*+]\s+(.*)$/)
    const geordnet = roh.match(/^\d+[.)]\s+(.*)$/)
    if (ungeordnet || geordnet) {
      absatzSchliessen()
      const punkt = (ungeordnet || geordnet)[1]
      const istGeordnet = Boolean(geordnet)

      if (liste && liste.geordnet !== istGeordnet) listeSchliessen()
      if (!liste) liste = { geordnet: istGeordnet, punkte: [] }
      liste.punkte.push(punkt)
      continue
    }

    // Alles andere ist Fließtext.
    listeSchliessen()
    absatz.push(roh)
  }

  allesSchliessen()
  return <div className="markdown">{blocks}</div>
}
