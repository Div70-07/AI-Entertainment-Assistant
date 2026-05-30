import { useAuth } from "../context/AuthContext";

const GENRES = ["Sci-Fi", "Thriller", "Documentary", "Gaming", "Comedy"];
const CREATORS = ["Apex Studios", "RetroForge", "DarkWave Media", "NeonPeak"];
const MOODS = ["Focused", "Energetic", "Chill", "Tense", "Curious"];
const HISTORY = [
  { title: "Neural Horizons", watched: "2 days ago", progress: 80 },
  { title: "The Loop Game", watched: "5 days ago", progress: 100 },
  { title: "Midnight Protocol", watched: "1 week ago", progress: 45 },
  { title: "Echo Chamber", watched: "2 weeks ago", progress: 100 },
];

function SectionCard({ title, meta, children }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          {title}
        </h2>
        {meta && <span className="text-xs text-slate-500">{meta}</span>}
      </div>
      {children}
    </div>
  );
}

function TagList({ items, colorClass }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${colorClass}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(6,182,212,0.16),rgba(15,23,42,0.95)_45%,rgba(168,85,247,0.12))] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-violet-500 text-2xl font-black text-slate-950 shadow-lg shadow-cyan-500/20">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Viewer Profile
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {user?.name ?? "User"}
            </h1>
            <p className="mt-2 text-sm text-slate-300">{user?.email ?? "-"}</p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Role", value: user?.role ?? "user" },
              { label: "Preference Clusters", value: "14" },
              { label: "Recent Watch Signals", value: String(HISTORY.length) },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-lg font-semibold capitalize text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Preferred Genres" meta={`${GENRES.length} saved`}>
          <TagList
            items={GENRES}
            colorClass="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
          />
        </SectionCard>

        <SectionCard title="Favorite Creators" meta={`${CREATORS.length} followed`}>
          <TagList
            items={CREATORS}
            colorClass="bg-violet-500/10 text-violet-400 border-violet-500/20"
          />
        </SectionCard>

        <SectionCard title="Preferred Moods" meta={`${MOODS.length} active`}>
          <TagList
            items={MOODS}
            colorClass="bg-amber-500/10 text-amber-400 border-amber-500/20"
          />
        </SectionCard>

        <SectionCard title="Watch History" meta="Recent activity">
          <ul className="space-y-3">
            {HISTORY.map((item) => (
              <li key={item.title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="relative h-10 w-10 shrink-0">
                  <svg className="h-10 w-10 -rotate-90" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="12" fill="none" stroke="#1e293b" strokeWidth="3" />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke={item.progress === 100 ? "#34d399" : "#38bdf8"}
                      strokeWidth="3"
                      strokeDasharray={`${(item.progress / 100) * 75.4} 75.4`}
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.watched}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                  {item.progress}%
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

export default Profile;
