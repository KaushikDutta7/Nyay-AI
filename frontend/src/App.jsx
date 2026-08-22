import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AnalysisPage from './pages/AnalysisPage'
import ReportPage from './pages/ReportPage'
import DashboardPage from './pages/DashboardPage'
import CaseQAPage from './pages/CaseQAPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<LandingPage />} />
        <Route path="/analysis"            element={<AnalysisPage />} />
        <Route path="/report"              element={<ReportPage />} />
        <Route path="/dashboard"           element={<DashboardPage />} />
        <Route path="/case/:caseId/qa"     element={<CaseQAPage />} />
        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}