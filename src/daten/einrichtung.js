// Die Einrichtung einer Stelle - fünf Schritte, für jede Position eigens gefragt.
//
// Warum für alle acht dieselben fünf Stufen?
// Weil man eine Stelle immer auf dieselbe Weise besetzt: Zuständigkeit klären,
// Arbeitsmittel geben, Arbeitsweise festlegen, Grenzen ziehen, Erfolgsmaß
// vereinbaren. Wer die Einrichtung einmal gemacht hat, kennt sie für alle acht.
// Verschieden ist nur, wonach gefragt wird - und das steht in FRAGEN.
//
// Warum liegen diese Texte im Frontend und nicht wie die Rollen-Prompts auf dem
// Server? Weil sie ohnehin auf dem Bildschirm stehen. Es ist der sichtbare Teil
// der Einrichtung; geheim ist nur, wie die Agenten daraus denken.
//
// Der vierte Schritt ist der wichtigste: Ohne gezogene Grenze lässt sich eine
// Stelle nicht scharf stellen. Das ist Absicht.

export const STUFEN = [
  {
    id: 'zustaendigkeit',
    nummer: 1,
    ziffer: '1',
    titel: 'Die Zuständigkeit', // ausgeschrieben über der Frage
    kurz: 'Zuständigkeit',
    worum: 'Was diese Stelle übernimmt - und was ausdrücklich nicht.',
  },
  {
    id: 'grundlage',
    nummer: 2,
    ziffer: '2',
    titel: 'Die Arbeitsgrundlage',
    kurz: 'Grundlage',
    worum: 'Womit sie arbeitet: Zahlen, Unterlagen, Zugänge, Quellen.',
  },
  {
    id: 'arbeitsweise',
    nummer: 3,
    ziffer: '3',
    titel: 'Die Arbeitsweise',
    kurz: 'Arbeitsweise',
    worum: 'In welchem Takt sie sich meldet und in welcher Form sie liefert.',
  },
  {
    id: 'grenzen',
    nummer: 4,
    ziffer: '4',
    titel: 'Grenzen und Freigaben',
    kurz: 'Grenzen',
    worum: 'Was sie allein darf - und wofür sie dich fragen muss.',
  },
  {
    id: 'erfolg',
    nummer: 5,
    ziffer: '5',
    titel: 'Erfolgsmaß und Alarm',
    kurz: 'Erfolgsmaß',
    worum: 'Woran man sie misst und wann sie dich wecken soll.',
  },
]

export const STUFEN_IDS = STUFEN.map((s) => s.id)

