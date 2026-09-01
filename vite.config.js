import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite-Konfiguration.
//
// Zwei Dinge sind hier wichtig:
//
// 1. base - Auf GitHub Pages liegt die Seite nicht unter "/", sondern unter
//    "/va-kontrollzentrum/". Ohne diese Zeile findet der Browser dort weder
//    JavaScript noch CSS. Lokal bleibt es bei "/".
//
// 2. proxy - Alles, was das Frontend an "/api/..." schickt, geht an den lokalen
//    Node-Server (Port 8787). So bleibt der API-Schlüssel auf dem Server und
//    landet nie im Browser. Achtung: Auf GitHub Pages gibt es keinen Server -
//    dort läuft nur die Oberfläche.
//
//    Die Weiterleitung steht zweimal da, weil Vite zwei getrennte Server hat:
//    "server" ist der beim Entwickeln, "preview" der, mit dem man das fertig
//    Gebaute ansieht. Ohne den zweiten Eintrag sähe die gebaute Fassung lokal
//    genauso tot aus wie auf GitHub Pages.
const WEITERLEITUNG = {
  '/api': {
    target: 'http://localhost:8787',
    changeOrigin: true,
  },
}

// Vite nimmt von sich aus nur Anfragen an, die an "localhost" gerichtet sind -
// eine Schutzmaßnahme gegen fremde Seiten, die auf den Entwicklungsserver
// zugreifen wollen. Das iPhone ruft aber den Tailscale-Namen auf. Ohne diesen
// Eintrag antwortet Vite dort nur mit "Blocked request".
//
// Das ist kein Loch: Der Name ist nur im eigenen Tailnet auflösbar, und
// Tailscale lässt ohnehin nur die eigenen Geräte durch.
const EIGENE_NAMEN = ['jarvis-mac.tail8b3f5e.ts.net']

//    Zum "base": Beim Ansehen des Gebauten (vite preview) ist "command" NICHT
//    "build", sondern "serve" - dafür gibt es "isPreview". Ohne diese Abfrage
//    fiele base dort auf "/" zurück, während in der gebauten index.html
//    "/va-kontrollzentrum/" steht: Der Server fände dann weder JavaScript noch
//    CSS, lieferte stattdessen die HTML-Seite zurück, und man säße vor einer
//    weißen Seite ohne Fehlermeldung.
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  base: command === 'build' || isPreview ? '/va-kontrollzentrum/' : '/',
  server: {
    port: 5180,
    open: true,
    allowedHosts: EIGENE_NAMEN,
    proxy: WEITERLEITUNG,
  },
  preview: {
    // Bewusst 5181 und nicht 4180: Auf 4180 läuft der Arbeitsplatz der
    // Hausverwaltung. Beide auf demselben Port heißt, dass mal der eine und
    // mal der andere antwortet - je nachdem, ob der Browser IPv4 oder IPv6
    // nimmt. Das ist ein Fehler, den man stundenlang sucht.
    port: 5181,
    // Ohne diese Zeile lauscht Vite unter "localhost" nur auf IPv6 (::1).
    // Tailscale leitet aber auf 127.0.0.1 weiter - das iPhone bekäme dann
    // nichts zu sehen. 127.0.0.1 statt 0.0.0.0, damit die Seite eben NICHT
    // zusätzlich im ganzen WLAN steht: Der Weg soll übers Tailnet gehen.
    host: '127.0.0.1',
    allowedHosts: EIGENE_NAMEN,
    proxy: WEITERLEITUNG,
  },
}))
