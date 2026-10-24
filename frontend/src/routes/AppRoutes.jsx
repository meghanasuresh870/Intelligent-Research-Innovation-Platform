import { Navigate, Route, Routes } from 'react-router-dom';

import LandingPage from '../landing-ui/LandingPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

import ResearchDashboard from '../pages/research/ResearchDashboard';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ResearchProfile from '../pages/ResearchProfile';

import FundingDashboard from '../pages/funding/FundingDashboard';
import ResearchTrendsPage from '../pages/modules/ResearchTrendsPage';
import PatentDashboard from '../pages/patents/PatentDashboard';
import TechnologyDashboard from '../pages/technology/TechnologyDashboard';
import InnovationDashboard from '../pages/innovation/InnovationDashboard';
import CommercializationDashboard from '../pages/commercialization/CommercializationDashboard';

import NotificationsPage from '../pages/modules/NotificationsPage';
import ReportsPage from '../pages/ReportsPage';
import CopilotPage from '../pages/copilot/CopilotPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from './ProtectedRoute';

function AdminPage() {
  return (
    <DashboardLayout
      pageTitle="Admin Control Panel"
      breadcrumbs={['Platform Administration', 'Control Panel']}
    >
      <div className="enterprise-panel">
        <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>
          Platform Administration
        </h2>

        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
          Manage user permissions, institutional access, API rate limits,
          and audit logs.
        </p>
      </div>
    </DashboardLayout>
  );
}

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <RegisterPage />
        }
      />

      {/* Module 01 - Analytics / Research Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ResearchDashboard />
          </ProtectedRoute>
        }
      />

      {/* Module 02 - Research Intelligence */}
      <Route
        path="/research"
        element={
          <ProtectedRoute>
            <ResearchDashboard />
          </ProtectedRoute>
        }
      />

      {/* Research trends - existing route preserved */}
      <Route
        path="/trends"
        element={
          <ProtectedRoute>
            <ResearchTrendsPage />
          </ProtectedRoute>
        }
      />

      {/* Research profile */}
      <Route
        path="/research-profile"
        element={
          <ProtectedRoute>
            <ResearchProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Navigate to="/research-profile" replace />
          </ProtectedRoute>
        }
      />

      {/* Module 03 - Funding Intelligence */}
      <Route
        path="/funding"
        element={
          <ProtectedRoute>
            <FundingDashboard />
          </ProtectedRoute>
        }
      />

      {/* Module 04 - Patent Intelligence */}
      <Route
        path="/patents"
        element={
          <ProtectedRoute>
            <PatentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Existing patent route preserved */}
      <Route
        path="/patent-intel"
        element={
          <ProtectedRoute>
            <PatentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Module 05 - Technology Intelligence */}
      <Route
        path="/technology"
        element={
          <ProtectedRoute>
            <TechnologyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Existing technology routes preserved */}
      <Route
        path="/tech-intel"
        element={
          <ProtectedRoute>
            <TechnologyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tech-intel/:techId"
        element={
          <ProtectedRoute>
            <TechnologyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Module 06 - Innovation Scoring */}
      <Route
        path="/innovation"
        element={
          <ProtectedRoute>
            <InnovationDashboard />
          </ProtectedRoute>
        }
      />

      {/* Existing innovation route preserved */}
      <Route
        path="/innovation-score"
        element={
          <ProtectedRoute>
            <InnovationDashboard />
          </ProtectedRoute>
        }
      />

      {/* Module 07 - Commercialization */}
      <Route
        path="/commercialization"
        element={
          <ProtectedRoute>
            <CommercializationDashboard />
          </ProtectedRoute>
        }
      />

      {/* Module 08 - Alert / Notification Intelligence */}
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Existing notification route preserved */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Module 09 - Reports and Export */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Module 10 - Research Discovery Copilot */}
      <Route
        path="/copilot"
        element={
          <ProtectedRoute>
            <CopilotPage />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'administrator']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
