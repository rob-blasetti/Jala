import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MusiciansProvider } from './context/MusiciansContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MusiciansProvider>
      <App />
    </MusiciansProvider>
  </StrictMode>,
)
