import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { validateEnv } from './utils/envCheck'
import App from './App.tsx'

validateEnv();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
