import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await login(form.email, form.password);
      if (result.success) navigate('/dashboard');
      else setError(result.message || 'Login failed');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">Login to TrekConnect</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-trek-500 focus:border-trek-500 outline-none transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-trek-500 focus:border-trek-500 outline-none transition"
              placeholder="••••••••"
            />
            <p className="mt-1.5 text-right">
              <Link to="/forgot-password" className="text-sm text-trek-600 hover:underline">Forgot password?</Link>
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-trek-600 text-white font-semibold hover:bg-trek-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <p className="text-center text-slate-600 mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-trek-600 font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
