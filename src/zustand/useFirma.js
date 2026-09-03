// Die Firmenakte: alles, was ein Unternehmen ausmacht, das über einen Besuch
// hinaus bestehen soll.
//
// Warum überhaupt gespeichert wird: Ein Konzept schreibt man einmal. Eine Stelle
// besetzt man einmal und arbeitet dann jahrelang mit ihr. Ohne Speicher wäre
// nach jedem Neuladen wieder alles unbesetzt - dann bräuchte man das alles nicht.
//
// Gespeichert wird im Browser (localStorage). Das hat zwei Folgen, die man
// kennen muss:
//   1. Die Akte hängt an DIESEM Browser auf DIESEM Rechner. Deshalb gibt es
//      Sichern und Einlesen als Datei - das ist der Weg auf einen anderen Rechner.
//   2. Es läuft auch auf GitHub Pages, wo kein Server steht. Einrichten lässt
//      sich dort also, arbeiten lassen sich die Agenten dort nicht.
//
// Was NICHT hier liegt: der laufende Konzept-Durchlauf. Der ist flüchtig und
// steht in useDurchlauf. Hier landet nur sein Ergebnis.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AGENTEN, DIENSTSTAND } from '../daten/agenten.js'
import { STUFEN_IDS } from '../daten/einrichtung.js'

// Die Fassung steht im Schlüssel. Ändert sich der Aufbau der Akte grundlegend,
// wird der Schlüssel hochgezählt statt alte Daten schiefzubiegen. Die
// Besprechungen kamen später dazu, ohne die Zahl zu erhöhen: Ein fehlendes
// Feld ergänzt inFormBringen, und eine Akte von gestern soll heute nicht
// verloren gehen, nur weil es einen Bereich mehr gibt.
const SCHLUESSEL = 'va-kontrollzentrum.firma.v1'

// Wie viele Besprechungen aufgehoben werden. Es sind Protokolle, keine Akten -
// die letzten zehn genügen, und der Browserspeicher ist klein.
const BESPRECHUNGEN_MAX = 10

// Wie viele fremde Meldungen eine Stelle bei ihrem Auftrag mitbekommt.
// Bewusst knapp: Es ist Umgebungswissen, nicht die Arbeitsgrundlage - und jeder
// Eintrag kostet bei jedem einzelnen Auftrag Geld.
const AUSHANG_MAX = 5

// Eine leere Stelle.
function leerePosition() {
  const antworten = {}
  for (const id of STUFEN_IDS) antworten[id] = ''
  return {
    antworten,
    dienstanweisung: '',
    scharf: false,
    scharfSeit: null,
    protokoll: [], // die erledigten Aufträge im Betrieb
  }
}

function leereAkte() {
  const positionen = {}
  for (const a of AGENTEN) positionen[a.id] = leerePosition()
  return {
    version: 1,
    name: '',
    idee: '',
    konzept: '',
    konzeptDatum: null,
    positionen,
    besprechungen: [], // die letzten Runden, neueste zuletzt
    // Ob das hier die Beispielakte ist. Wird gespeichert, weil man es sonst
    // nach dem Neuladen nicht mehr wüsste - und dann hielte jemand irgendwann
    // die erfundene "Assistenz Mayer" für seine eigene Firma.
    beispiel: false,
  }
}

