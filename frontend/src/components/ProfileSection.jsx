import { useMemo } from 'react';

const fitnessOptions = ['Low', 'Medium', 'High'];

export default function ProfileSection({
  user,
  profile,
  onChange,
  onSave,
  saving,
  trekCount,
}) {
  const completion = useMemo(() => calculateCompletion(profile), [profile]);
  const experienceLevel = useMemo(() => calculateExperienceLevel(trekCount), [trekCount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...profile, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onChange({ ...profile, avatarFile: file, avatarPreview: previewUrl });
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="relative cursor-pointer">
            <div className="w-16 h-16 rounded-full border-4 border-trek-200 bg-slate-100 flex items-center justify-center overflow-hidden text-slate-500 text-sm font-semibold">
              {profile.avatarPreview ? (
                <img
                  src={profile.avatarPreview}
                  alt={user?.name || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user?.name || 'TC')
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-trek-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              ⬆
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {user?.name || 'Trekker'}
            </h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {experienceLevel} explorer
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-trek-600 text-white hover:bg-trek-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {saving ? 'Saving...' : 'Save / Update'}
        </button>
      </div>

      {/* Completion bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-600">Profile completion</span>
          <span className="font-medium text-slate-800">{completion}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-trek-500 to-sky-500 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Form fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Full name"
          name="fullName"
          value={profile.fullName}
          onChange={handleInputChange}
          placeholder="John Doe"
        />
        <Field
          label="Age"
          name="age"
          type="number"
          value={profile.age}
          onChange={handleInputChange}
          placeholder="28"
        />
        <Field
          label="Gender"
          name="gender"
          value={profile.gender}
          onChange={handleInputChange}
          placeholder="Male / Female / Other"
        />
        <Field
          label="City / State"
          name="location"
          value={profile.location}
          onChange={handleInputChange}
          placeholder="Manali, Himachal Pradesh"
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700">Fitness level</label>
          <select
            name="fitnessLevel"
            value={profile.fitnessLevel}
            onChange={handleInputChange}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-500 focus:border-trek-500"
          >
            <option value="">Select</option>
            {fitnessOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Emergency contact"
          name="emergencyContact"
          value={profile.emergencyContact}
          onChange={handleInputChange}
          placeholder="+91 98765 43210"
        />
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700">Bio</label>
          <textarea
            name="bio"
            value={profile.bio || ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="Short bio about your trekking style, favourite regions, etc."
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trek-500 focus:border-trek-500 resize-none"
          />
        </div>
      </div>
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

function calculateCompletion(profile) {
  const fields = [
    profile.fullName,
    profile.age,
    profile.gender,
    profile.location,
    profile.fitnessLevel,
    profile.emergencyContact,
    profile.bio,
    profile.avatarFile || profile.avatarPreview,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100) || 0;
}

function calculateExperienceLevel(trekCount) {
  if (!trekCount || trekCount <= 1) return 'Beginner';
  if (trekCount <= 5) return 'Explorer';
  return 'Pro';
}

