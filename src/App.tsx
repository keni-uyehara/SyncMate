import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { UserAuthProvider } from './context/userAuthContext' // <-- add
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import RoleBasedRedirect from './components/RoleBasedRedirect'
import TeamLeadPortal from './components/team-lead-portal'
import DataTeamPortal from './components/data-team-portal'
import TeamLeadPortalNavigation from './components/team-lead-portal-navigation'
import DataTeamPortalNavigation from './components/data-team-portal-navigation'
import DataTeamLeadPortal from './components/data-team-lead-portal'
import NotAuthorized from './NotAuthorized'
import LoginComponent from './pages/Login'

export default function App() {
  return (
    <UserAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />

          <Route path="/" element={
            <ProtectedRoute>
              <RoleBasedRedirect />
            </ProtectedRoute>
          } />

          <Route path="/team-lead" element={
            <ProtectedRoute>
              <RoleRoute role="teamLead">
                <TeamLeadPortal />
              </RoleRoute>
            </ProtectedRoute>
          } />

          <Route path="/team-lead/compliance" element={
            <ProtectedRoute>
              <RoleRoute role="teamLead">
                <TeamLeadPortalNavigation initialView="compliance" />
              </RoleRoute>
            </ProtectedRoute>
          } />

          <Route path="/team-lead/insights" element={
            <ProtectedRoute>
              <RoleRoute role="teamLead">
                <TeamLeadPortalNavigation initialView="insights" />
              </RoleRoute>
            </ProtectedRoute>
          } />

          <Route path="/data-team" element={
            <ProtectedRoute>
              <RoleRoute role="dataTeam">
                <DataTeamPortal />
              </RoleRoute>
            </ProtectedRoute>
          } />

          <Route path="/data-team/operations" element={
            <ProtectedRoute>
              <RoleRoute role="dataTeam">
                <DataTeamPortalNavigation />
              </RoleRoute>
            </ProtectedRoute>
          } />

          <Route path="/data-team-lead" element={
            <ProtectedRoute>
              <RoleRoute role="dataTeamLead">
                <DataTeamLeadPortal />
              </RoleRoute>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserAuthProvider>
  )
}
