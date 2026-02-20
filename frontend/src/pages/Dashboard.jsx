import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import ProfileSummary from '../components/dashboard/ProfileSummary';

const API_BASE = '/api';

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripsError, setTripsError] = useState('');

  const fallbackAvatar =
    authUser?.profilePhoto ||
    `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(
      authUser?.name || 'TrekConnect User'
    )}`;

  const displayName = authUser?.name || 'TrekConnect Explorer';
  const usernameBase =
    authUser?.name?.split(' ')[0] ||
    authUser?.email?.split('@')[0] ||
    'trekker';

  const myTrips = useMemo(
    () => trips.filter((t) => t.createdBy?._id === authUser?._id),
    [trips, authUser?._id]
  );

  const treksCompleted = myTrips.length;

  const experienceLevel = useMemo(() => {
    if (!treksCompleted || treksCompleted <= 1) return 'Beginner';
    if (treksCompleted <= 5) return 'Explorer';
    return 'Pro';
  }, [treksCompleted]);

  const profileUser = {
    name: displayName,
    username: `@${usernameBase.toLowerCase()}`,
    bio: authUser?.bio || 'Add a short bio about your trekking journey.',
    avatar: fallbackAvatar,
    followers: authUser?.followersCount ?? 0,
    following: authUser?.followingCount ?? 0,
    treksCompleted,
    experienceLevel, // Beginner | Explorer | Pro
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadingTrips(false);
      return;
    }

    async function fetchTrips() {
      try {
        setLoadingTrips(true);
        const { data } = await axios.get(`${API_BASE}/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.success) {
          setTrips(data.trips || []);
          setTripsError('');
        } else {
          setTripsError(data?.message || 'Failed to load trips');
        }
      } catch (err) {
        setTripsError(err.response?.data?.message || 'Failed to load trips');
      } finally {
        setLoadingTrips(false);
      }
    }

    fetchTrips();
  }, []);

  const mapTripToCard = (trip) => {
    const organizerName = trip.createdBy?.name || 'Trip organizer';
    const avatar =
      trip.createdBy?.profilePhoto ||
      `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(
        organizerName
      )}`;

    const difficulty =
      trip.difficulty === 'Moderate'
        ? 'Medium'
        : trip.difficulty === 'Extreme'
        ? 'Hard'
        : trip.difficulty || 'Medium';

    const photo = trip.coverImage?.startsWith('http')
      ? trip.coverImage
      : trip.coverImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

    return {
      id: trip._id,
      name: trip.title || trip.destination,
      location: trip.destination,
      difficulty,
      photo,
      organizer: {
        name: organizerName,
        avatar,
      },
    };
  };

  const myTreks = myTrips.map(mapTripToCard) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-4 md:gap-6">
        <Sidebar />

        <main className="flex-1 flex flex-col gap-4 md:gap-6">
          <ProfileSummary user={profileUser} />

          {/* My trips section */}
          {tripsError && (
            <div className="rounded-2xl bg-red-900/40 border border-red-500/40 px-4 py-2 text-sm text-red-100">
              {tripsError}
            </div>
          )}

          {myTreks.length > 0 && (
            <section className="bg-slate-900/60 border border-slate-800/70 rounded-3xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
                  My trips
                </h2>
                <p className="text-[11px] text-slate-400">
                  Trips you created in the Create Trip page.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {myTreks.map((trek) => (
                  <TrekFeedCardWrapper key={trek.id} trek={trek} />
                ))}
              </div>
            </section>
          )}

          {loadingTrips && (
            <div className="flex items-center justify-center py-4">
              <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Small wrapper so we can reuse TrekCard styles for My trips
import TrekCard from '../components/dashboard/TrekCard';

function TrekFeedCardWrapper({ trek }) {
  return <TrekCard trek={trek} />;
}

