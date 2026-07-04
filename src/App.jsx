import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NodeIdentity from "./pages/NodeIdentity";
import GenerateDevice from "./pages/GenerateDevice";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Generate Node Identities */}
        <Route
          path="/nodes/generate"
          element={
            <ProtectedRoute>
              <AppLayout>
                <NodeIdentity />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Generate Device */}
        <Route
          path="/generate-device"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GenerateDevice />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;