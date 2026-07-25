import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Workers from "./pages/Workers";
import Devices from "./pages/Devices";
import CreateWorker from "./pages/CreateWorker";
import AddWorker from "./pages/AddWorker";
import GenerateDevice from "./pages/GenerateDevice";
import GenerateGateway from "./pages/GenerateGateway";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

// Wraps a page with the sidebar/navbar layout and auth protection
function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/devices"
          element={
            <Protected>
              <Devices />
            </Protected>
          }
        />

        <Route
          path="/generate-device"
          element={
            <Protected>
              <GenerateDevice />
            </Protected>
          }
        />
<Route
  path="/generate-gateway"
  element={
    <Protected>
      <GenerateGateway />
    </Protected>
  }
/>

        <Route
          path="/workers"
          element={
            <Protected>
              <Workers />
            </Protected>
          }
        />

        <Route
          path="/workers/add"
          element={
            <Protected>
              <AddWorker />
            </Protected>
          }
        />

        <Route
          path="/workers/create"
          element={
            <Protected>
              <CreateWorker />
            </Protected>
          }
        />

        <Route
          path="/settings"
          element={
            <Protected>
              <Settings />
            </Protected>
          }
        />

        {/* Default: send "/" to the dashboard (ProtectedRoute will
            bounce to /login if not authenticated) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all: unknown routes also go to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
