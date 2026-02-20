import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = '/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid or missing reset link.');
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    const { newPassword, confirmPassword } = form;
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_BASE}/auth/reset-password`, {
        token,
        newPassword,
        confirmPassword,
      });
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Reset failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-trek-100 text-trek-600 flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Password updated</h2>
            <p className="text-slate-600">Redirecting you to login...</p>
            <div className="w-10 h-10 border-4 border-trek-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[60vh] py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link to="/forgot-password" className="text-trek-600 font-medium hover:underline">Request a new link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">Set new password</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-trek-500 focus:border-trek-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-trek-500 focus:border-trek-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-trek-600 text-white font-semibold hover:bg-trek-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Update password'
            )}
          </button>
        </form>
        <p className="text-center text-slate-600 mt-4">
          <Link to="/login" className="text-trek-600 font-medium hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
