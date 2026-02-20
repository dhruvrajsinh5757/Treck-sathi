import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-trek-700 tracking-tight">
            TrekConnect
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="flex items-center gap-1 text-slate-600 hover:text-trek-600 transition">
              <span>🏠</span>
              <span>Home</span>
            </Link>
            <Link to="/about" className="flex items-center gap-1 text-slate-600 hover:text-trek-600 transition">
              <span>ℹ️</span>
              <span>About</span>
            </Link>
            <Link to="/trips" className="flex items-center gap-1 text-slate-600 hover:text-trek-600 transition">
              <span>🏔️</span>
              <span>Trips</span>
            </Link>
            <Link to="/contact" className="flex items-center gap-1 text-slate-600 hover:text-trek-600 transition">
              <span>📩</span>
              <span>Contact</span>
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1 text-slate-600 hover:text-trek-600 transition"
                >
                  <span>📷</span>
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition"
                >
                  <span>⏏</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-trek-600 text-white font-medium hover:bg-trek-700 transition"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg border border-trek-600 text-trek-600 font-medium hover:bg-trek-50 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-slate-200 flex flex-col gap-2">
            <Link
              to="/"
              className="py-2 text-slate-600 flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <span>🏠</span>
              <span>Home</span>
            </Link>
            <Link
              to="/about"
              className="py-2 text-slate-600 flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <span>ℹ️</span>
              <span>About</span>
            </Link>
            <Link
              to="/trips"
              className="py-2 text-slate-600 flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <span>🏔️</span>
              <span>Trips</span>
            </Link>
            <Link
              to="/contact"
              className="py-2 text-slate-600 flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <span>📩</span>
              <span>Contact</span>
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="py-2 text-slate-600 flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <span>📷</span>
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-2 text-left text-red-600 flex items-center gap-2"
                >
                  <span>⏏</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="py-2 text-trek-600 font-medium"
                  onClick={() => setOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="py-2 text-trek-600 font-medium"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
