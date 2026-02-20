import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/dashboard/Sidebar';
import TripFormSection from '../components/trips/TripFormSection';
import ImageUpload from '../components/trips/ImageUpload';

const API_BASE = '/api';

const initialForm = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  duration: 0,
  difficulty: 'Medium',
  tripType: 'Trek',
  description: '',

  maxMembers: '',
  requiredExperience: 'Beginner',
  requiredFitness: 'Medium',
  genderPreference: '',
  minAge: '',
  maxAge: '',

  budget: '',
  costIncludes: { travel: false, stay: false, food: false, guide: false },
  meetingPoint: '',
  transportMode: 'Bus',

  thingsToCarry: '',
  safetyGuidelines: '',
  emergencyContact: '',
  cancellationPolicy: '',

  status: 'draft', // draft | published
  autoApproveRequests: true,
  visibility: 'public', // public | private
};

export default function CreateTrip() {
  const [form, setForm] = useState(initialForm);
  const [coverImage, setCoverImage] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [routeMap, setRouteMap] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diffMs = end - start;
      const days = diffMs >= 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1 : 0;
      setForm((prev) => ({ ...prev, duration: days || 0 }));
    }
  }, [form.startDate, form.endDate]);

  const handleChange = (field, value) => {
    setError('');
    setSuccess('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCostInclude = (key) => {
    setForm((prev) => ({
      ...prev,
      costIncludes: { ...prev.costIncludes, [key]: !prev.costIncludes[key] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.destination || !form.startDate || !form.endDate) {
      setError('Please fill all mandatory basic trip details.');
      return;
    }
    if (!coverImage) {
      setError('Cover image is required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a trip.');
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('destination', form.destination);
      fd.append('startDate', form.startDate);
      fd.append('endDate', form.endDate);
      fd.append('duration', String(form.duration || 0));
      fd.append('difficulty', form.difficulty);
      fd.append('tripType', form.tripType);
      fd.append('description', form.description);

      fd.append('maxMembers', form.maxMembers || '');
      fd.append('requiredExperience', form.requiredExperience);
      fd.append('requiredFitness', form.requiredFitness);
      fd.append('genderPreference', form.genderPreference || '');
      fd.append('minAge', form.minAge || '');
      fd.append('maxAge', form.maxAge || '');

      fd.append('budget', form.budget || '');
      fd.append('meetingPoint', form.meetingPoint || '');
      fd.append('transportMode', form.transportMode);
      fd.append('costIncludes', JSON.stringify(form.costIncludes));

      fd.append('thingsToCarry', form.thingsToCarry || '');
      fd.append('safetyGuidelines', form.safetyGuidelines || '');
      fd.append('emergencyContact', form.emergencyContact || '');
      fd.append('cancellationPolicy', form.cancellationPolicy || '');

      fd.append('status', form.status);
      fd.append('visibility', form.visibility);
      fd.append('autoApproveRequests', String(form.autoApproveRequests));

      fd.append('coverImage', coverImage);
      additionalPhotos.forEach((file) => fd.append('additionalPhotos', file));
      if (routeMap) fd.append('routeMap', routeMap);

      const { data } = await axios.post(`${API_BASE}/trips`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data?.success) {
        setSuccess('Trip created successfully.');
        setForm(initialForm);
        setCoverImage(null);
        setAdditionalPhotos([]);
        setRouteMap(null);
      } else {
        setError(data?.message || 'Failed to create trip.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 flex gap-4 md:gap-6">
        <Sidebar />

        <main className="flex-1 space-y-5">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-6">
            <header className="flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Create a new trip</h1>
                <p className="text-sm text-slate-500">Publish a trek, camping, road trip or international plan.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-trek-600 focus:ring-trek-500"
                    checked={form.autoApproveRequests}
                    onChange={() => handleChange('autoApproveRequests', !form.autoApproveRequests)}
                  />
                  Auto-approve requests
                </label>
                <select
                  value={form.visibility}
                  onChange={(e) => handleChange('visibility', e.target.value)}
                  className="rounded-xl border border-slate-300 text-xs px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-trek-500 focus:border-trek-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </header>

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-2 text-sm text-emerald-800">
                {success}
              </div>
            )}

            <TripFormSection title="Basic trip details">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Trip title*" placeholder="Kedarnath Trek 2026" value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
                <Input label="Destination*" placeholder="Kedarnath, Uttarakhand" value={form.destination} onChange={(e) => handleChange('destination', e.target.value)} />
                <Input label="Start date*" type="date" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)} />
                <Input label="End date*" type="date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)} />
                <Input label="Total duration (days)" type="number" value={form.duration || ''} disabled />
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Difficulty level" value={form.difficulty} onChange={(e) => handleChange('difficulty', e.target.value)} options={['Easy', 'Medium', 'Hard']} />
                  <Select label="Trip type" value={form.tripType} onChange={(e) => handleChange('tripType', e.target.value)} options={['Trek', 'Road Trip', 'Camping', 'International']} />
                </div>
              </div>
              <Textarea label="Short description" rows={3} value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="A short teaser about the trip..." />
            </TripFormSection>

            <TripFormSection title="Group requirements">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Maximum members" type="number" value={form.maxMembers} onChange={(e) => handleChange('maxMembers', e.target.value)} />
                <Select label="Required experience level" value={form.requiredExperience} onChange={(e) => handleChange('requiredExperience', e.target.value)} options={['Beginner', 'Explorer', 'Pro']} />
                <Select label="Required fitness level" value={form.requiredFitness} onChange={(e) => handleChange('requiredFitness', e.target.value)} options={['Low', 'Medium', 'High']} />
                <Select label="Gender preference (optional)" value={form.genderPreference} onChange={(e) => handleChange('genderPreference', e.target.value)} options={['', 'Male only', 'Female only', 'Mixed']} />
                <Input label="Minimum age (optional)" type="number" value={form.minAge} onChange={(e) => handleChange('minAge', e.target.value)} />
                <Input label="Maximum age (optional)" type="number" value={form.maxAge} onChange={(e) => handleChange('maxAge', e.target.value)} />
              </div>
            </TripFormSection>

            <TripFormSection title="Cost & planning">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Estimated budget (₹)" type="number" value={form.budget} onChange={(e) => handleChange('budget', e.target.value)} />
                <Input label="Meeting point" value={form.meetingPoint} onChange={(e) => handleChange('meetingPoint', e.target.value)} placeholder="Dehradun ISBT" />
                <Select label="Transport mode" value={form.transportMode} onChange={(e) => handleChange('transportMode', e.target.value)} options={['Bus', 'Train', 'Self', 'Flight']} />
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-700 mb-2">Cost includes</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {[
                    ['travel', 'Travel'],
                    ['stay', 'Stay'],
                    ['food', 'Food'],
                    ['guide', 'Guide'],
                  ].map(([key, label]) => (
                    <label key={key} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-trek-600 focus:ring-trek-500"
                        checked={form.costIncludes[key]}
                        onChange={() => toggleCostInclude(key)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </TripFormSection>

            <TripFormSection title="Media">
              <div className="grid gap-4 md:grid-cols-3">
                <ImageUpload label="Cover image" required file={coverImage} onChange={setCoverImage} />
                <ImageUpload label="Additional photos" multiple files={additionalPhotos} onMultipleChange={setAdditionalPhotos} />
                <ImageUpload label="Route map image" file={routeMap} onChange={setRouteMap} />
              </div>
            </TripFormSection>

            <TripFormSection title="Safety & rules">
              <div className="grid gap-3 sm:grid-cols-2">
                <Textarea label="Things to carry" rows={4} value={form.thingsToCarry} onChange={(e) => handleChange('thingsToCarry', e.target.value)} />
                <Textarea label="Safety guidelines" rows={4} value={form.safetyGuidelines} onChange={(e) => handleChange('safetyGuidelines', e.target.value)} />
                <Input label="Emergency contact" value={form.emergencyContact} onChange={(e) => handleChange('emergencyContact', e.target.value)} />
                <Textarea label="Cancellation policy" rows={3} value={form.cancellationPolicy} onChange={(e) => handleChange('cancellationPolicy', e.target.value)} />
              </div>
            </TripFormSection>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleChange('status', 'draft')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    form.status === 'draft'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('status', 'published')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    form.status === 'published'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  Publish
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-2xl text-sm font-semibold bg-trek-600 text-white hover:bg-trek-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-900/30"
              >
                {loading ? 'Saving trip…' : 'Save trip'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-trek-500 focus:border-trek-500 disabled:bg-slate-50"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <select
        {...props}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-trek-500 focus:border-trek-500"
      >
        {options.map((opt) => (
          <option key={opt || 'empty'} value={opt}>
            {opt || 'Select'}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <textarea
        {...props}
        className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-trek-500 focus:border-trek-500 resize-none"
      />
    </div>
  );
}

