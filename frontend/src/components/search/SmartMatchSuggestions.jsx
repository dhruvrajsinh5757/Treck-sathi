import { useNavigate } from 'react-router-dom';
import { getBackendAssetUrl } from '../../config.js';

export default function SmartMatchSuggestions({ suggestions }) {
  const navigate = useNavigate();

  if (!suggestions || suggestions.length === 0) {
    return (
      <section className="bg-slate-900/60 border border-slate-800/70 rounded-3xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">🤖 Smart Match Suggestions</h2>
        <p className="text-slate-400 text-sm">No suggestions available at the moment. Start searching to find matches!</p>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/60 border border-slate-800/70 rounded-3xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">🤖 Smart Match Suggestions</h2>
      <p className="text-sm text-slate-400 mb-4">
        Based on your profile and preferences, we found these matches for you:
      </p>

      <div className="space-y-4">
        {suggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4"
          >
            <h3 className="text-sm font-semibold text-emerald-300 mb-3">{suggestion.title}</h3>

            {suggestion.type === 'destination' && suggestion.trips && (
              <div className="grid gap-3 md:grid-cols-2">
                {suggestion.trips.slice(0, 4).map((trip) => {
                  const organizerName = trip.createdBy?.name || 'Trip organizer';
                  const avatar =
                    trip.createdBy?.profilePhoto ||
                    `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(organizerName)}`;

                  const photo = trip.coverImage?.startsWith('http')
                    ? trip.coverImage
                    : trip.coverImage
                    ? `${window.location.origin}${trip.coverImage}`
                    : 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

                  return (
                    <div
                      key={trip._id}
                      className="flex gap-3 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 transition cursor-pointer"
                      onClick={() => navigate(`/trip/${trip._id}`)}
                    >
                      <img
                        src={photo}
                        alt={trip.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-50 truncate">{trip.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{trip.destination}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={avatar}
                            alt={organizerName}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-[10px] text-slate-400 truncate">{organizerName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {suggestion.type === 'experience' && suggestion.users && (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {suggestion.users.slice(0, 6).map((user) => {
                  const avatar =
                    user.profilePhoto ||
                    `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(user.name || 'Trekker')}`;

                  return (
                    <div
                      key={user._id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 transition cursor-pointer"
                      onClick={() => navigate(`/u/${user._id}`)}
                    >
                      <img
                        src={avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-50 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {user.treksCompleted || 0} treks • {user.location || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {suggestion.type === 'preferences' && suggestion.trips && (
              <div className="grid gap-3 md:grid-cols-2">
                {suggestion.trips.slice(0, 4).map((trip) => {
                  const organizerName = trip.createdBy?.name || 'Trip organizer';
                  const avatar =
                    trip.createdBy?.profilePhoto ||
                    `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(organizerName)}`;

                  const photo = trip.coverImage?.startsWith('http')
                    ? trip.coverImage
                    : trip.coverImage
                    ? getBackendAssetUrl(trip.coverImage)
                    : 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

                  return (
                    <div
                      key={trip._id}
                      className="flex gap-3 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 transition cursor-pointer"
                      onClick={() => navigate(`/trip/${trip._id}`)}
                    >
                      <img
                        src={photo}
                        alt={trip.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-50 truncate">{trip.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{trip.destination}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={avatar}
                            alt={organizerName}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-[10px] text-slate-400 truncate">{organizerName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
