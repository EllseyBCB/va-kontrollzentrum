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
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/va-kontrollzentrum/' : '/',
  server: {
    port: 5180,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
}))
