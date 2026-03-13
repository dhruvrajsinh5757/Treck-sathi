import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = '/api';

export default function TripSearchResults({ trips }) {
  const navigate = useNavigate();

  const handleJoinTrip = async (tripId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_BASE}/trips/${tripId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data?.success) {
        alert('Join request sent successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join trip');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy' || difficulty === 'Moderate') return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    if (difficulty === 'Hard' || difficulty === 'Extreme') return 'bg-red-500/20 text-red-300 border-red-400/40';
    return 'bg-sky-500/20 text-sky-300 border-sky-400/40';
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800/70 rounded-3xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Found {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => {
          const organizerName = trip.createdBy?.name || 'Trip organizer';
          const avatar =
            trip.createdBy?.profilePhoto ||
            `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(organizerName)}`;

          const photo = trip.coverImage?.startsWith('http')
            ? trip.coverImage
            : trip.coverImage
            ? `${window.location.origin}${trip.coverImage}`
            : 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

          const difficulty = trip.difficulty === 'Moderate' ? 'Medium' : trip.difficulty === 'Extreme' ? 'Hard' : trip.difficulty || 'Medium';

          return (
            <div
              key={trip._id}
              className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-emerald-400/50 transition-all group"
            >
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={photo}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getDifficultyColor(difficulty)}`}
                  >
                    {difficulty}
                  </span>
                </div>
                {trip.availableSeats > 0 && (
                  <div className="absolute bottom-3 left-3 bg-emerald-500/90 text-slate-950 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                    {trip.availableSeats} seats left
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-50 line-clamp-1">{trip.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{trip.destination}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>📅 {formatDate(trip.startDate)}</span>
                  {trip.duration > 0 && <span>• {trip.duration} days</span>}
                </div>

                {trip.budget && (
                  <div className="text-sm text-emerald-300 font-semibold">₹{trip.budget.toLocaleString('en-IN')}</div>
                )}

                {/* Organizer */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60">
                  <img
                    src={avatar}
                    alt={organizerName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-slate-400 flex-1 truncate">{organizerName}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleJoinTrip(trip._id)}
                    disabled={trip.availableSeats === 0}
                    className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 text-xs font-semibold hover:from-emerald-300 hover:to-sky-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {trip.availableSeats > 0 ? 'Join Trip' : 'Full'}
                  </button>
                  <button
                    onClick={() => navigate(`/trip/${trip._id}`)}
                    className="px-3 py-2 rounded-xl bg-slate-700/60 text-slate-300 text-xs font-semibold hover:bg-slate-700/80 transition"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
