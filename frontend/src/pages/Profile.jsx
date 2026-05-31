import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { resolveProfile } from "../services/profileService";

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

const formatWatchedTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const resolved = await resolveProfile();
        if (isMounted) {
          if (!resolved) {
            setProfileError("Unable to load profile data.");
          } else {
            setProfile(resolved);
          }
        }
      } catch (err) {
        console.error("Profile load error:", err);
        if (isMounted) {
          setProfileError("Unable to load profile data.");
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loadingProfile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  const genres = profile?.genres || [];
  const creators = profile?.creators || [];
  const moods = profile?.moods || [];
  const watchHistory = profile?.watchHistory || [];

  return (
    <div className="space-y-8">
      {profileError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {profileError}
        </div>
      )}

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
              { label: "Feedback Signals", value: String(profile?.feedbackHistory?.length || 0) },
              { label: "Watch Signals", value: String(watchHistory.length) },
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
        <SectionCard title="Preferred Genres" meta={`${genres.length} saved`}>
          {genres.length > 0 ? (
            <TagList
              items={genres}
              colorClass="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
            />
          ) : (
            <p className="text-sm text-slate-400 italic">No saved genres yet</p>
          )}
        </SectionCard>

        <SectionCard title="Favorite Creators" meta={`${creators.length} followed`}>
          {creators.length > 0 ? (
            <TagList
              items={creators}
              colorClass="bg-violet-500/10 text-violet-400 border-violet-500/20"
            />
          ) : (
            <p className="text-sm text-slate-400 italic">No favorite creators yet</p>
          )}
        </SectionCard>

        <SectionCard title="Preferred Moods" meta={`${moods.length} active`}>
          {moods.length > 0 ? (
            <TagList
              items={moods}
              colorClass="bg-amber-500/10 text-amber-400 border-amber-500/20"
            />
          ) : (
            <p className="text-sm text-slate-400 italic">No mood preferences yet</p>
          )}
        </SectionCard>

        <SectionCard title="Watch History" meta="Recent activity">
          {watchHistory.length > 0 ? (
            <ul className="space-y-3">
              {watchHistory.map((item, idx) => (
                <li key={item._id || idx} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="relative h-10 w-10 shrink-0">
                    <svg className="h-10 w-10 -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="12" fill="none" stroke="#1e293b" strokeWidth="3" />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="3"
                        strokeDasharray="75.4 75.4"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{item.title || "Untitled Video"}</p>
                    <p className="text-xs text-slate-500">{item.creator || "Unknown Creator"}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                    {formatWatchedTime(item.watchedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">No watch history yet</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default Profile;