// Je Position und Stufe:
//   frage    - die Frage an dich, wörtlich
//   hinweis  - worauf es bei der Antwort ankommt
//   beispiel - Platzhalter im Feld; zeigt die erwartete Flughöhe
export const FRAGEN = {
  // ---------------------------------------------------------------- I  CEO
  ceo: {
    zustaendigkeit: {
      frage: 'Welche Entscheidungen soll die Geschäftsführung vorbereiten - und welche triffst du weiterhin selbst?',
      hinweis:
        'Eine Stelle, die alles darf, wird nie scharf gestellt. Zieh die Linie lieber zu eng als zu weit; erweitern kannst du später jederzeit.',
      beispiel:
        'Bereitet die Quartalsziele vor und prüft monatlich, ob wir auf Kurs sind. Preise, Einstellungen und alles über 1.000 Euro entscheide ich.',
    },
    grundlage: {
      frage: 'Woran soll sie erkennen, wie das Geschäft läuft? Welche Zahlen und Unterlagen bekommt sie?',
      hinweis:
        'Nenne, was es wirklich gibt - nicht, was es geben sollte. Was fehlt, ist selbst ein Befund.',
      beispiel:
        'Umsatz und Kundenzahl aus meiner Monatsübersicht, das Gründungskonzept, die Notizen aus den Kundengesprächen.',
    },
    arbeitsweise: {
      frage: 'In welchem Takt soll sie sich melden, und in welcher Form?',
      hinweis: 'Ein fester Takt schlägt "bei Bedarf" - sonst meldet sich die Stelle nie oder ständig.',
      beispiel:
        'Jeden ersten Montag im Monat eine Seite: Lage, Abweichung vom Ziel, die drei Entscheidungen, die anstehen.',
    },
    grenzen: {
      frage: 'Was darf sie ohne Rückfrage tun, und wofür braucht sie deine ausdrückliche Freigabe?',
      hinweis:
        'Was nach außen geht oder Geld kostet, gehört auf die Freigabeseite. Alles Vorbereitende kann sie allein.',
      beispiel:
        'Allein: analysieren, Vorschläge schreiben, Zahlen einordnen. Nur mit Freigabe: alles, was an Kunden geht, Zusagen, Ausgaben.',
    },
    erfolg: {
      frage: 'Woran misst du, ob diese Stelle ihr Geld wert ist - und wann soll sie dich wecken?',
      hinweis: 'Ein nachprüfbares Maß, kein Gefühl. Und ein klarer Schwellenwert für den Alarm.',
      beispiel:
        'Maß: Ich treffe die Monatsentscheidungen in unter einer Stunde. Alarm: wenn der Umsatz zwei Monate hintereinander unter Plan liegt.',
    },
  },

  // ------------------------------------------------------------- II  Markt
  markt: {
    zustaendigkeit: {
      frage: 'Welchen Markt soll die Marktbeobachtung im Auge behalten - und welchen ausdrücklich nicht?',
      hinweis:
        'Grenz es räumlich und fachlich ein. "Der Markt für Virtuelle Assistenz" ist zu groß, um beobachtet zu werden.',
      beispiel:
        'Steuerkanzleien mit 3 bis 10 Mitarbeitenden in Baden-Württemberg. Nicht: Konzerne, nicht das Ausland, nicht Privatkunden.',
    },
    grundlage: {
      frage: 'Aus welchen Quellen soll sie schöpfen?',
      hinweis:
        'Nenne Seiten, Portale, Verbände, Gruppen - und was du selbst beisteuerst. Achtung: Sie kann nur lesen, was du ihr gibst oder was sie öffentlich findet.',
      beispiel:
        'Stellenanzeigen auf Indeed, Preise auf Fiverr und Upwork, Beiträge in zwei LinkedIn-Gruppen, meine eigenen Absagegründe.',
    },
    arbeitsweise: {
      frage: 'Wie oft soll sie berichten, und wie lang darf der Bericht sein?',
      hinweis: 'Marktbeobachtung wird schnell zur Sammelwut. Eine harte Längenbegrenzung hilft.',
      beispiel:
        'Alle zwei Wochen zehn Zeilen: Was hat sich bewegt, was heißt das für uns, was sollten wir prüfen.',
    },
    grenzen: {
      frage: 'Was darf sie behaupten - und was muss sie als Vermutung kennzeichnen?',
      hinweis:
        'Der häufigste Schaden dieser Stelle sind erfundene Zahlen. Verlange die Quelle bei jeder Zahl.',
      beispiel:
        'Jede Zahl mit Quelle und Datum. Ohne Quelle steht "geschätzt" davor. Keine Namen echter Wettbewerber ohne Beleg.',
    },
    erfolg: {
      frage: 'Woran erkennst du, dass die Beobachtung etwas bringt - und wann soll sie Alarm schlagen?',
      hinweis: 'Nützlich ist sie, wenn sie dein Handeln ändert. Alles andere ist Lektüre.',
      beispiel:
        'Maß: mindestens ein Befund pro Quartal, der etwas an Angebot oder Preis ändert. Alarm: wenn ein neuer Anbieter dieselbe Zielgruppe deutlich billiger bedient.',
    },
  },

  // ----------------------------------------------------------- III  Angebot
  angebot: {
    zustaendigkeit: {
      frage: 'Welche Leistungen verantwortet diese Stelle - und wo hört ihre Zuständigkeit auf?',
      hinweis:
        'Kläre besonders, ob sie Preise nur vorschlagen oder auch festlegen darf. Das ist die häufigste Unklarheit.',
      beispiel:
        'Zuschnitt der Pakete, Leistungsbeschreibungen, Angebotstexte. Sie schlägt Preise vor, festlegen tue ich sie.',
    },
    grundlage: {
      frage: 'Was muss sie über deine Leistung wissen, das nicht im Konzept steht?',
      hinweis:
        'Hier gehört alles hin, was in der Wirklichkeit anders ist als im Plan: Aufwände, Grenzen, schlechte Erfahrungen.',
      beispiel:
        'Ein Newsletter kostet mich real 3 Stunden, nicht 1. Buchhaltung mache ich nicht. Kunden unter 300 Euro im Monat lohnen sich nicht.',
    },
    arbeitsweise: {
      frage: 'Wann wird sie tätig, und was liefert sie ab?',
      hinweis: 'Diese Stelle arbeitet meist auf Zuruf. Sag, was der Auslöser ist und was am Ende auf dem Tisch liegt.',
      beispiel:
        'Auslöser: eine Anfrage. Liefert: ein fertiges Angebot in meiner Vorlage, mit Umfang, Preis, Laufzeit und dem, was nicht drin ist.',
    },
    grenzen: {
      frage: 'Welchen Preis darf sie nicht unterschreiten, und was darf sie nie zusagen?',
      hinweis:
        'Das ist die wichtigste Grenze überhaupt - sie geht direkt in die Angebote. Nenne eine Zahl.',
      beispiel:
        'Nie unter 45 Euro die Stunde und nie unter 300 Euro im Monat. Keine Zusagen zu Reaktionszeiten unter 24 Stunden, keine Erfolgsgarantien.',
    },
    erfolg: {
      frage: 'Woran misst du diese Stelle - und wann muss sie dich fragen statt zu liefern?',
      hinweis: 'Angebotsqualität misst man an der Zusagequote und an der Zahl der Nachverhandlungen.',
      beispiel:
        'Maß: Jedes zweite Angebot wird angenommen, ohne dass über den Preis verhandelt wird. Fragen muss sie, wenn eine Anfrage nicht in eines der drei Pakete passt.',
    },
  },

  // -------------------------------------------------------- IV  Marketing
  marketing: {
    zustaendigkeit: {
      frage: 'Für welche Kanäle ist diese Stelle zuständig - und für welche ausdrücklich nicht?',
      hinweis:
        'Zwei Kanäle, die bespielt werden, schlagen fünf, die verwaisen. Nenne auch, was bewusst wegfällt.',
      beispiel:
        'LinkedIn und der Monatsnewsletter. Nicht: Instagram, TikTok, keine bezahlte Werbung.',
    },
    grundlage: {
      frage: 'Woher nimmt sie Stoff - und wie klingst du, wenn du selbst schreibst?',
      hinweis:
        'Der Ton ist das Entscheidende. Häng am besten zwei, drei Sätze an, die von dir stammen; daran richtet sie sich aus.',
      beispiel:
        'Stoff: meine Kundengespräche, häufige Fragen, mein Arbeitsalltag. Ton: nüchtern, per Du, kurze Sätze, keine Ausrufezeichen, kein "spannend".',
    },
    arbeitsweise: {
      frage: 'Wie viel soll sie liefern, in welchem Takt, in welchem Format?',
      hinweis: 'Menge und Takt festnageln, sonst schwankt es zwischen Flut und Funkstille.',
      beispiel:
        'Montags drei LinkedIn-Beiträge zur Auswahl, je unter 150 Wörtern. Einmal im Monat der Newsletter als Entwurf.',
    },
    grenzen: {
      frage: 'Was darf sie schreiben, ohne dich zu fragen - und was geht nie ohne dich raus?',
      hinweis:
        'Alles, was veröffentlicht wird, gehört mit deinem Namen unterschrieben. Halte es beim Entwurf.',
      beispiel:
        'Entwürfe immer allein. Veröffentlichen nie ohne mich. Keine Kundennamen, keine Preise, keine Zahlen aus dem Geschäft, keine Politik.',
    },
    erfolg: {
      frage: 'Woran misst du Sichtbarkeit - und wann soll sie Alarm schlagen?',
      hinweis: 'Reichweite ist ein schwaches Maß. Anfragen sind ein starkes.',
      beispiel:
        'Maß: zwei Anfragen im Monat, die über LinkedIn kommen. Alarm: wenn drei Monate lang keine einzige Anfrage aus einem Kanal kommt - dann stimmt der Kanal nicht.',
    },
  },

  // ---------------------------------------------------------- V  Akquise
  akquise: {
    zustaendigkeit: {
      frage: 'Wen soll diese Stelle ansprechen - und wen auf keinen Fall?',
      hinweis:
        'Beschreib die Wunschkundschaft so genau, dass ein Fremder sie in einem Verzeichnis wiederfinden würde.',
      beispiel:
        'Steuerkanzleien mit 3 bis 10 Mitarbeitenden im Umkreis von 80 km, Ansprechpartner ist die Kanzleileitung. Keine Konzerne, keine Privatpersonen, keine Kaltakquise am Telefon.',
    },
    grundlage: {
      frage: 'Woher kommen die Adressen, und was weiß sie über bisherige Kontakte?',
      hinweis:
        'Adressen erfinden ist der schlimmste Fehler dieser Stelle. Sag klar, aus welcher Liste sie schöpft.',
      beispiel:
        'Aus meiner Kontaktliste und dem Kammerverzeichnis. Sie trägt selbst keine Adressen ein, die sie nicht belegen kann. Wer schon abgesagt hat, wird nicht erneut angeschrieben.',
    },
    arbeitsweise: {
      frage: 'Wie viele Ansprachen pro Woche, und in welcher Form?',
      hinweis: 'Nenne eine Zahl. Akquise ohne Menge ist ein Vorsatz, kein Vorgang.',
      beispiel:
        'Zehn Ansprachen pro Woche als fertige Mailentwürfe, höchstens sechs Sätze, jede persönlich auf die Kanzlei bezogen. Nachfassen nach sieben Tagen.',
    },
    grenzen: {
      frage: 'Was darf sie selbst verschicken, und was legt sie dir nur vor?',
      hinweis:
        'Hier hängt Recht dran: Kaltakquise per Mail ist in Deutschland heikel. Im Zweifel bleibt alles beim Entwurf.',
      beispiel:
        'Nur Entwürfe, verschickt wird von mir. Keine Preise in der Erstansprache, keine Terminzusagen, kein Nachfassen öfter als zweimal.',
    },
    erfolg: {
      frage: 'Woran misst du die Akquise - und wann muss sie Alarm schlagen?',
      hinweis: 'Zwei Zahlen genügen: wie viele raus, wie viele antworten.',
      beispiel:
        'Maß: 40 Ansprachen im Monat, mindestens vier Antworten, davon ein Gespräch. Alarm: wenn 30 Ansprachen ohne eine einzige Antwort bleiben - dann stimmt der Text nicht.',
    },
  },

  // -------------------------------------------------------- VI  Finanzen
  finanzen: {
    zustaendigkeit: {
      frage: 'Was übernimmt diese Stelle bei den Zahlen - und was bleibt ausdrücklich beim Steuerbüro?',
      hinweis:
        'Wichtig: Ein Agent ersetzt keine Steuerberatung. Schreib in diesen Schritt, wo die Grenze verläuft.',
      beispiel:
        'Laufende Übersicht, Vorschau, Rücklagenberechnung, Warnungen. Steuererklärung, Umsatzsteuervoranmeldung und alles gegenüber dem Finanzamt macht das Steuerbüro.',
    },
    grundlage: {
      frage: 'Welche Zahlen bekommt sie, woher, und wie aktuell sind sie?',
      hinweis:
        'Ohne echte Zahlen rechnet sie mit Annahmen - und das gibt gefährlich hübsche Ergebnisse. Sag, was du wirklich lieferst.',
      beispiel:
        'Ich gebe ihr am Monatsende Einnahmen, Ausgaben und offene Rechnungen aus meiner Tabelle. Kontostand nenne ich auf Nachfrage. Zugriff auf mein Konto bekommt sie nicht.',
    },
    arbeitsweise: {
      frage: 'Wann rechnet sie, und was legt sie vor?',
      hinweis: 'Ein fester Monatstermin, ein festes Format. Zahlen wirken nur, wenn sie vergleichbar sind.',
      beispiel:
        'Am dritten Werktag des Monats: Einnahmen, Kosten, Ergebnis, Steuerrücklage, Vorschau auf drei Monate. Immer dieselbe Tabelle.',
    },
    grenzen: {
      frage: 'Was darf sie nie tun oder behaupten?',
      hinweis:
        'Diese Grenze schützt dich vor dem Finanzamt. Halte sie streng.',
      beispiel:
        'Keine Steuerberatung, keine verbindlichen Auskünfte, keine Zahlungen, keine Zugänge zu Konten. Bei Steuerfragen verweist sie ans Steuerbüro.',
    },
    erfolg: {
      frage: 'Woran misst du diese Stelle - und ab welcher Zahl schlägt sie Alarm?',
      hinweis: 'Nenne konkrete Schwellenwerte. Ein Finanzwarner ohne Schwelle warnt nie oder immer.',
      beispiel:
        'Maß: Ich weiß jeden Monat ohne Rechnen, wo ich stehe. Alarm: Rücklage unter 3.000 Euro, offene Rechnungen älter als 30 Tage, oder Monatsergebnis zweimal hintereinander negativ.',
    },
  },

  // --------------------------------------------------------- VII  Risiko
  risiko: {
    zustaendigkeit: {
      frage: 'Was soll diese Stelle prüfen - und was ist nicht ihre Sache?',
      hinweis:
        'Sie ist ein Gegenleser, kein Mitentscheider. Halte das auseinander, sonst blockiert sie alles.',
      beispiel:
        'Prüft Verträge, größere Zusagen und alles, was mit Kundendaten zu tun hat, auf Schwachstellen. Sie entscheidet nichts und schreibt keine Verträge.',
    },
    grundlage: {
      frage: 'Was muss sie über deine Lage wissen, um Risiken richtig einzuschätzen?',
      hinweis:
        'Ein Risiko ist nur im Verhältnis zu deinen Verhältnissen groß. Nenne Rücklage, Abhängigkeiten, Absicherung.',
      beispiel:
        'Ich bin allein, ohne Angestellte, Rücklage für drei Monate. Ein Kunde macht 40 Prozent vom Umsatz. Berufshaftpflicht besteht, Rechtsschutz nicht.',
    },
    arbeitsweise: {
      frage: 'Wann wird sie tätig, und in welcher Form antwortet sie?',
      hinweis: 'Am besten als kurzes Urteil mit Ampel - lange Risikoberichte liest niemand vor der Unterschrift.',
      beispiel:
        'Auf Zuruf, bevor ich unterschreibe. Antwort in zehn Zeilen: das größte Risiko, wie wahrscheinlich, was dagegen hilft, dazu ein klares Ja, Ja-mit-Änderung oder Nein.',
    },
    grenzen: {
      frage: 'Wo endet ihr Urteil - und wann muss sie an einen echten Fachmenschen verweisen?',
      hinweis:
        'Rechtsberatung darf sie nicht leisten. Das ist keine Formsache, das ist das Rechtsdienstleistungsgesetz.',
      beispiel:
        'Keine Rechtsberatung, keine Vertragsklauseln zum Unterschreiben. Bei Vertragsrecht, Arbeitsrecht und Datenschutzverstößen verweist sie an Anwalt oder Datenschutzbeauftragten.',
    },
    erfolg: {
      frage: 'Woran erkennst du, dass sie nützt - und wann soll sie ungefragt Alarm schlagen?',
      hinweis: 'Nützlich ist sie, wenn sie dich vor etwas bewahrt hat. Das darf sie mitzählen.',
      beispiel:
        'Maß: Keine böse Überraschung, die sie hätte sehen können. Alarm: sobald ein Kunde über die Hälfte des Umsatzes ausmacht oder Kundendaten das Land verlassen.',
    },
  },

  // ------------------------------------------------------- VIII  Investor
  investor: {
    zustaendigkeit: {
      frage: 'Was soll diese Stelle gegenlesen - und mit wessen Augen?',
      hinweis:
        'Sie hat zwei Blickwinkel: die zahlende Kundin und der nüchterne Geldgeber. Sag, welcher wann gilt.',
      beispiel:
        'Liest Angebote, Website-Texte und Pläne gegen. Bei Texten mit den Augen der Kanzleileitung, bei Plänen mit denen von jemandem, der das Geld gäbe.',
    },
    grundlage: {
      frage: 'Was muss sie über deine Kundschaft wissen, um ihre Sicht einnehmen zu können?',
      hinweis:
        'Je genauer die Person, desto brauchbarer das Urteil. Beschreib eine echte Kundin, keine Zielgruppe.',
      beispiel:
        'Kanzleileiterin, Mitte fünfzig, 15 Jahre selbstständig, misstrauisch gegenüber Digitalem, hat schon zweimal schlechte Erfahrung mit Dienstleistern gemacht, entscheidet nach Vertrauen.',
    },
    arbeitsweise: {
      frage: 'Wie soll ihr Urteil aussehen?',
      hinweis: 'Ein klares Urteil in einem Satz, dann die Begründung. Nicht andersherum.',
      beispiel:
        'Zuerst ein Satz Urteil: würde ich kaufen, würde ich mit Änderung kaufen, würde ich nicht kaufen. Danach die drei Stellen, an denen ich ausgestiegen bin.',
    },
    grenzen: {
      frage: 'Was darf sie nicht - und wie ehrlich soll sie sein?',
      hinweis:
        'Diese Stelle ist nur etwas wert, wenn sie unangenehm sein darf. Schreib ihr das ausdrücklich zu.',
      beispiel:
        'Sie lobt nicht und tröstet nicht. Sie schreibt keine Texte um, sie beurteilt sie. Wenn etwas nicht trägt, sagt sie es beim ersten Satz.',
    },
    erfolg: {
      frage: 'Woran misst du sie - und wann soll sie ungefragt widersprechen?',
      hinweis: 'Ein Gegenleser, der immer zustimmt, ist kaputt. Bau eine Widerspruchspflicht ein.',
      beispiel:
        'Maß: Jeder zweite Text wird nach ihrem Urteil besser. Widerspruch: immer, wenn ein Versprechen im Text steht, das ich allein nicht halten kann.',
    },
  },
}

// Baut die fünf Schritte einer Position zusammen: Stufe (gleich für alle) plus
// die Fragen (je Position verschieden). Eine Stelle, an der beides zusammenkommt -
// so kann die Oberfläche nicht auseinanderlaufen.
export function schritteFuer(agentId) {
  const fragen = FRAGEN[agentId]
  if (!fragen) return []
  return STUFEN.map((stufe) => ({ ...stufe, ...fragen[stufe.id] }))
}
