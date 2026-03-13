import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import SearchFilters from '../components/search/SearchFilters';
import TripSearchResults from '../components/search/TripSearchResults';
import TrekkerSearchResults from '../components/search/TrekkerSearchResults';
import SmartMatchSuggestions from '../components/search/SmartMatchSuggestions';

const API_BASE = '/api';

export default function Search() {
  const { user } = useAuth();
  const [searchMode, setSearchMode] = useState('trips'); // 'trips' | 'trekkers'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    // Trip filters
    destination: '',
    startDate: '',
    endDate: '',
    difficulty: '',
    tripType: '',
    minBudget: '',
    maxBudget: '',
    duration: '',
    requiredExperience: '',
    requiredFitness: '',
    genderPreference: '',
    minAge: '',
    maxAge: '',
    availableSeats: false,
    // Trekker filters
    city: '',
    state: '',
    location: '',
    minTreks: '',
    maxTreks: '',
    experienceLevel: '',
    fitnessLevel: '',
    preferredDifficulty: '',
    gender: '',
    verified: false,
  });

  const [trips, setTrips] = useState([]);
  const [trekkers, setTrekkers] = useState([]);
  const [smartMatches, setSmartMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSmartMatch, setLoadingSmartMatch] = useState(true);
  const [error, setError] = useState('');

  // Load smart matches on mount
  useEffect(() => {
    loadSmartMatches();
  }, []);

  const loadSmartMatches = async () => {
    try {
      setLoadingSmartMatch(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE}/search/smart-match`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success) {
        setSmartMatches(data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to load smart matches:', err);
    } finally {
      setLoadingSmartMatch(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && searchMode === 'trips' && !filters.destination) {
      setError('Please enter a search query or destination');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (searchMode === 'trips') {
        const params = {
          query: searchQuery,
          ...filters,
          availableSeats: filters.availableSeats ? 'true' : undefined,
        };
        // Remove empty values
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === undefined) delete params[key];
        });

        const { data } = await axios.get(`${API_BASE}/search/trips`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        if (data?.success) {
          setTrips(data.trips || []);
        } else {
          setError(data?.message || 'Failed to search trips');
        }
      } else {
        const params = {
          query: searchQuery,
          location: filters.location || filters.city || filters.state,
          minTreks: filters.minTreks,
          maxTreks: filters.maxTreks,
          experienceLevel: filters.experienceLevel,
          fitnessLevel: filters.fitnessLevel,
          minAge: filters.minAge,
          maxAge: filters.maxAge,
          gender: filters.gender,
          verified: filters.verified ? 'true' : undefined,
        };
        // Remove empty values
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === undefined) delete params[key];
        });

        const { data } = await axios.get(`${API_BASE}/search/trekkers`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        if (data?.success) {
          setTrekkers(data.trekkers || []);
        } else {
          setError(data?.message || 'Failed to search trekkers');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      destination: '',
      startDate: '',
      endDate: '',
      difficulty: '',
      tripType: '',
      minBudget: '',
      maxBudget: '',
      duration: '',
      requiredExperience: '',
      requiredFitness: '',
      genderPreference: '',
      minAge: '',
      maxAge: '',
      availableSeats: false,
      city: '',
      state: '',
      location: '',
      minTreks: '',
      maxTreks: '',
      experienceLevel: '',
      fitnessLevel: '',
      preferredDifficulty: '',
      gender: '',
      verified: false,
    });
    setSearchQuery('');
    setTrips([]);
    setTrekkers([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-4 md:gap-6">
        <Sidebar />

        <main className="flex-1 flex flex-col gap-4 md:gap-6">
          {/* Top Section - Search Bar & Toggle */}
          <section className="bg-slate-900/70 border border-slate-700/60 rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={
                      searchMode === 'trips'
                        ? 'Search by destination or trip name...'
                        : 'Search by name or username...'
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    🔎
                  </span>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 font-semibold shadow-lg shadow-emerald-900/40 hover:from-emerald-300 hover:to-sky-300 transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSearchMode('trips');
                    setTrips([]);
                    setTrekkers([]);
                    setError('');
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    searchMode === 'trips'
                      ? 'bg-gradient-to-r from-emerald-500/90 to-sky-500/90 text-slate-950 shadow-lg'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  🔍 Search Trips
                </button>
                <button
                  onClick={() => {
                    setSearchMode('trekkers');
                    setTrips([]);
                    setTrekkers([]);
                    setError('');
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    searchMode === 'trekkers'
                      ? 'bg-gradient-to-r from-emerald-500/90 to-sky-500/90 text-slate-950 shadow-lg'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  👥 Search Trekkers
                </button>
              </div>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl bg-red-900/40 border border-red-500/40 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            {/* Filter Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <SearchFilters
                searchMode={searchMode}
                filters={filters}
                onFiltersChange={setFilters}
                onReset={handleResetFilters}
              />
            </aside>

            {/* Results Section */}
            <div className="flex-1 space-y-4 md:space-y-6">
              {/* Smart Match Suggestions */}
              {!loading && trips.length === 0 && trekkers.length === 0 && !loadingSmartMatch && (
                <SmartMatchSuggestions suggestions={smartMatches} />
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Trip Results */}
              {searchMode === 'trips' && trips.length > 0 && (
                <TripSearchResults trips={trips} />
              )}

              {/* Trekker Results */}
              {searchMode === 'trekkers' && trekkers.length > 0 && (
                <TrekkerSearchResults trekkers={trekkers} />
              )}

              {/* No Results */}
              {!loading &&
                ((searchMode === 'trips' && trips.length === 0 && searchQuery) ||
                  (searchMode === 'trekkers' && trekkers.length === 0 && searchQuery)) && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-lg">No results found</p>
                    <p className="text-sm mt-2">Try adjusting your filters or search query</p>
                  </div>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
