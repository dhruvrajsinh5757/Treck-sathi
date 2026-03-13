import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/dashboard/Sidebar';

const API_BASE = '/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.success) setNotifications(data.notifications || []);

        // Mark all as read (best-effort)
        await axios.post(
          `${API_BASE}/notifications/read-all`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-4 md:gap-6">
        <Sidebar />

        <main className="flex-1 flex flex-col gap-4 md:gap-6">
          <section className="bg-slate-900/70 border border-slate-700/60 rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold text-slate-50">Notifications</h1>
              <span className="text-[11px] text-slate-400">
                {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No notifications yet.</div>
            ) : (
              <ul className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {notifications.map((n) => {
                  const actor = n.actorId;
                  const avatar =
                    actor?.profilePhoto ||
                    `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(
                      actor?.name || 'User'
                    )}`;

                  return (
                    <li
                      key={n._id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60"
                    >
                      <img
                        src={avatar}
                        alt={actor?.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-50 truncate">{n.message}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

