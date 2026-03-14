import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/dashboard/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getBackendAssetUrl } from '../config.js';

const API_BASE = '/api';

const LIFECYCLE_TABS = [
  { id: 'running', label: 'Running trips' },
  { id: 'planned', label: 'Upcoming trips' },
  { id: 'completed', label: 'Completed trips' },
];

export default function MyTrips() {
  const { user } = useAuth();
  const [lifecycle, setLifecycle] = useState('running');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const heading = useMemo(() => {
    const current = LIFECYCLE_TABS.find((t) => t.id === lifecycle);
    return current?.label || 'My trips';
  }, [lifecycle]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          setTrips([]);
          setError('You need to be logged in to view your trips.');
          return;
        }

        const { data } = await axios.get(`${API_BASE}/trips/my`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { lifecycle },
        });

        if (data?.success) {
          setTrips(data.trips || []);
        } else {
          setError(data?.message || 'Failed to load your trips');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your trips');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [lifecycle]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-4 md:gap-6">
        <Sidebar />

        <main className="flex-1 flex flex-col gap-4 md:gap-6">
          {/* Top bar, visually similar to Search page */}
          <section className="bg-slate-900/70 border border-slate-700/60 rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/90 mb-1">
                    My trips
                  </p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-50">
                    {heading}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Trips you created or joined as a trekker.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {LIFECYCLE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLifecycle(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      lifecycle === tab.id
                        ? 'bg-gradient-to-r from-emerald-500/90 to-sky-500/90 text-slate-950 shadow-lg'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    {tab.id === 'running' && '⏱ '}
                    {tab.id === 'planned' && '🧭 '}
                    {tab.id === 'completed' && '✅ '}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl bg-red-900/40 border border-red-500/40 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <section className="bg-slate-900/60 border border-slate-800/70 rounded-3xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p className="text-lg font-medium">
                  {lifecycle === 'running' && 'No running trips right now.'}
                  {lifecycle === 'planned' && 'No upcoming trips yet.'}
                  {lifecycle === 'completed' && 'No completed trips yet.'}
                </p>
                <p className="text-sm mt-2">
                  {lifecycle === 'planned'
                    ? 'Create a trip or join one from Search to see it here.'
                    : 'You will see your trips here once they match this status.'}
                </p>
              </div>
            ) : (
              <MyTripsGrid trips={trips} userId={user?._id} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function MyTripsGrid({ trips }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-100">
          {trips.length} {trips.length === 1 ? 'trip' : 'trips'} in this list
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <MyTripCard key={trip._id} trip={trip} />
        ))}
      </div>
    </div>
  );
}

function MyTripCard({ trip }) {
  const photo = trip.coverImage?.startsWith('http')
    ? trip.coverImage
    : trip.coverImage
    ? getBackendAssetUrl(trip.coverImage)
    : 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const status = trip.lifecycleStatus || 'planned';
  const statusLabel =
    status === 'running' ? 'Running' : status === 'completed' ? 'Completed' : 'Planned';

  const statusClass =
    status === 'running'
      ? 'bg-sky-400/15 text-sky-200 border-sky-400/30'
      : status === 'completed'
      ? 'bg-emerald-400/15 text-emerald-200 border-emerald-400/30'
      : 'bg-amber-400/15 text-amber-200 border-amber-400/30';

  const participantsCount = trip.participants?.length || 0;
  const seats =
    typeof trip.availableSeats === 'number'
      ? Math.max(0, trip.availableSeats)
      : null;

  const handleOpen = () => {
    window.location.href = `/trip/${trip._id}`;
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-emerald-400/60 transition-all group">
      <div className="relative h-40 overflow-hidden">
        <img
          src={photo}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>
        {seats !== null && (
          <div className="absolute bottom-3 left-3 bg-emerald-500/90 text-slate-950 px-2.5 py-1 rounded-full text-[11px] font-semibold">
            {seats} slots left
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-50 line-clamp-1">
            {trip.title || trip.destination}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
            {trip.destination}
          </p>
        </div>

        <p className="text-[11px] text-slate-400">
          {formatDate(trip.startDate)} – {formatDate(trip.endDate)}{' '}
          {trip.duration ? `• ${trip.duration} days` : ''}
        </p>

        <p className="text-[11px] text-slate-400">
          {participantsCount} joined
          {seats !== null ? ` • ${seats} remaining` : ''}
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleOpen}
            className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 text-xs font-semibold hover:from-emerald-300 hover:to-sky-300 transition"
          >
            Open trip
          </button>
        </div>
      </div>
    </div>
  );
}

