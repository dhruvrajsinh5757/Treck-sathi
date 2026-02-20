import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = '/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/forgot-password`, { email: email.trim() });
      if (data.success) {
        setSuccess({
          message: 'If an account exists with this email, a reset link has been sent.',
          resetUrl: data.resetUrl,
        });
      } else {
        setError(data.message || 'Request failed');
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
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-trek-100 text-trek-600 flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email</h2>
            <p className="text-slate-600 mb-4">{success.message}</p>
            {success.resetUrl && (
              <>
                <p className="text-sm text-slate-500 mb-2">For development, use this link:</p>
                <a
                  href={success.resetUrl}
                  className="inline-block text-trek-600 font-medium hover:underline break-all"
                >
                  Reset password
                </a>
              </>
            )}
          </div>
          <p className="text-center text-slate-600 mt-4">
            <Link to="/login" className="text-trek-600 font-medium hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">Forgot password?</h1>
        <p className="text-slate-600 text-center mb-6">Enter your email and we&apos;ll send you a reset link.</p>
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
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-trek-500 focus:border-trek-500 outline-none transition"
              placeholder="you@example.com"
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
                Sending...
              </>
            ) : (
              'Send reset link'
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
