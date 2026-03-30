import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WidgetView from './components/WidgetView'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WidgetView />
  </StrictMode>,
)
