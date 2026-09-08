import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppSettingsProvider } from "./context/AppSettingsContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Workers from "./pages/Workers";
import Devices from "./pages/Devices";
import CreateWorker from "./pages/CreateWorker";;
import GenerateDevice from "./pages/GenerateDevice";
import GenerateGateway from "./pages/GenerateGateway";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

function Protected({ children }) {
  return (
    <ProtectedRoute>
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

          <Route
            path="/login"
            element={<Login />}
          />

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

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

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