import { useAuth } from "../context/AuthContext";

const SYSTEM_STATS = [
  { label: "API Status", value: "Operational", dot: "bg-emerald-400" },
  { label: "DB Connection", value: "Connected", dot: "bg-emerald-400" },
  { label: "Auth Service", value: "Running", dot: "bg-emerald-400" },
  { label: "Cache Layer", value: "Degraded", dot: "bg-amber-400" },
];

const USERS = [
  { id: 1, name: "Alice Chen", email: "alice@example.com", role: "admin", status: "Active" },
  { id: 2, name: "Bob Torres", email: "bob@example.com", role: "user", status: "Active" },
  { id: 3, name: "Cara Nkosi", email: "cara@example.com", role: "user", status: "Suspended" },
  { id: 4, name: "Dev Patel", email: "devp@example.com", role: "user", status: "Active" },
];

function StatCard({ label, value, dot }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot} shadow-sm`} />
        <span className="text-sm font-medium text-white">{value}</span>
      </div>
    </div>
  );
}

function Admin() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(168,85,247,0.16),rgba(15,23,42,0.95)_40%,rgba(16,185,129,0.12))] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
              Control Center
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
              Admin Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Oversee platform health, audit role access, and keep the recommendation system responsive for every signed-in viewer.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Admin Access Verified
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          System Status
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SYSTEM_STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            User Management
          </h2>
          <span className="text-xs text-slate-500">{USERS.length} users</span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Name</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 sm:table-cell">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="bg-slate-950/40">
              {USERS.map((u, i) => (
                <tr
                  key={u.id}
                  className={`${i !== USERS.length - 1 ? "border-b border-white/10" : ""} transition-colors hover:bg-white/5`}
                >
                  <td className="px-5 py-3.5 font-medium text-white">{u.name}</td>
                  <td className="hidden px-5 py-3.5 text-slate-400 sm:table-cell">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      u.role === "admin"
                        ? "border-violet-500/20 bg-violet-500/10 text-violet-400"
                        : "border-slate-700 bg-slate-800 text-slate-400"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      u.status === "Active"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/20 bg-red-500/10 text-red-400"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          Active Session
        </h2>
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-0.5 text-xs text-slate-500">Signed in as</p>
            <p className="font-medium text-white">{user?.name ?? "-"}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-slate-500">Role</p>
            <p className="font-medium capitalize text-violet-400">{user?.role ?? "-"}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-slate-500">Email</p>
            <p className="font-medium text-slate-300">{user?.email ?? "-"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Admin;
