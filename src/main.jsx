// Einstiegspunkt des Frontends.
// Einzige Aufgabe: die App-Komponente in das <div id="root"> aus index.html hängen.
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './stile/tokens.css'
import './stile/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
