import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-full px-2.5 py-2 text-sm font-medium transition-all duration-200 sm:px-3 ${
    isActive
      ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20">
            AI
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Discovery OS
            </p>
            <p className="truncate text-sm font-semibold text-white">
              AI Entertainment Assistant
            </p>
          </div>
        </NavLink>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>

              {role === "admin" && (
                <NavLink to="/admin" className={linkClass}>
                  Admin
                </NavLink>
              )}

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 sm:px-4"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-3 py-2 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 sm:px-4"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
