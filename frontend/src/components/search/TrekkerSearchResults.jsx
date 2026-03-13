import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = '/api';

export default function TrekkerSearchResults({ trekkers }) {
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);
  const [followed, setFollowed] = useState(() => new Set());

  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      setBusyId(userId);
      const isFollowing = followed.has(userId);
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const { data } = await axios.post(
        `${API_BASE}/users/${userId}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) {
        setFollowed((prev) => {
          const next = new Set(prev);
          if (isFollowing) next.delete(userId);
          else next.add(userId);
          return next;
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to follow user');
    } finally {
      setBusyId(null);
    }
  };

  const handleMessage = (userId) => {
    navigate(`/messages?user=${userId}`);
  };

  const getExperienceBadge = (level) => {
    const styles = {
      Beginner: 'bg-slate-700 text-slate-100',
      Explorer: 'bg-sky-500/10 text-sky-300 border border-sky-400/40',
      Pro: 'bg-amber-400/10 text-amber-300 border border-amber-300/60',
    };
    return styles[level] || styles.Beginner;
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800/70 rounded-3xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Found {trekkers.length} {trekkers.length === 1 ? 'Trekker' : 'Trekkers'}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trekkers.map((trekker) => {
          const isFollowing = followed.has(trekker._id);
          const avatar =
            trekker.profilePhoto ||
            `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(trekker.name || 'Trekker')}`;

          return (
            <div
              key={trekker._id}
              className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 hover:border-emerald-400/50 transition-all cursor-pointer"
              onClick={() => navigate(`/u/${trekker._id}`)}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={avatar}
                    alt={trekker.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400/50"
                  />
                  {trekker.profilePhoto && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-semibold rounded-full px-1.5 py-0.5">
                      ✓
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-50 truncate">{trekker.name}</h3>
                  {trekker.location && (
                    <p className="text-xs text-slate-400 mt-0.5">📍 {trekker.location}</p>
                  )}
                  {trekker.age && (
                    <p className="text-xs text-slate-400">Age: {trekker.age}</p>
                  )}

                  {/* Experience Badge */}
                  {trekker.experienceLevel && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full mt-2 ${getExperienceBadge(trekker.experienceLevel)}`}
                    >
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      {trekker.experienceLevel}
                    </span>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>🏔️ {trekker.treksCompleted || 0} treks</span>
                    {trekker.fitnessLevel && <span>💪 {trekker.fitnessLevel}</span>}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {trekker.bio && (
                <p className="text-xs text-slate-300 mt-3 line-clamp-2">{trekker.bio}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/60">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(trekker._id);
                  }}
                  disabled={busyId === trekker._id}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                    isFollowing
                      ? 'bg-slate-700/70 text-slate-100 hover:bg-slate-700/90'
                      : 'bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 hover:from-emerald-300 hover:to-sky-300'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessage(trekker._id);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-700/60 text-slate-300 text-xs font-semibold hover:bg-slate-700/80 transition"
                >
                  Message
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
