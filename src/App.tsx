import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import { ThemeProvider } from '@toss/tds-mobile'
import IntroPage from './pages/IntroPage'
import WritePage from './pages/WritePage'
import StatsPage from './pages/StatsPage'
import './App.css'

function App() {
  const isAITEnvironment = typeof window !== 'undefined' && 
    (window.location.hostname.includes('ait') || 
     import.meta.env.MODE === 'production')

  const routes = (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )

  if (isAITEnvironment) {
    return <TDSMobileAITProvider>{routes}</TDSMobileAITProvider>
  }

  return routes
}

export default App