// Bringt eine eingelesene Akte auf den erwarteten Aufbau. Wichtig, damit eine
// ältere oder von Hand bearbeitete Datei die Oberfläche nicht zum Absturz
// bringt: fehlende Felder werden ergänzt, unbekannte fallen weg.
function inFormBringen(roh) {
  const frisch = leereAkte()
  if (!roh || typeof roh !== 'object') return frisch

  frisch.name = typeof roh.name === 'string' ? roh.name : ''
  frisch.idee = typeof roh.idee === 'string' ? roh.idee : ''
  frisch.konzept = typeof roh.konzept === 'string' ? roh.konzept : ''
  frisch.konzeptDatum = typeof roh.konzeptDatum === 'string' ? roh.konzeptDatum : null
  frisch.beispiel = Boolean(roh.beispiel)

  for (const a of AGENTEN) {
    const alt = roh.positionen?.[a.id]
    if (!alt || typeof alt !== 'object') continue
    const neu = frisch.positionen[a.id]

    for (const id of STUFEN_IDS) {
      if (typeof alt.antworten?.[id] === 'string') neu.antworten[id] = alt.antworten[id]
    }
    if (typeof alt.dienstanweisung === 'string') neu.dienstanweisung = alt.dienstanweisung
    // Scharf ist nur gültig, wenn auch eine Dienstanweisung dasteht - sonst
    // wäre eine Stelle im Dienst, ohne zu wissen, was sie tun soll.
    neu.scharf = Boolean(alt.scharf) && Boolean(neu.dienstanweisung.trim())
    neu.scharfSeit = neu.scharf && typeof alt.scharfSeit === 'string' ? alt.scharfSeit : null
    if (Array.isArray(alt.protokoll)) {
      neu.protokoll = alt.protokoll
        .filter((e) => e && typeof e.auftrag === 'string' && typeof e.antwort === 'string')
        .slice(-20) // die letzten zwanzig genügen
        .map((e) => ({
          auftrag: e.auftrag,
          antwort: e.antwort,
          datum: typeof e.datum === 'string' ? e.datum : null,
        }))
    }
  }

  // Besprechungen. Eine Runde ohne Beiträge ist keine - die fällt weg.
  if (Array.isArray(roh.besprechungen)) {
    frisch.besprechungen = roh.besprechungen
      .filter((b) => b && typeof b.thema === 'string' && Array.isArray(b.beitraege))
      .map((b) => ({
        thema: b.thema,
        datum: typeof b.datum === 'string' ? b.datum : null,
        tisch: Array.isArray(b.tisch) ? b.tisch.filter((id) => frisch.positionen[id]) : [],
        beitraege: b.beitraege
          .filter((e) => e && frisch.positionen[e.agentId] && typeof e.text === 'string')
          .map((e) => ({ agentId: e.agentId, text: e.text, vorsitz: Boolean(e.vorsitz) })),
      }))
      .filter((b) => b.beitraege.length > 0)
      .slice(-BESPRECHUNGEN_MAX)
  }

  return frisch
}

// Aus einer Besprechung den Beschluss herausziehen - für den Aushang und für
// die Übersicht. Er steht im Beitrag der Stelle, die den Vorsitz hatte, unter
// der Überschrift "### Beschluss".
//
// Zwei Fälle, die auseinandergehalten werden müssen:
//   Kein Vorsitz-Beitrag  -> die Runde wurde abgebrochen, bevor jemand den
//                            Beschluss geschrieben hat. Dann gibt es keinen,
//                            und der letzte Wortbeitrag ist auch keiner.
//   Vorsitz ohne Überschrift -> das Modell hat sich nicht an den Aufbau
//                            gehalten. Dann gilt sein ganzer Beitrag; lieber
//                            zu viel anzeigen als eine leere Zeile.
export function beschlussAus(besprechung) {
  const vorsitz = besprechung?.beitraege?.find((b) => b.vorsitz)
  if (!vorsitz?.text?.trim()) return ''

  const ab = vorsitz.text.indexOf('### Beschluss')
  return (ab >= 0 ? vorsitz.text.slice(ab) : vorsitz.text).trim()
}

// Ein Datum, wie es im Aushang stehen soll. Bewusst hier und nicht im Prompt
// gebaut: Die Zeitzone der Gründerin kennt nur ihr Browser. Ein Datum, das der
// Server ausrechnet, kann einen Tag danebenliegen.
function alsTag(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('de-DE')
}

function ausSpeicherLesen() {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    return roh ? inFormBringen(JSON.parse(roh)) : leereAkte()
  } catch {
    // Kaputter Eintrag oder gesperrter Speicher (privates Fenster) - dann
    // arbeiten wir eben ohne Gedächtnis weiter, statt gar nicht zu starten.
    return leereAkte()
  }
}

