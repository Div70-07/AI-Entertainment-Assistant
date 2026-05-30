import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout    from "./layouts/MainLayout";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Dashboard     from "./pages/Dashboard";
import Profile       from "./pages/Profile";
import Admin         from "./pages/Admin";

// ─── Inline fallbacks (no dedicated files yet) ────────────────────────────────
const Unauthorized = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <p className="text-red-400 text-xl font-semibold">403 — Unauthorized</p>
  </div>
);
const NotFound = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <p className="text-slate-400 text-xl font-semibold">404 — Not Found</p>
  </div>
);

function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────────── */}
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ── Protected + Layout ─────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile"   element={<Profile />} />

          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Route>

      {/* ── Fallbacks ──────────────────────────────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<NotFound />} />
    </Routes>
  );
}

export default App;
