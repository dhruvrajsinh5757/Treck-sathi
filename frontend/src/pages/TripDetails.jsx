import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/dashboard/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getBackendAssetUrl } from '../config.js';

const API_BASE = '/api';

export default function TripDetails() {
  const { id } = useParams();
  const { user: authUser, token: authToken } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [updatingTrip, setUpdatingTrip] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');

  const token = useMemo(() => authToken || localStorage.getItem('token'), [authToken]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const { data } = await axios.get(`${API_BASE}/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.success) {
          setTrip(data.trip);
        } else {
          setError(data?.message || 'Failed to load trip');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token]);

  const isOrganizer = useMemo(() => {
    if (!authUser?._id || !trip?.createdBy?._id) return false;
    return String(authUser._id) === String(trip.createdBy._id);
  }, [authUser?._id, trip?.createdBy?._id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const canJoin =
    !joining &&
    trip?.lifecycleStatus !== 'running' &&
    trip?.lifecycleStatus !== 'completed' &&
    !(typeof trip?.availableSeats === 'number' && trip.availableSeats <= 0);

  const handleJoin = async () => {
    try {
      setJoining(true);
      const { data } = await axios.post(
        `${API_BASE}/join/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) {
        // Reload trip to refresh seats/participants
        const res = await axios.get(`${API_BASE}/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) setTrip(res.data.trip);
        alert(data.message || 'Joined trip successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join trip');
    } finally {
      setJoining(false);
    }
  };

  const handleStartTrip = async () => {
    try {
      setUpdatingTrip(true);
      const { data } = await axios.post(
        `${API_BASE}/trips/${id}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) setTrip(data.trip);
      else alert(data?.message || 'Failed to start trip');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start trip');
    } finally {
      setUpdatingTrip(false);
    }
  };

  const handleCompleteTrip = async () => {
    try {
      setUpdatingTrip(true);
      const { data } = await axios.post(
        `${API_BASE}/trips/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) setTrip(data.trip);
      else alert(data?.message || 'Failed to complete trip');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete trip');
    } finally {
      setUpdatingTrip(false);
    }
  };

  const handleAddChecklist = async (e) => {
    e?.preventDefault?.();
    const text = String(newChecklistText || '').trim();
    if (!text) return;
    try {
      setUpdatingTrip(true);
      const { data } = await axios.post(
        `${API_BASE}/trips/${id}/checklist`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) {
        setTrip(data.trip);
        setNewChecklistText('');
      } else {
        alert(data?.message || 'Failed to add checklist');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add checklist');
    } finally {
      setUpdatingTrip(false);
    }
  };

  const handleToggleChecklist = async (itemId, nextDone) => {
    try {
      setUpdatingTrip(true);
      const { data } = await axios.patch(
        `${API_BASE}/trips/${id}/checklist/${itemId}`,
        { done: nextDone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) setTrip(data.trip);
      else alert(data?.message || 'Failed to update checklist');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update checklist');
    } finally {
      setUpdatingTrip(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
          <Sidebar />
          <div className="mt-4 rounded-2xl bg-red-900/40 border border-red-500/40 px-4 py-3 text-sm text-red-100">
            {error || 'Trip not found'}
          </div>
        </div>
      </div>
    );
  }

  const photo = trip.coverImage?.startsWith('http')
    ? trip.coverImage
    : trip.coverImage
    ? getBackendAssetUrl(trip.coverImage)
    : 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

  const organizerName = trip.createdBy?.name || 'Trip organizer';
  const organizerAvatar =
    trip.createdBy?.profilePhoto ||
    `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(organizerName)}`;

  const difficulty =
    trip.difficulty === 'Moderate' ? 'Medium' : trip.difficulty === 'Extreme' ? 'Hard' : trip.difficulty || 'Medium';

  const statusLabel =
    trip.lifecycleStatus === 'running'
      ? 'Running'
      : trip.lifecycleStatus === 'completed'
      ? 'Completed'
      : 'Planned';

  const statusPillClass =
    trip.lifecycleStatus === 'running'
      ? 'bg-sky-400/15 text-sky-200 border-sky-400/30'
      : trip.lifecycleStatus === 'completed'
      ? 'bg-emerald-400/15 text-emerald-200 border-emerald-400/30'
      : 'bg-amber-400/15 text-amber-200 border-amber-400/30';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-4 md:gap-6">
        <Sidebar />

        <main className="flex-1 flex flex-col gap-4 md:gap-6">
          {/* Hero */}
          <section className="bg-slate-900/70 border border-slate-700/60 rounded-3xl overflow-hidden shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="relative h-56 sm:h-72">
              <img src={photo} alt={trip.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/90 mb-1">Trip detail</p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-50">
                    {trip.title}
                  </h1>
                  <p className="text-sm text-slate-300 mt-1">{trip.destination}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}{' '}
                    {trip.duration ? `• ${trip.duration} days` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${statusPillClass}`}>
                      {statusLabel}
                      {trip.lifecycleStatus === 'running' && trip.startedAt ? ` • started ${formatDate(trip.startedAt)}` : ''}
                      {trip.lifecycleStatus === 'completed' && trip.endedAt ? ` • ended ${formatDate(trip.endedAt)}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-900/80 rounded-2xl px-3 py-2 border border-slate-700/70">
                    <img
                      src={organizerAvatar}
                      alt={organizerName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-50 truncate">{organizerName}</p>
                      {trip.createdBy?.location && (
                        <p className="text-[10px] text-slate-400 truncate">{trip.createdBy.location}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={
                      !canJoin
                    }
                    className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 shadow-lg shadow-emerald-900/40 hover:from-emerald-300 hover:to-sky-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {trip.lifecycleStatus === 'completed'
                      ? 'Completed'
                      : trip.lifecycleStatus === 'running'
                      ? 'Running'
                      : typeof trip.availableSeats === 'number' && trip.availableSeats <= 0
                      ? 'Full'
                      : joining
                      ? 'Joining...'
                      : 'Join trip'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
            {/* Left column */}
            <div className="space-y-4">
              <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-slate-100 mb-2">Overview</h2>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">
                  {trip.description || 'No description provided.'}
                </p>
              </div>

              <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-slate-100 mb-2">What to expect</h2>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <Info label="Difficulty" value={difficulty} />
                  <Info label="Trip type" value={trip.tripType || 'Trek'} />
                  <Info
                    label="Required experience"
                    value={trip.requiredExperience || 'Beginner'}
                  />
                  <Info label="Required fitness" value={trip.requiredFitness || 'Medium'} />
                  <Info
                    label="Age range"
                    value={
                      trip.minAge || trip.maxAge
                        ? `${trip.minAge || '-'} – ${trip.maxAge || '-'}`
                        : 'Any'
                    }
                  />
                  <Info
                    label="Gender preference"
                    value={trip.genderPreference || 'No preference'}
                  />
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 sm:p-5 space-y-2">
                <h2 className="text-sm font-semibold text-slate-100">Itinerary & safety</h2>
                {trip.thingsToCarry && (
                  <DetailBlock title="Things to carry" text={trip.thingsToCarry} />
                )}
                {trip.safetyGuidelines && (
                  <DetailBlock title="Safety guidelines" text={trip.safetyGuidelines} />
                )}
                {trip.cancellationPolicy && (
                  <DetailBlock title="Cancellation policy" text={trip.cancellationPolicy} />
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Organizer controls */}
              {isOrganizer && (
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 sm:p-5">
                  <h2 className="text-sm font-semibold text-slate-100 mb-3">Trip handler</h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleStartTrip}
                      disabled={updatingTrip || trip.lifecycleStatus === 'running' || trip.lifecycleStatus === 'completed'}
                      className="px-3 py-2 rounded-2xl text-xs font-semibold bg-sky-400 text-slate-950 hover:bg-sky-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {trip.lifecycleStatus === 'running' ? 'Running' : 'Start trip'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteTrip}
                      disabled={updatingTrip || trip.lifecycleStatus === 'completed'}
                      className="px-3 py-2 rounded-2xl text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {trip.lifecycleStatus === 'completed' ? 'Completed' : 'Mark completed'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Start to mark as <span className="text-sky-200">running</span>, complete to move it to <span className="text-emerald-200">completed</span>.
                  </p>
                </div>
              )}

              <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-slate-100 mb-3">Trip stats</h2>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Stat label="Budget" value={trip.budget ? `₹${trip.budget.toLocaleString('en-IN')}` : 'N/A'} />
                  <Stat
                    label="Max members"
                    value={trip.maxMembers ? `${trip.maxMembers}` : 'Not specified'}
                  />
                  <Stat
                    label="Available seats"
                    value={
                      typeof trip.availableSeats === 'number'
                        ? Math.max(0, trip.availableSeats)
                        : 'N/A'
                    }
                  />
                  <Stat
                    label="Participants"
                    value={trip.participants?.length ? `${trip.participants.length}` : '1'}
                  />
                </div>
              </div>

              {/* Joined trekkers */}
              <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Who joined</h2>
                  <p className="text-[11px] text-slate-400">
                    {trip.participants?.length || 0} joined
                    {typeof trip.availableSeats === 'number' ? ` • ${Math.max(0, trip.availableSeats)} slots left` : ''}
                  </p>
                </div>
                <div className="space-y-2">
                  {(trip.participants || []).slice(0, 8).map((p) => {
                    const name = p?.name || 'Trekker';
                    const avatar =
                      p?.profilePhoto ||
                      `https://ui-avatars.com/api/?background=0f172a&color=fff&name=${encodeURIComponent(name)}`;
                    return (
                      <div key={p?._id || name} className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/50 px-3 py-2">
                        <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-50 truncate">{name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {p?.fitnessLevel ? `Fitness: ${p.fitnessLevel}` : 'Fitness: N/A'}
                            {p?.location ? ` • ${p.location}` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {(trip.participants || []).length === 0 && (
                    <p className="text-xs text-slate-400">No participants yet.</p>
                  )}
                  {(trip.participants || []).length > 8 && (
                    <p className="text-[11px] text-slate-400">
                      Showing 8 of {trip.participants.length}. (You can extend this list if you want.)
                    </p>
                  )}
                </div>
              </div>

              {/* Trip checklist / to-do */}
              <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-slate-100 mb-3">Trip checklist</h2>

                {isOrganizer && (
                  <form onSubmit={handleAddChecklist} className="flex gap-2 mb-3">
                    <input
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="Add a to-do (e.g., confirm permits)"
                      className="flex-1 rounded-2xl bg-slate-950/50 border border-slate-700/70 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                    />
                    <button
                      type="submit"
                      disabled={updatingTrip || !String(newChecklistText || '').trim()}
                      className="px-3 py-2 rounded-2xl text-xs font-semibold bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  {(trip.checklist || []).map((item) => (
                    <label
                      key={item?._id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/50 px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={!!item?.done}
                        disabled={!isOrganizer || updatingTrip}
                        onChange={(e) => handleToggleChecklist(item._id, e.target.checked)}
                        className="mt-0.5"
                      />
                      <span className={`text-xs ${item?.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {item?.text}
                      </span>
                    </label>
                  ))}
                  {(trip.checklist || []).length === 0 && (
                    <p className="text-xs text-slate-400">
                      {isOrganizer ? 'Add your first checklist item.' : 'No checklist added yet.'}
                    </p>
                  )}
                </div>
              </div>

              {trip.meetingPoint && (
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 sm:p-5">
                  <h2 className="text-sm font-semibold text-slate-100 mb-1">Meeting point</h2>
                  <p className="text-xs text-slate-300">{trip.meetingPoint}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Transport: {trip.transportMode || 'Bus'}
                  </p>
                </div>
              )}

              {trip.emergencyContact && (
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 sm:p-5">
                  <h2 className="text-sm font-semibold text-red-300 mb-1">Emergency contact</h2>
                  <p className="text-xs text-slate-200">{trip.emergencyContact}</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-xs font-medium text-slate-100 mt-0.5">{value}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-700/70 px-3 py-2">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-50 mt-0.5">{value}</p>
    </div>
  );
}

function DetailBlock({ title, text }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-200 mb-0.5">{title}</p>
      <p className="text-xs text-slate-300 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

