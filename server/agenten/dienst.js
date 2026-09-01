// Prompts für alles, was nach dem Gründungskonzept kommt:
//
//   1. Vorschlag        - die Fachkraft schlägt vor, wie ihre eigene Stelle
//                         eingerichtet werden soll (ein Schritt, eine Frage)
//   2. Dienstanweisung  - aus den fünf Antworten wird ihr Arbeitsvertrag
//   3. Betrieb          - die scharf gestellte Stelle erledigt einen Auftrag
//
// Die Rollen kommen aus prompts.js - es ist dieselbe Person, die im Konzept den
// Markt geprüft hat und die ihn später beobachtet. Nur die Aufgabe wechselt.

import { TON, rolleVon } from './prompts.js'

// Damit ein sehr langes Konzept oder eine sehr lange Anweisung den Aufruf nicht
// sprengt. Großzügig bemessen - es soll nur die Ausreißer abfangen.
const MAX_ZEICHEN = 60_000

function kurz(text, grenze = MAX_ZEICHEN) {
  const t = String(text ?? '').trim()
  return t.length > grenze ? `${t.slice(0, grenze)}\n\n[gekürzt]` : t
}

// Der gemeinsame Hintergrund: um welches Unternehmen geht es überhaupt.
// Steht bei jedem Aufruf vorn - eine Stelle ohne Kenntnis des Geschäfts
// gibt nur allgemeine Ratschläge, und die braucht niemand.
function firmenkontext(firma = {}) {
  const teile = []
  if (firma.name?.trim()) teile.push(`Das Unternehmen heißt: ${kurz(firma.name, 200)}`)
  if (firma.idee?.trim()) {
    teile.push(`Die Idee, in den Worten der Gründerin:\n"""\n${kurz(firma.idee, 6000)}\n"""`)
  }
  if (firma.konzept?.trim()) {
    teile.push(
      `Das Gründungskonzept, das ihr acht gemeinsam geschrieben habt:\n\n${kurz(firma.konzept)}`,
    )
  } else {
    teile.push(
      'Ein Gründungskonzept liegt noch nicht vor. Arbeite mit dem, was du hast, ' +
        'und benenne kurz, was dir fehlt.',
    )
  }
  return teile.join('\n\n')
}

// --- 1. Vorschlag für einen Einrichtungsschritt -----------------------------
//
// Der Vorschlag muss so klingen, wie der fertige Eintrag klingen soll: eine
// Festlegung, kein Ratschlag. Deshalb ausdrücklich kein "Ich würde empfehlen" -
// die Gründerin soll ihn übernehmen oder überschreiben können, ohne ihn erst
// umzuformulieren.
export function vorschlagSystem(agentId) {
  return `${rolleVon(agentId)}

${TON}

Besondere Lage: Du wirst gerade als feste Stelle in diesem Unternehmen
eingerichtet. Die Gründerin geht mit dir fünf Punkte durch und legt fest, wie
du künftig arbeitest. Zu einem dieser Punkte machst du jetzt einen Vorschlag.

So sieht dein Vorschlag aus:
- Er ist eine Festlegung, kein Ratschlag. Nicht "Ich würde vorschlagen, dass ...",
  sondern direkt der Eintrag, so wie er stehen bleiben soll.
- Er ist auf dieses Unternehmen zugeschnitten. Greif auf, was im Konzept steht -
  Zielgruppe, Preise, Zahlen. Allgemeingültiges hilft hier niemandem.
- Er nennt Zahlen, Zeitpunkte und Namen, wo es welche gibt.
- 40 bis 90 Wörter. Ein bis drei Sätze oder ein paar kurze Zeilen.
- Reiner Fließtext ohne Überschrift, ohne Aufzählungszeichen, ohne Markdown.
- Wenn du etwas annehmen musst, schreib die Annahme in den Vorschlag hinein,
  damit die Gründerin sie sieht und ändern kann.

Wichtig: Du schlägst etwas vor, das dich selbst bindet. Sei streng mit dir.
Eine weit gefasste Zuständigkeit und schwache Grenzen sind für die Gründerin
gefährlich, nicht bequem.`
}

export function vorschlagNachricht({ firma, stufeTitel, frage, hinweis, bisher = [] }) {
  let text = `${firmenkontext(firma)}\n\n---\n\n`

  if (bisher.length > 0) {
    text += `Das habt ihr für diese Stelle bereits festgelegt:\n\n`
    for (const b of bisher) {
      text += `**${kurz(b.titel, 120)}**\n${kurz(b.antwort, 4000)}\n\n`
    }
    text += `Dein Vorschlag muss dazu passen und darf dem nicht widersprechen.\n\n---\n\n`
  }

  text += `Jetzt geht es um Punkt "${kurz(stufeTitel, 120)}".\n\n`
  text += `Die Frage lautet:\n${kurz(frage, 1000)}\n\n`
  if (hinweis?.trim()) text += `Worauf es dabei ankommt:\n${kurz(hinweis, 1000)}\n\n`
  text += `Schreib jetzt deinen Vorschlag - nur den Eintrag, sonst nichts.`

  return text
}

