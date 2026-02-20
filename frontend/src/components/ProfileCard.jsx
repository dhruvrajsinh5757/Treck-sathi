export default function ProfileCard({ user, compact = false }) {
  const initials = (user?.name || 'Trekker')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const photo =
    user?.profilePhoto ||
    `https://ui-avatars.com/api/?background=0f172a&color=fff&name=${encodeURIComponent(
      user?.name || 'Trekker'
    )}`;

  return (
    <div className={`flex items-center ${compact ? 'gap-3' : 'gap-4'}`}>
      <div className="relative">
        {user?.profilePhoto ? (
          <img
            src={photo}
            alt={user?.name}
            className={`rounded-full object-cover border-2 border-trek-400 ${
              compact ? 'w-10 h-10' : 'w-16 h-16'
            }`}
          />
        ) : (
          <div
            className={`rounded-full border-2 border-trek-400 bg-trek-100 text-trek-700 flex items-center justify-center font-semibold ${
              compact ? 'w-10 h-10 text-xs' : 'w-16 h-16 text-base'
            }`}
          >
            {initials}
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        {user?.fitnessLevel && (
          <p className="text-xs text-slate-500 mt-0.5">
            Fitness:{' '}
            <span className="font-medium text-slate-700">{user.fitnessLevel}</span>
          </p>
        )}
        {!compact && (
          <button
            type="button"
            className="mt-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