export function useFirma() {
  const [firma, setFirma] = useState(ausSpeicherLesen)

  // Wann zuletzt wirklich geschrieben wurde. Nicht für die Logik - die braucht
  // es nicht -, sondern für die Anzeige: Ohne sichtbaren Beleg glaubt niemand,
  // dass gespeichert wird, und sucht nach einem Knopf, den es nicht gibt.
  const [gespeichertUm, setGespeichertUm] = useState(null)

  // Was zuletzt tatsächlich im Speicher stand. Der Vergleich läuft über den
  // Inhalt und nicht über einen "erster Durchlauf"-Merker: React ruft Effekte
  // im Entwicklungsmodus absichtlich doppelt auf, ein solcher Merker wäre nach
  // dem ersten Aufruf verbraucht und die Anzeige meldete eine Änderung, die
  // keine war.
  const zuletztGeschrieben = useRef(null)

  // Jede Änderung wandert sofort in den Speicher. Kein Speichern-Knopf:
  // Eine Akte, die man vergessen kann zu sichern, ist keine Akte.
  useEffect(() => {
    const roh = JSON.stringify(firma)
    try {
      localStorage.setItem(SCHLUESSEL, roh)
    } catch {
      // Speicher voll oder gesperrt. Nicht schön, aber kein Grund abzubrechen.
      return
    }

    // Beim ersten Mal wird nur zurückgeschrieben, was gerade gelesen wurde -
    // das ist keine Änderung und wird deshalb auch nicht als eine gemeldet.
    if (zuletztGeschrieben.current === null || zuletztGeschrieben.current === roh) {
      zuletztGeschrieben.current = roh
      return
    }
    zuletztGeschrieben.current = roh
    setGespeichertUm(new Date())
  }, [firma])

  // Kleine Hilfe: eine einzelne Position ändern, ohne die anderen anzufassen.
  const aendere = useCallback((agentId, aenderung) => {
    setFirma((alt) => ({
      ...alt,
      positionen: {
        ...alt.positionen,
        [agentId]: { ...alt.positionen[agentId], ...aenderung },
      },
    }))
  }, [])

  // --- Gründungsakte -------------------------------------------------------

  const setIdee = useCallback((text) => {
    setFirma((alt) => ({ ...alt, idee: text }))
  }, [])

  const setName = useCallback((text) => {
    setFirma((alt) => ({ ...alt, name: text }))
  }, [])

  const konzeptSichern = useCallback((text) => {
    setFirma((alt) =>
      alt.konzept === text
        ? alt
        : { ...alt, konzept: text, konzeptDatum: new Date().toISOString() },
    )
  }, [])

  // --- Einrichtung einer Stelle -------------------------------------------

  const setzeAntwort = useCallback(
    (agentId, stufeId, text) => {
      setFirma((alt) => {
        const pos = alt.positionen[agentId]
        return {
          ...alt,
          positionen: {
            ...alt.positionen,
            [agentId]: { ...pos, antworten: { ...pos.antworten, [stufeId]: text } },
          },
        }
      })
    },
    [],
  )

  const setzeDienstanweisung = useCallback(
    (agentId, text) => {
      aendere(agentId, { dienstanweisung: text })
    },
    [aendere],
  )

  // --- Scharf stellen ------------------------------------------------------
  //
  // Bewusst mit Bedingung: Ohne freigegebene Dienstanweisung geht der Schalter
  // nicht um. Ein Agent ohne Anweisung ist kein Mitarbeiter, sondern ein Risiko.
  const scharfStellen = useCallback(
    (agentId) => {
      setFirma((alt) => {
        const pos = alt.positionen[agentId]
        if (!pos.dienstanweisung.trim()) return alt
        return {
          ...alt,
          positionen: {
            ...alt.positionen,
            [agentId]: { ...pos, scharf: true, scharfSeit: new Date().toISOString() },
          },
        }
      })
    },
    [],
  )

  // Zurückziehen löscht nichts - die Stelle ruht nur. Sonst traut sich niemand,
  // den Schalter je umzulegen.
  const zurueckziehen = useCallback(
    (agentId) => {
      aendere(agentId, { scharf: false, scharfSeit: null })
    },
    [aendere],
  )

  // --- Betrieb -------------------------------------------------------------

  const protokollAnhaengen = useCallback((agentId, auftrag, antwort) => {
    setFirma((alt) => {
      const pos = alt.positionen[agentId]
      const eintrag = { auftrag, antwort, datum: new Date().toISOString() }
      return {
        ...alt,
        positionen: {
          ...alt.positionen,
          // Nur die letzten zwanzig behalten - der Browserspeicher ist klein.
          [agentId]: { ...pos, protokoll: [...pos.protokoll, eintrag].slice(-20) },
        },
      }
    })
  }, [])

  const protokollLeeren = useCallback(
    (agentId) => {
      aendere(agentId, { protokoll: [] })
    },
    [aendere],
  )

  // --- Besprechungen -------------------------------------------------------
  //
  // Eine Besprechung gehört keiner einzelnen Stelle, deshalb steht sie neben
  // den Positionen und nicht in einer davon. Sie landet auch in keinem
  // Protokoll: Die Runde ist ein Dokument für sich, und was aus ihr für die
  // anderen zählt, holt sich der Aushang von hier.
  const besprechungSichern = useCallback((thema, tisch, beitraege) => {
    if (!beitraege.length) return
    setFirma((alt) => ({
      ...alt,
      besprechungen: [
        ...alt.besprechungen,
        { thema, tisch, beitraege, datum: new Date().toISOString() },
      ].slice(-BESPRECHUNGEN_MAX),
    }))
  }, [])

  const besprechungenLeeren = useCallback(() => {
    setFirma((alt) => ({ ...alt, besprechungen: [] }))
  }, [])

  // --- Ganze Akte ----------------------------------------------------------

  const positionZuruecksetzen = useCallback((agentId) => {
    setFirma((alt) => ({
      ...alt,
      positionen: { ...alt.positionen, [agentId]: leerePosition() },
    }))
  }, [])

  const akteLeeren = useCallback(() => setFirma(leereAkte()), [])

  // Die Beispielakte. Sie kommt von außen herein, weil das Modul erst beim
  // Klick nachgeladen wird - 30 KB, die niemand herunterladen soll, der sie
  // nicht ansieht. Durch inFormBringen läuft sie wie jede eingelesene Akte:
  // Was dort nicht hineinpasst, fällt weg, und "scharf" gilt nur mit
  // Dienstanweisung. Ein Beispiel darf sich keine Sonderrechte nehmen.
  const beispielLaden = useCallback((roh) => {
    setFirma({ ...inFormBringen(roh), beispiel: true })
  }, [])

  const akteEinlesen = useCallback((roh) => {
    setFirma(inFormBringen(roh))
  }, [])

  // --- Abgeleitete Werte ---------------------------------------------------
  //
  // Der Dienststand wird IMMER errechnet, nie gespeichert. Gespeicherte Stände
  // laufen irgendwann auseinander; errechnete können das nicht.
  const dienststand = useCallback(
    (agentId) => {
      const pos = firma.positionen[agentId]
      if (!pos) return DIENSTSTAND.UNBESETZT
      if (pos.scharf) return DIENSTSTAND.SCHARF
      if (pos.dienstanweisung.trim()) return DIENSTSTAND.BEREIT

      const beantwortet = STUFEN_IDS.filter((id) => pos.antworten[id]?.trim()).length
      if (beantwortet === 0) return DIENSTSTAND.UNBESETZT
      if (beantwortet < STUFEN_IDS.length) return DIENSTSTAND.EINRICHTUNG
      return DIENSTSTAND.ENTWURF
    },
    [firma],
  )

  const fortschritt = useCallback(
    (agentId) => {
      const pos = firma.positionen[agentId]
      const beantwortet = pos
        ? STUFEN_IDS.filter((id) => pos.antworten[id]?.trim()).length
        : 0
      return { beantwortet, gesamt: STUFEN_IDS.length }
    },
    [firma],
  )

  const scharfe = useMemo(
    () => AGENTEN.filter((a) => firma.positionen[a.id]?.scharf),
    [firma],
  )

  // --- Der Aushang ---------------------------------------------------------
  //
  // Was eine Stelle bei ihrem Auftrag über die anderen mitbekommt: je Kollegin
  // im Dienst ihre letzte Meldung, dazu der Beschluss der letzten Besprechung.
  //
  // Warum je Stelle nur EINE Meldung: Sonst füllt eine vielbeschäftigte Stelle
  // den ganzen Aushang und die übrigen sieben kommen nie vor. Wer mehr wissen
  // will, ruft eine Besprechung ein - dort reden alle in voller Länge.
  //
  // Warum der Beschluss vorn steht und nicht mitsortiert wird: Er ist das
  // Einzige, worauf sich das ganze Haus geeinigt hat. Er darf nicht wegen
  // seines Alters aus der Liste fallen.
  const aushang = useCallback(
    (ausserAgentId) => {
      const meldungen = []

      for (const a of AGENTEN) {
        if (a.id === ausserAgentId) continue // die eigene steht schon im Verlauf
        const pos = firma.positionen[a.id]
        if (!pos?.scharf) continue
        const letzte = pos.protokoll[pos.protokoll.length - 1]
        if (!letzte) continue
        meldungen.push({
          von: `${a.name} · ${a.stelle}`,
          wann: alsTag(letzte.datum),
          worum: letzte.auftrag,
          ergebnis: letzte.antwort,
          zeit: Date.parse(letzte.datum) || 0,
        })
      }

      meldungen.sort((x, y) => y.zeit - x.zeit)

      const letzteRunde = firma.besprechungen[firma.besprechungen.length - 1]
      const beschluss = letzteRunde ? beschlussAus(letzteRunde) : ''
      const kopf = beschluss
        ? [
            {
              von: 'Beschluss der letzten Besprechung',
              wann: alsTag(letzteRunde.datum),
              worum: letzteRunde.thema,
              ergebnis: beschluss,
            },
          ]
        : []

      return [...kopf, ...meldungen]
        .slice(0, AUSHANG_MAX)
        .map(({ zeit, ...rest }) => rest) // die Sortierhilfe muss nicht mitreisen
    },
    [firma],
  )

  const hatKonzept = Boolean(firma.konzept.trim())

  return {
    firma,
    gespeichertUm,
    // Gründungsakte
    idee: firma.idee,
    setIdee,
    name: firma.name,
    setName,
    konzept: firma.konzept,
    konzeptDatum: firma.konzeptDatum,
    konzeptSichern,
    hatKonzept,
    // Einrichtung
    setzeAntwort,
    setzeDienstanweisung,
    scharfStellen,
    zurueckziehen,
    positionZuruecksetzen,
    // Betrieb
    protokollAnhaengen,
    protokollLeeren,
    aushang,
    // Besprechung
    besprechungen: firma.besprechungen,
    besprechungSichern,
    besprechungenLeeren,
    // Akte
    akteLeeren,
    akteEinlesen,
    beispielLaden,
    istBeispiel: firma.beispiel,
    // Ob überhaupt schon etwas dasteht - entscheidet, ob das Beispiel
    // angeboten wird oder ob es jemandem die eigene Arbeit überschriebe.
    istLeer:
      !firma.idee.trim() &&
      !firma.konzept.trim() &&
      !firma.name.trim() &&
      firma.besprechungen.length === 0 &&
      AGENTEN.every((a) => {
        const pos = firma.positionen[a.id]
        return (
          !pos.dienstanweisung.trim() &&
          STUFEN_IDS.every((id) => !pos.antworten[id]?.trim())
        )
      }),
    // Abgeleitet
    dienststand,
    fortschritt,
    scharfe,
    scharfeAnzahl: scharfe.length,
  }
}