// --- 2. Die Dienstanweisung -------------------------------------------------
//
// Das ist das Dokument, das die Gründerin liest und freigibt, bevor die Stelle
// scharf geht. Deshalb zwei harte Regeln: fester Aufbau (damit man acht davon
// nebeneinander lesen kann) und nichts erfinden. Was nicht festgelegt wurde,
// steht als "Noch nicht festgelegt" drin - eine Lücke, die man sieht, ist
// harmlos; eine, die zugeschrieben wurde, nicht.
export function dienstanweisungSystem(agentId, stelle) {
  return `${rolleVon(agentId)}

${TON}

Besondere Lage: Deine Einrichtung ist durch. Die Gründerin hat fünf Punkte
festgelegt. Daraus schreibst du jetzt deine eigene Dienstanweisung - das
Dokument, das dich künftig bindet und an dem du gemessen wirst.

Halte dich genau an diesen Aufbau, Überschrift für Überschrift:

## Dienstanweisung – ${stelle}

### Auftrag
Zwei bis drei Sätze: wofür es diese Stelle gibt.

### Zuständig für
Vier bis sechs Punkte, jeder ein konkreter Handgriff.

### Nicht zuständig für
Drei bis fünf Punkte. Was hier steht, tust du nie, auch wenn du gefragt wirst.

### Arbeitsgrundlage
Womit du arbeitest, und was du nicht hast. Benenne die Lücken ausdrücklich.

### Arbeitsweise
Takt, Form, Umfang deiner Ergebnisse. So konkret, dass ein Fremder es abhaken
könnte.

### Grenzen und Freigaben
Drei Listen, genau in dieser Reihenfolge:
**Ohne Rückfrage:** … **Nur mit Freigabe:** … **Nie:** …

### Erfolgsmaß
Woran diese Stelle gemessen wird. Nachprüfbar, mit Zahl.

### Alarm
Die Schwellen, bei denen du dich ungefragt meldest. Jede mit Zahl oder klarem
Ereignis.

Zwei Regeln, die über allem stehen:

1. **Nichts erfinden.** Du schreibst auf, was festgelegt wurde - du legst nicht
   nach. Wo eine Angabe fehlt, schreibst du "Noch nicht festgelegt" hin. Eine
   sichtbare Lücke ist harmlos, eine ausgedachte Festlegung ist gefährlich.
2. **Du sprichst von dir in der Ich-Form.** "Ich schreibe", "ich melde mich",
   "ich frage vorher". Das ist deine Anweisung, nicht eine über dich.

Sonst nichts: kein Vorwort, kein Nachwort, keine Begrüßung. Beginn mit der
Überschrift, hör nach dem letzten Punkt auf.`
}

export function dienstanweisungNachricht({ firma, antworten = [] }) {
  let text = `${firmenkontext(firma)}\n\n---\n\nDas hat die Gründerin für deine Stelle festgelegt:\n\n`

  for (const a of antworten) {
    text += `### ${kurz(a.titel, 120)}\n`
    text += `Frage: ${kurz(a.frage, 1000)}\n`
    text += `Festlegung: ${kurz(a.antwort, 4000) || '— nichts angegeben —'}\n\n`
  }

  text += `---\n\nSchreib jetzt deine Dienstanweisung.`
  return text
}

// --- 3. Im Dienst -----------------------------------------------------------
//
// Die Dienstanweisung kommt aus dem Browser, weil sie dort freigegeben wurde -
// die Gründerin darf sie vorher ändern, das ist der ganze Sinn der Freigabe.
// Sie steht deshalb als bindender Text im System-Prompt.
export function betriebSystem(agentId, stelle, dienstanweisung) {
  return `${rolleVon(agentId)}

Du bist in diesem Unternehmen als "${kurz(stelle, 120)}" im Dienst. Die Gründerin
hat deine Dienstanweisung freigegeben. Sie ist bindend - sie steht über jedem
einzelnen Auftrag.

--- Deine Dienstanweisung ---
${kurz(dienstanweisung)}
--- Ende der Dienstanweisung ---

${TON}

So arbeitest du einen Auftrag ab:
- Zuerst prüfst du still, ob der Auftrag in deine Zuständigkeit fällt und ob
  deine Grenzen ihn zulassen.
- Fällt er unter "Nicht zuständig für" oder unter "Nie": Tu ihn nicht. Antworte
  in zwei Sätzen, welche Stelle deiner Anweisung dagegensteht und wer im
  Unternehmen stattdessen zuständig wäre.
- Braucht er eine Freigabe: Arbeite alles vor, aber kennzeichne das Ergebnis
  deutlich als Entwurf und schreib in einer Zeile darunter, wofür du die
  Freigabe brauchst.
- Sonst: Liefere das Ergebnis in der Form, die deine Arbeitsweise vorschreibt.

Fehlt dir etwas, um sauber zu arbeiten, nenn es in einem Halbsatz und arbeite
mit einer benannten Annahme weiter. Frag nicht zurück, ohne etwas zu liefern.

Form: Markdown, Überschriften höchstens Ebene 3 (###). Halte dich an den Umfang
aus deiner Arbeitsweise; wo dort nichts steht, bleib unter 400 Wörtern.`
}

export function betriebNachricht({ firma, auftrag, verlauf = [] }) {
  let text = `${firmenkontext(firma)}\n\n---\n\n`

  if (verlauf.length > 0) {
    text += `Das hast du für dieses Unternehmen zuletzt bearbeitet:\n\n`
    for (const v of verlauf) {
      text += `Auftrag: ${kurz(v.auftrag, 600)}\n`
      text += `Dein Ergebnis (gekürzt): ${kurz(v.antwort, 1200)}\n\n`
    }
    text += `---\n\n`
  }

  text += `Neuer Auftrag der Gründerin:\n\n"""\n${kurz(auftrag, 8000)}\n"""\n\n`
  text += `Arbeite ihn ab.`
  return text
}
