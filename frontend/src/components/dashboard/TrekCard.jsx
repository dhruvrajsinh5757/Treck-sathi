import { useState } from 'react';

export default function TrekCard({ trek }) {
  const [liked, setLiked] = useState(false);

  const difficultyColor =
    trek.difficulty === 'Easy'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
      : trek.difficulty === 'Medium'
      ? 'bg-amber-500/15 text-amber-300 border-amber-400/40'
      : 'bg-rose-500/15 text-rose-300 border-rose-400/40';

  return (
    <article className="group rounded-3xl overflow-hidden bg-slate-900/70 border border-slate-800/80 shadow-[0_18px_40px_rgba(0,0,0,0.6)] flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={trek.photo}
          alt={trek.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-50 drop-shadow">
              {trek.name}
            </h3>
            <p className="text-[11px] text-slate-200 flex items-center gap-1 drop-shadow">
              <span className="text-emerald-300">📍</span>
              <span>{trek.location}</span>
            </p>
          </div>
          <span
            className={`text-[11px] px-2.5 py-1 rounded-full border ${difficultyColor}`}
          >
            {trek.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-3">
        {/* Organizer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={trek.organizer.avatar}
              alt={trek.organizer.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <div>
              <p className="text-xs font-medium text-slate-100">
                {trek.organizer.name}
              </p>
              <p className="text-[11px] text-slate-400">Organizer</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 shadow hover:from-emerald-300 hover:to-sky-300 transition-transform hover:-translate-y-0.5"
              type="button"
            >
              Join
            </button>
            <button
              className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1 border transition ${
                liked
                  ? 'border-rose-400/80 text-rose-300 bg-rose-500/10'
                  : 'border-slate-600 text-slate-200 hover:border-rose-400/70 hover:text-rose-300'
              }`}
              type="button"
              onClick={() => setLiked((v) => !v)}
            >
              <span>{liked ? '♥' : '♡'}</span>
              <span>Like</span>
            </button>
            <button
              className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-slate-600 text-slate-200 hover:border-sky-400/80 hover:text-sky-300 transition"
              type="button"
            >
              💬 Comment
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

