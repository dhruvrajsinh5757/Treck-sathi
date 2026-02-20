import { useEffect, useState } from 'react';
import axios from 'axios';
import TrekCard from './TrekCard';

const API_BASE = '/api';

export default function TrekHistory() {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    location: '',
    difficulty: 'Easy',
    durationDays: '',
    year: '',
    photos: [],
  });

  useEffect(() => {
    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/treks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTreks(data.treks || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trek history.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photos') {
      setForm((prev) => ({ ...prev, photos: Array.from(files || []) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('location', form.location);
      fd.append('difficulty', form.difficulty);
      fd.append('durationDays', form.durationDays);
      fd.append('year', form.year);
      form.photos.forEach((file) => fd.append('photos', file));

      await axios.post(`${API_BASE}/treks`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setForm({
        name: '',
        location: '',
        difficulty: 'Easy',
        durationDays: '',
        year: '',
        photos: [],
      });
      setShowForm(false);
      fetchTreks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add trek.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Trek history</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-trek-600 text-white hover:bg-trek-700 transition"
        >
          {showForm ? 'Close' : 'Add Completed Trek'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 sm:grid-cols-2 mb-5 border border-slate-100 rounded-2xl p-4 bg-slate-50/60"
        >
          <Field
            label="Trek name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Kedarkantha Trek"
          />
          <Field
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Uttarakhand, India"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700">Difficulty</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-500 focus:border-trek-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <Field
            label="Duration (days)"
            name="durationDays"
            type="number"
            value={form.durationDays}
            onChange={handleChange}
            placeholder="5"
          />
          <Field
            label="Year"
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            placeholder="2024"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700">Trek photos</label>
            <input
              type="file"
              name="photos"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-trek-50 file:text-trek-700 file:font-medium hover:file:bg-trek-100"
            />
            <p className="text-[11px] text-slate-400">
              You can upload multiple images (max 5–10 MB each depending on backend limits).
            </p>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-trek-600 text-white hover:bg-trek-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Saving...' : 'Save Trek'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-trek-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : treks.length === 0 ? (
        <p className="text-sm text-slate-600">
          You haven&apos;t added any completed treks yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {treks.map((trek) => (
            <TrekCard
              key={trek._id}
              trek={trek}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <input
        {...inputProps}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-500 focus:border-trek-500"
      />
    </div>
  );
}

