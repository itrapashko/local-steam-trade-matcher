import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initGoogleAnalytics } from './analytics/gtag'
import App from './App'
import './index.css'

initGoogleAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
