const levelStyles = {
  Beginner: 'bg-slate-700 text-slate-100',
  Explorer: 'bg-sky-500/10 text-sky-300 border border-sky-400/40',
  Pro: 'bg-amber-400/10 text-amber-300 border border-amber-300/60',
};

export default function ProfileSummary({ user, onEditProfile }) {
  const levelClass = levelStyles[user.experienceLevel] || levelStyles.Beginner;

  return (
    <section className="bg-slate-900/70 border border-slate-700/60 rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6">
      {/* Avatar + basic info */}
      <div className="flex gap-4 sm:gap-5 flex-1">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-800 border-4 border-emerald-400/80 overflow-hidden shadow-lg shadow-emerald-900/50">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-semibold rounded-full px-2 py-0.5 shadow">
            Online
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-50">
              {user.name}
            </h1>
            <p className="text-xs text-emerald-300/90">{user.username}</p>
          </div>
          {user.bio && (
            <p className="mt-2 text-sm text-slate-300 line-clamp-2">{user.bio}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full ${levelClass}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {user.experienceLevel} level
            </span>
          </div>
        </div>
      </div>

      {/* Stats + button */}
      <div className="flex flex-col justify-between gap-3 sm:w-60">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Followers" value={user.followers} />
          <Stat label="Following" value={user.following} />
          <Stat label="Treks" value={user.treksCompleted} />
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          disabled={!onEditProfile}
          className="inline-flex justify-center items-center px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 shadow-lg shadow-emerald-900/40 hover:from-emerald-300 hover:to-sky-300 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          Edit Profile
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-800/80 border border-slate-700/70 py-2">
      <p className="text-sm font-semibold text-slate-50">
        {Intl.NumberFormat('en-IN').format(value)}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

