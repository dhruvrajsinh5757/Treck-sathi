import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/dashboard/Sidebar';
import { getBackendAssetUrl } from '../config.js';

const API_BASE = '/api';

function experienceBadge(level) {
  const styles = {
    Beginner: 'bg-slate-700 text-slate-100',
    Explorer: 'bg-sky-500/10 text-sky-300 border border-sky-400/40',
    Pro: 'bg-amber-400/10 text-amber-300 border border-amber-300/60',
  };
  return styles[level] || styles.Beginner;
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [trekHistory, setTrekHistory] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [busyFollow, setBusyFollow] = useState(false);

  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    loadProfile();
  }, [id, token]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get(`${API_BASE}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success) {
        setProfile(data.user);
        setTrekHistory(data.trekHistory || []);
        setIsFollowing(!!data.isFollowing);
        setFollowersCount(data.user?.followersCount ?? 0);
      } else {
        setError(data?.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!profile?._id) return;
    try {
      setBusyFollow(true);
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const { data } = await axios.post(
        `${API_BASE}/users/${profile._id}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) {
        // Re-fetch profile so followers count and follow state are always correct
        await loadProfile();
      }
    } catch (err) {
      // keep it simple for now
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyFollow(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${profile?._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="rounded-2xl bg-red-900/40 border border-red-500/40 px-4 py-3 text-sm text-red-100">
            {error || 'Profile not found'}
          </div>
        </div>
      </div>
    );
  }

  const avatar =
    profile.profilePhoto ||
    `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(profile.name || 'Trekker')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-4 md:gap-6">
        <Sidebar />

        <main className="flex-1 flex flex-col gap-4 md:gap-6">
          {/* Top Profile Section */}
          <section className="bg-slate-900/70 border border-slate-700/60 rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-800 border-4 border-emerald-400/80 overflow-hidden shadow-lg shadow-emerald-900/40">
                  <img src={avatar} alt={profile.name} className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-50 truncate">
                      {profile.name}
                    </h1>
                    {profile.experienceLevel && (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full ${experienceBadge(
                          profile.experienceLevel
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {profile.experienceLevel}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-slate-300 flex flex-wrap gap-x-3 gap-y-1">
                    {profile.location && <span>📍 {profile.location}</span>}
                    {profile.age ? <span>🎂 {profile.age}</span> : null}
                  </div>
                  {profile.bio && <p className="mt-2 text-sm text-slate-300">{profile.bio}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 md:flex-col md:w-56">
                <button
                  type="button"
                  disabled={busyFollow}
                  onClick={handleToggleFollow}
                  className={`flex-1 px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg transition ${
                    isFollowing
                      ? 'bg-slate-800/80 border border-slate-700/70 text-slate-100 hover:bg-slate-800'
                      : 'bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 hover:from-emerald-300 hover:to-sky-300'
                  } disabled:opacity-60`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  type="button"
                  onClick={handleMessage}
                  className="flex-1 px-4 py-2 rounded-2xl text-sm font-semibold bg-slate-800/70 border border-slate-700/60 text-slate-100 hover:bg-slate-800 transition"
                >
                  Message
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center mt-5">
              <Stat label="Followers" value={followersCount} />
              <Stat label="Following" value={profile.followingCount ?? 0} />
              <Stat label="Treks" value={profile.treksCompleted ?? 0} />
            </div>
          </section>

          {/* Trek History */}
          <section className="bg-slate-900/60 border border-slate-800/70 rounded-3xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-100 tracking-wide">Trek history</h2>
              <p className="text-[11px] text-slate-400">
                {trekHistory.length} {trekHistory.length === 1 ? 'trek' : 'treks'}
              </p>
            </div>

            {trekHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No trek history yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trekHistory.map((t) => {
                  const photo = t.photo?.startsWith('http')
                    ? t.photo
                    : t.photo
                    ? getBackendAssetUrl(t.photo)
                    : 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

                  const diff = t.difficulty === 'Moderate' ? 'Medium' : t.difficulty === 'Extreme' ? 'Hard' : t.difficulty;

                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => navigate(`/trip/${t._id}`)}
                      className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden text-left hover:border-emerald-400/50 hover:bg-slate-800/80 transition"
                    >
                      <div className="h-36 overflow-hidden">
                        <img src={photo} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 space-y-1.5">
                        <p className="text-sm font-semibold text-slate-50 line-clamp-1">{t.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{t.location}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>⚡ {diff || 'Medium'}</span>
                          <span>{t.year || '—'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-800/80 border border-slate-700/70 py-2">
      <p className="text-sm font-semibold text-slate-50">
        {Intl.NumberFormat('en-IN').format(value || 0)}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

