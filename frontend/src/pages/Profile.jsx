import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ProfileSection from '../components/ProfileSection';

const API_BASE = '/api';

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    age: '',
    gender: '',
    location: '',
    fitnessLevel: '',
    emergencyContact: '',
    bio: '',
    avatarFile: null,
    avatarPreview: '',
  });
  const [trekCount, setTrekCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const [meRes, treksRes] = await Promise.all([
          axios.get(`${API_BASE}/auth/me`, { headers }),
          axios
            .get(`${API_BASE}/treks`, { headers })
            .catch(() => ({ data: { treks: [] } })),
        ]);

        const u = meRes.data.user;
        setProfile((prev) => ({
          ...prev,
          fullName: u?.name || '',
          fitnessLevel: u?.fitnessLevel || '',
          age: u?.age || '',
          gender: u?.gender || '',
          location: u?.location || '',
          emergencyContact: u?.emergencyContact || '',
          bio: u?.bio || '',
          avatarPreview: u?.profilePhoto ? u.profilePhoto : prev.avatarPreview,
        }));
        setTrekCount((treksRes.data.treks || []).length);
      } catch {
        // Silent fail for now; UI still loads
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSavingProfile(true);
      setProfileError('');
      setProfileSuccess('');

      const fd = new FormData();
      fd.append('name', profile.fullName || '');
      fd.append('age', profile.age || '');
      fd.append('gender', profile.gender || '');
      fd.append('location', profile.location || '');
      fd.append('fitnessLevel', profile.fitnessLevel || '');
      fd.append('emergencyContact', profile.emergencyContact || '');
      fd.append('bio', profile.bio || '');
      if (profile.avatarFile) fd.append('profilePhoto', profile.avatarFile);

      const { data } = await axios.put(`${API_BASE}/auth/profile`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data?.success) {
        setProfileSuccess('Profile updated successfully.');
        await refreshMe?.();
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-trek-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[60vh] py-6 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto flex gap-4 md:gap-6">
        <Sidebar />

        <main className="flex-1 space-y-4 md:space-y-5">
          <ProfileSection
            user={user}
            profile={profile}
            onChange={setProfile}
            onSave={handleSaveProfile}
            saving={savingProfile}
            trekCount={trekCount}
          />

          {(profileError || profileSuccess) && (
            <div
              className={`rounded-2xl border p-4 text-sm ${
                profileError
                  ? 'bg-red-50 border-red-100 text-red-700'
                  : 'bg-emerald-50 border-emerald-100 text-emerald-800'
              }`}
            >
              {profileError || profileSuccess}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

