import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { resolveProfile, clearCachedProfile } from "../services/profileService";
import {
  addFeedback,
  addToWatchHistory,
  personalizedSearch,
} from "../services/recommendationService";

// Static chips removed

const getVisualTone = (item) => {
  const genreMoodText = `${item.genre || ""} ${item.mood || ""}`.toLowerCase();

  if (genreMoodText.includes("sci") || genreMoodText.includes("focus")) {
    return {
      gradient: "from-cyan-500/20 via-slate-900 to-slate-950",
      accent: "text-cyan-400",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    };
  }

  if (genreMoodText.includes("gaming") || genreMoodText.includes("energetic")) {
    return {
      gradient: "from-violet-500/20 via-slate-900 to-slate-950",
      accent: "text-violet-400",
      badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    };
  }

  if (genreMoodText.includes("thriller") || genreMoodText.includes("tense")) {
    return {
      gradient: "from-rose-500/20 via-slate-900 to-slate-950",
      accent: "text-rose-400",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
  }

  return {
    gradient: "from-emerald-500/20 via-slate-900 to-slate-950",
    accent: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
};

function RecommendationSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 shadow-xl shadow-black/20">
      <div className="h-44 animate-pulse bg-slate-800/70" />
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-800/80" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-800/60" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-20 animate-pulse rounded-full bg-slate-800/70" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-slate-800/70" />
          <div className="h-7 w-14 animate-pulse rounded-full bg-slate-800/70" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-800/60" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-800/60" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-800/60" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-11 flex-1 animate-pulse rounded-2xl bg-slate-800/70" />
          <div className="h-11 w-20 animate-pulse rounded-2xl bg-slate-800/70" />
          <div className="h-11 w-24 animate-pulse rounded-2xl bg-slate-800/70" />
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  item,
  onWatch,
  onFeedback,
  watchPending,
  feedbackPending,
}) {
  const [liked, setLiked] = useState(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("text-emerald-300 border-emerald-500/20 bg-emerald-500/10");
  const visualTone = getVisualTone(item);
  const title = item.title || "Untitled recommendation";
  const creator = item.creator || "Unknown creator";
  const genre = item.genre || "Unclassified";
  const mood = item.mood || "Open";
  const reason = item.recommendationReason || "Generated from your active profile preferences.";
  const score = typeof item.score === "number" ? item.score : null;
  const feedbackState = feedbackPending ? "Saving..." : liked === "like" ? "Liked" : liked === "dislike" ? "Disliked" : null;

  const handleWatch = async () => {
    try {
      await onWatch(item);
      setMessage("Saved to watch history.");
      setMessageTone("border-emerald-500/20 bg-emerald-500/10 text-emerald-300");
    } catch (error) {
      setMessage(error.message || "Could not save watch history.");
      setMessageTone("border-red-500/20 bg-red-500/10 text-red-300");
    }
  };

  const handleFeedback = async (feedbackType) => {
    try {
      await onFeedback(item, feedbackType);
      setLiked(feedbackType === "liked" ? "like" : "dislike");
      setMessage(feedbackType === "liked" ? "Preference saved as liked." : "Preference saved as disliked.");
      setMessageTone("border-emerald-500/20 bg-emerald-500/10 text-emerald-300");
    } catch (error) {
      setMessage(error.message || "Could not save feedback.");
      setMessageTone("border-red-500/20 bg-red-500/10 text-red-300");
    }
  };

  return (
    <div className={`group flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b ${visualTone.gradient} shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/20`}>
      <div className="relative h-44 border-b border-white/10 bg-slate-900/60">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)]" />
        )}
        <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-200 backdrop-blur-sm">
          AI Match
        </div>
        {score !== null && (
          <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200 backdrop-blur-sm">
            Score {score}
          </div>
        )}
        <div className="absolute inset-x-5 bottom-5">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Mood Alignment
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{mood}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{creator}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${visualTone.badge}`}>
            {genre}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            {mood}
          </span>
          {score !== null && (
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-slate-200">
              Score {score}
            </span>
          )}
        </div>

        <p className="text-sm leading-6 text-slate-400">
          {reason}
        </p>

        {message && (
          <p className={`rounded-2xl border px-3 py-2 text-xs ${messageTone}`}>
            {message}
          </p>
        )}

        <div className="mt-auto flex gap-2 pt-2">
          {item.videoId ? (
            <button
              onClick={handleWatch}
              disabled={watchPending}
              className={`flex-1 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-center text-sm font-semibold ${visualTone.accent} transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {watchPending ? "Saving..." : "Watch Now"}
            </button>
          ) : (
            <button
              onClick={handleWatch}
              disabled={watchPending}
              className={`flex-1 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold ${visualTone.accent} transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {watchPending ? "Saving..." : "Save"}
            </button>
          )}
          <button
            onClick={() => handleFeedback("liked")}
            disabled={feedbackPending}
            className={`rounded-2xl px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              liked === "like"
                ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {feedbackState && liked === "like" ? feedbackState : "Like"}
          </button>
          <button
            onClick={() => handleFeedback("disliked")}
            disabled={feedbackPending}
            className={`rounded-2xl px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              liked === "dislike"
                ? "border border-red-500/30 bg-red-500/20 text-red-400"
                : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {feedbackState && liked === "dislike" ? feedbackState : "Dislike"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [builtQuery, setBuiltQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileLoadError, setProfileLoadError] = useState("");
  const [watchedVideoId, setWatchedVideoId] = useState("");
  const [feedbackVideoId, setFeedbackVideoId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [interpretedPreferences, setInterpretedPreferences] = useState(null);
  const [searchedQuery, setSearchedQuery] = useState("");

  const refreshProfile = async () => {
    clearCachedProfile();
    const latest = await resolveProfile();
    setProfile(latest);
  };

  const isProfileEmpty =
    profile &&
    (profile.genres || []).length === 0 &&
    (profile.creators || []).length === 0 &&
    (profile.moods || []).length === 0 &&
    (profile.watchHistory || []).length === 0 &&
    (profile.feedbackHistory || []).length === 0;

  const profileChips = profile
    ? [
        ...(profile.genres || []),
        ...(profile.moods || []),
        ...(profile.creators || []),
      ].filter((value, index, self) => value && self.indexOf(value) === index)
    : [];

  const stats = [
    {
      label: "Saved Genres",
      value: String(profile?.genres?.length || 0),
      tone: "text-cyan-300",
    },
    {
      label: "Feedback Signals",
      value: String(profile?.feedbackHistory?.length || 0),
      tone: "text-violet-300",
    },
    {
      label: "Watch Signals",
      value: String(profile?.watchHistory?.length || 0),
      tone: "text-emerald-300",
    },
  ];

  const profilePulse = [
    {
      label: "Top mood",
      value: profile?.moods?.[0] || "No mood preferences yet",
      detail: `${profile?.moods?.length || 0} moods saved`,
      tone: "bg-cyan-400",
      width: profile?.moods?.length ? "w-3/4" : "w-0",
    },
    {
      label: "Top genre",
      value: profile?.genres?.[0] || "No saved genres yet",
      detail: `${profile?.genres?.length || 0} genres saved`,
      tone: "bg-violet-400",
      width: profile?.genres?.length ? "w-2/3" : "w-0",
    },
    {
      label: "Top creator",
      value: profile?.creators?.[0] || "No creator preferences yet",
      detail: `${profile?.creators?.length || 0} creators saved`,
      tone: "bg-emerald-400",
      width: profile?.creators?.length ? "w-1/2" : "w-0",
    },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const resolvedProfile = await resolveProfile();

        if (!isMounted) {
          return;
        }

        setProfile(resolvedProfile);
      } catch (profileError) {
        if (!isMounted) {
          return;
        }

        setProfileLoadError(
          profileError.response?.data?.message ||
          "We could not load a profile for personalized search yet."
        );
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = async () => {
    const trimmedQuery = search.trim();

    if (!trimmedQuery) {
      setError("Enter a search query to get personalized recommendations.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resolvedProfile = profile?._id ? profile : await resolveProfile();

      if (!resolvedProfile?._id) {
        setError(profileLoadError || "A profile is required before personalized search can run.");
        return;
      }

      setProfile(resolvedProfile);

      const response = await personalizedSearch(resolvedProfile._id, trimmedQuery);
      setRecommendations(response.recommendations || []);
      setBuiltQuery(response.builtQuery || "");
      setInterpretedPreferences(response.interpretedPreferences || null);
      setSearchedQuery(trimmedQuery);
      setHasSearched(true);
      await refreshProfile();
    } catch (searchError) {
      setRecommendations([]);
      setBuiltQuery("");
      setInterpretedPreferences(null);
      setError(
        searchError.response?.data?.message ||
        "We could not fetch recommendations right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChipToggle = (chip) => {
    const nextChip = activeChip === chip ? null : chip;
    setActiveChip(nextChip);
    setSearch(nextChip ? chip : "");
  };

  const ensureProfile = async () => {
    const resolvedProfile = profile?._id ? profile : await resolveProfile();

    if (!resolvedProfile?._id) {
      throw new Error(profileLoadError || "A profile is required before this action can run.");
    }

    setProfile(resolvedProfile);
    return resolvedProfile;
  };

  const handleWatch = async (item) => {
    const resolvedProfile = await ensureProfile();
    setWatchedVideoId(item.videoId || item.title || "pending");

    try {
      await addToWatchHistory(resolvedProfile._id, {
        title: item.title,
        creator: item.creator,
        genre: item.genre,
        mood: item.mood,
        videoId: item.videoId,
      });

      await refreshProfile();

      if (item.videoId) {
        window.open(`https://www.youtube.com/watch?v=${item.videoId}`, "_blank", "noopener,noreferrer");
      }
    } catch (watchError) {
      throw new Error(
        watchError.response?.data?.message || "Could not save this watch action.",
        { cause: watchError }
      );
    } finally {
      setWatchedVideoId("");
    }
  };

  const handleFeedback = async (item, feedbackType) => {
    const resolvedProfile = await ensureProfile();
    setFeedbackVideoId(item.videoId || item.title || "pending");

    try {
      await addFeedback(resolvedProfile._id, {
        videoId: item.videoId,
        creator: item.creator,
        genre: item.genre,
        mood: item.mood,
        feedback: feedbackType,
      });
      await refreshProfile();
    } catch (feedbackError) {
      throw new Error(
        feedbackError.response?.data?.message || "Could not save feedback.",
        { cause: feedbackError }
      );
    } finally {
      setFeedbackVideoId("");
    }
  };

  return (
    <div className="space-y-8">
      {/* Redesigned Hero Section (shorter, wider, zero-scroll UX, live recommendations inside) */}
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(6,182,212,0.18),rgba(15,23,42,0.92)_42%,rgba(139,92,246,0.18))] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="space-y-6">
          {/* Title & Query Display */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
                Personal Discovery Engine
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Welcome back, {user?.name ?? "User"}.
              </h1>
            </div>
             {hasSearched && (
              <div className="text-xs text-slate-400 md:text-right flex flex-col md:items-end gap-1">
                <p>
                  User Search: <span className="text-slate-200 font-semibold">{searchedQuery}</span>
                </p>
                {interpretedPreferences && (
                  <p>
                    AI Interpretation:{" "}
                    <span className="text-cyan-400 font-mono">
                      {[
                        ...(interpretedPreferences.genre || []),
                        ...(interpretedPreferences.mood || []),
                        ...(interpretedPreferences.emotion || interpretedPreferences.emotionalState || []),
                        ...(interpretedPreferences.goal || interpretedPreferences.desiredOutcome || []),
                        ...(interpretedPreferences.context || interpretedPreferences.situation || []),
                        ...(interpretedPreferences.activity || []),
                        ...(interpretedPreferences.company || interpretedPreferences.audience || []),
                        ...(interpretedPreferences.energy || [])
                      ]
                        .filter(Boolean)
                        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                        .join(" • ") || "Direct Search"}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Search Input Bar (Near the top of Hero) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                Search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Try: tense sci-fi from emerging creators"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3.5 pl-20 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {error && (
            <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {/* Live Recommendation Grid (Compact Layout directly under search) */}
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Live Recommendations
              </h2>
              <span className="text-xs text-slate-500">{recommendations.length} results</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <RecommendationSkeleton key={index} />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((item, index) => (
                  <RecommendationCard
                    key={item.videoId || item.title || index}
                    item={item}
                    onWatch={handleWatch}
                    onFeedback={handleFeedback}
                    watchPending={watchedVideoId === (item.videoId || item.title)}
                    feedbackPending={feedbackVideoId === (item.videoId || item.title)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/40 p-6 text-center">
                <p className="text-sm font-semibold text-slate-200">
                  {hasSearched
                    ? "No recommendations found for this search."
                    : isProfileEmpty
                    ? "Start searching to build your profile."
                    : "Search for entertainment preferences to generate AI recommendations."}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {hasSearched
                    ? "Try adjusting your search terms or preferences to get matches."
                    : isProfileEmpty
                    ? "We'll build your profile automatically from your search terms, watch actions, and likes/dislikes."
                    : "We'll combine your profile, mood, creators, and watch history into a personalized result set."}
                </p>
              </div>
            )}
          </div>

          {/* Chips Row below Results (max 6-8 chips visible) */}
          {profileChips.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 mb-2">
                Quick Filters
              </p>
              <div className="flex flex-wrap gap-2">
                {profileChips.slice(0, 8).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipToggle(chip)}
                    className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
                      activeChip === chip
                        ? "border-cyan-300 bg-cyan-300 text-slate-950"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lower Section: Preference Pulse (Left) & Profile Stats (Right) */}
      <section className="grid gap-6 md:grid-cols-[1fr_1fr]">
        {/* Preference Pulse */}
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">
              Preference Pulse
            </h2>
            <span className="text-xs text-slate-500">Live</span>
          </div>

          <div className="mt-5 space-y-4">
            {profilePulse.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-medium text-white">{item.value}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{item.detail}</p>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div className={`h-2 rounded-full ${item.tone} ${item.width}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section beside Preference Pulse */}
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300 mb-4">
              Profile Analytics
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className={`mt-2 text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-slate-400">
            <p className="font-semibold uppercase tracking-wider text-cyan-300 mb-1">
              Active Discovery Sync
            </p>
            Your search history, feedback logs, and watch sessions are analyzed locally in real-time to compute your current Preference Pulse.
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
