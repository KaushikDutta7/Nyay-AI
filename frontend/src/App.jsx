import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AnalysisPage from './pages/AnalysisPage'
import ReportPage from './pages/ReportPage'
import DashboardPage from './pages/DashboardPage'
import CaseQAPage from './pages/CaseQAPage'
import PageTransition from './components/PageTransition'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/analysis"            element={<PageTransition><AnalysisPage /></PageTransition>} />
        <Route path="/report"              element={<PageTransition><ReportPage /></PageTransition>} />
        <Route path="/dashboard"           element={<PageTransition><DashboardPage /></PageTransition>} />
        <Route path="/case/:caseId/qa"     element={<PageTransition><CaseQAPage /></PageTransition>} />
        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}