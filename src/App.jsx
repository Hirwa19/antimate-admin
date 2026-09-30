import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AppSettingsProvider } from "./context/AppSettingsContext";

import Login from "./pages/Login";
import AccessControl from "./pages/AccessControl";
import Dashboard from "./pages/Dashboard";
import Workers from "./pages/Workers";
import Devices from "./pages/Devices";
import CreateEmployee from "./pages/CreateEmployee";
import GenerateDevice from "./pages/GenerateDevice";
import GenerateGateway from "./pages/GenerateGateway";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Organization from "./pages/Organization";
import Reports from "./pages/Reports";
import CreateReport from "./pages/CreateReport";

function Protected({
  children,
  permission,
  anyPermissions = [],
  allPermissions = [],
}) {
  return (
    <ProtectedRoute
      permission={permission}
      anyPermissions={anyPermissions}
      allPermissions={allPermissions}
    >
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppSettingsProvider>
        <Routes>

          {/* ==================================================
              LOGIN
          ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          {/* ==================================================
              DASHBOARD
          ================================================== */}

          <Route
            path="/dashboard"
            element={
              <Protected permission="dashboard.view">
                <Dashboard />
              </Protected>
            }
          />

          {/* ==================================================
              DEVICES
          ================================================== */}

          <Route
            path="/devices"
            element={
              <Protected permission="devices.view">
                <Devices />
              </Protected>
            }
          />

          {/* ==================================================
              GENERATE DEVICE
          ================================================== */}

          <Route
            path="/generate-device"
            element={
              <Protected permission="devices.create">
                <GenerateDevice />
              </Protected>
            }
          />

          {/* ==================================================
              GENERATE GATEWAY
          ================================================== */}

          <Route
            path="/generate-gateway"
            element={
              <Protected permission="gateways.create">
                <GenerateGateway />
              </Protected>
            }
          />

          {/* ==================================================
              WORKERS
          ================================================== */}

          <Route
            path="/workers"
            element={
              <Protected permission="workers.view">
                <Workers />
              </Protected>
            }
          />

          {/* ==================================================
              CREATE WORKER
          ================================================== */}

          <Route
            path="/workers/create"
            element={
              <Protected permission="workers.create">
                <CreateEmployee />
              </Protected>
            }
          />

          {/* ==================================================
              ORGANIZATION
          ================================================== */}

          <Route
            path="/organization"
            element={
              <Protected permission="organization.view">
                <Organization />
              </Protected>
            }
          />

          {/* ==================================================
              ACCESS CONTROL
          ================================================== */}

          <Route
            path="/access-control"
            element={
              <Protected permission="access_control.view">
                <AccessControl />
              </Protected>
            }
          />

          <Route
  path="/reports"
  element={
    <Protected permission="reports.view">
      <Reports />
    </Protected>
  }
/>

<Route
  path="/reports/create"
  element={
    <Protected permission="reports.create">
      <CreateReport />
    </Protected>
  }
/>

          {/* ==================================================
              SETTINGS
          ================================================== */}

          <Route
            path="/settings"
            element={
              <Protected permission="settings.view">
                <Settings />
              </Protected>
            }
          />

          {/* ==================================================
              DEFAULT
          ================================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* ==================================================
              UNKNOWN ROUTES
          ================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      </AppSettingsProvider>
    </BrowserRouter>
  );
}