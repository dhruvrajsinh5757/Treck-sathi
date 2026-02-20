import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) =>
    location.pathname === path ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100';

  return (
    <aside className="hidden md:flex flex-col w-56 flex-shrink-0 rounded-2xl bg-white shadow-sm border border-slate-100 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-2 px-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-trek-600 to-sky-500 flex items-center justify-center text-white text-sm font-bold">
          TC
        </div>
        <span className="font-semibold tracking-tight text-slate-900">TrekConnect</span>
      </div>

      <nav className="flex-1 space-y-1 text-sm">
        <SidebarItem to="/dashboard" icon="🏠" label="Dashboard" activeClass={isActive('/dashboard')} />
        <SidebarItem to="/my-trips" icon="🧭" label="My Trips" activeClass={isActive('/my-trips')} />
        <SidebarItem to="/create-trip" icon="➕" label="Create Trip" activeClass={isActive('/create-trip')} />
        <SidebarItem to="/profile" icon="👤" label="Profile" activeClass={isActive('/profile')} />
      </nav>

      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition"
      >
        <span>⏏</span>
        <span>Logout</span>
      </button>
    </aside>
  );
}

function SidebarItem({ to, icon, label, activeClass }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${activeClass}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

