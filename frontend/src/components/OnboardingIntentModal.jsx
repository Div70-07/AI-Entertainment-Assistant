const INTENT_OPTIONS = [
  { id: "focus", label: "Focus / Study", icon: "🎧" },
  { id: "relax", label: "Relaxation", icon: "😌" },
  { id: "workout", label: "Workout", icon: "🏋️" },
  { id: "comedy", label: "Comedy", icon: "😂" },
  { id: "movies", label: "Movies", icon: "🎬" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "family", label: "Family Time", icon: "👨‍👩‍👧" },
  { id: "motivation", label: "Motivation", icon: "🚀" },
  { id: "lateNight", label: "Late Night Chill", icon: "🌙" },
];

function OnboardingIntentModal({
  selectedIntents,
  onToggleIntent,
  onComplete,
  loading,
}) {
  const hasSelection = selectedIntents.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-black/40 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
          Discovery Setup
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          What are you looking for today?
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Choose a few intents to personalize your discovery experience.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {INTENT_OPTIONS.map((intent) => {
            const active = selectedIntents.includes(intent.id);

            return (
              <button
                key={intent.id}
                type="button"
                onClick={() => onToggleIntent(intent.id)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "border-cyan-300 bg-cyan-300/15 text-cyan-200 shadow-lg shadow-cyan-500/10"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <span className="mr-2">{intent.icon}</span>
                {intent.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">
            {hasSelection
              ? `${selectedIntents.length} intent${selectedIntents.length > 1 ? "s" : ""} selected`
              : "Pick at least one intent to generate your starter discovery"}
          </p>
          <button
            type="button"
            onClick={onComplete}
            disabled={!hasSelection || loading}
            className="rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Preparing..." : "Start Exploring"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingIntentModal;
