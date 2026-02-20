import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏔️' },
  { to: '/create-trip', label: 'Create Trip', icon: '➕' },
  { to: '/search', label: 'Search', icon: '🔎' },
  { to: '/my-trips', label: 'My Trips', icon: '🧭' },
  { to: '/messages', label: 'Messages', icon: '💬' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar() {
  return (
    <aside className="hidden sm:flex flex-col w-60 flex-shrink-0 rounded-3xl bg-slate-900/70 border border-slate-700/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl p-4 gap-4">
      <div className="flex items-center gap-3 px-2 pt-1">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 via-sky-400 to-teal-500 flex items-center justify-center text-slate-900 font-black text-sm">
          TC
        </div>
        <div>
          <p className="font-semibold tracking-tight text-slate-50">TrekConnect</p>
          <p className="text-[11px] text-slate-400">Find your next trail crew</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1 text-sm mt-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-2xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/90 to-sky-500/90 text-slate-950 shadow-lg shadow-emerald-900/40'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition">
        <span>⏏</span>
        <span>Logout</span>
      </button>
    </aside>
  );
}

