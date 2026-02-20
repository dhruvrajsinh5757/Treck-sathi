export default function TrekCard({ trek, onEdit, onDelete }) {
  const {
    name,
    location,
    difficulty,
    durationDays,
    year,
    photos = [],
  } = trek;

  const cover = photos[0];

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt={name}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="w-full h-52 bg-gradient-to-tr from-trek-600 via-emerald-500 to-sky-500 flex items-center justify-center text-white text-lg font-semibold tracking-wide">
            {name || 'Completed Trek'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 truncate">{name}</h3>
          {year && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {year}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">
          📍 {location || 'Unknown location'}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-trek-500" />
            Difficulty: <span className="font-semibold">{difficulty || 'N/A'}</span>
          </span>
          {durationDays && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100">
              ⏱ {durationDays} days
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onEdit}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

