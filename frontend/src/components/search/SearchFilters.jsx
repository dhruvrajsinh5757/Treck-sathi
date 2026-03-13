export default function SearchFilters({ searchMode, filters, onFiltersChange, onReset }) {
  const handleChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-slate-900/70 border border-slate-700/60 rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-100">Filters</h3>
        <button
          onClick={onReset}
          className="text-xs text-emerald-400 hover:text-emerald-300 transition"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {searchMode === 'trips' ? (
          <>
            {/* Trip Filters */}
            <FilterGroup label="Destination">
              <input
                type="text"
                value={filters.destination}
                onChange={(e) => handleChange('destination', e.target.value)}
                placeholder="e.g., Kedarnath, Manali"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </FilterGroup>

            <FilterGroup label="Date Range">
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>
            </FilterGroup>

            <FilterGroup label="Difficulty">
              <select
                value={filters.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Trip Type">
              <select
                value={filters.tripType}
                onChange={(e) => handleChange('tripType', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">All Types</option>
                <option value="Trek">Trek</option>
                <option value="Road Trip">Road Trip</option>
                <option value="Camping">Camping</option>
                <option value="International">International</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Budget Range (₹)">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => handleChange('minBudget', e.target.value)}
                  placeholder="Min"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
                <input
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => handleChange('maxBudget', e.target.value)}
                  placeholder="Max"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>
            </FilterGroup>

            <FilterGroup label="Duration">
              <select
                value={filters.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">Any Duration</option>
                <option value="1-3">1-3 days</option>
                <option value="4-7">4-7 days</option>
                <option value="7+">7+ days</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Required Experience">
              <select
                value={filters.requiredExperience}
                onChange={(e) => handleChange('requiredExperience', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">Any Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Explorer">Explorer</option>
                <option value="Pro">Pro</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Required Fitness">
              <select
                value={filters.requiredFitness}
                onChange={(e) => handleChange('requiredFitness', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">Any Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Gender Preference">
              <select
                value={filters.genderPreference}
                onChange={(e) => handleChange('genderPreference', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">No Preference</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Age Range">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minAge}
                  onChange={(e) => handleChange('minAge', e.target.value)}
                  placeholder="Min"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
                <input
                  type="number"
                  value={filters.maxAge}
                  onChange={(e) => handleChange('maxAge', e.target.value)}
                  placeholder="Max"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>
            </FilterGroup>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="availableSeats"
                checked={filters.availableSeats}
                onChange={(e) => handleChange('availableSeats', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800/60 border-slate-700/60 text-emerald-400 focus:ring-emerald-400/50"
              />
              <label htmlFor="availableSeats" className="text-sm text-slate-300">
                Only show trips with available seats
              </label>
            </div>
          </>
        ) : (
          <>
            {/* Trekker Filters */}
            <FilterGroup label="Location">
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City or State"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </FilterGroup>

            <FilterGroup label="Treks Completed">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minTreks}
                  onChange={(e) => handleChange('minTreks', e.target.value)}
                  placeholder="Min"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
                <input
                  type="number"
                  value={filters.maxTreks}
                  onChange={(e) => handleChange('maxTreks', e.target.value)}
                  placeholder="Max"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>
            </FilterGroup>

            <FilterGroup label="Experience Level">
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleChange('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">Any Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Explorer">Explorer</option>
                <option value="Pro">Pro</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Fitness Level">
              <select
                value={filters.fitnessLevel}
                onChange={(e) => handleChange('fitnessLevel', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">Any Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Age Range">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minAge}
                  onChange={(e) => handleChange('minAge', e.target.value)}
                  placeholder="Min"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
                <input
                  type="number"
                  value={filters.maxAge}
                  onChange={(e) => handleChange('maxAge', e.target.value)}
                  placeholder="Max"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>
            </FilterGroup>

            <FilterGroup label="Gender">
              <select
                value={filters.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FilterGroup>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verified"
                checked={filters.verified}
                onChange={(e) => handleChange('verified', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800/60 border-slate-700/60 text-emerald-400 focus:ring-emerald-400/50"
              />
              <label htmlFor="verified" className="text-sm text-slate-300">
                Verified profiles only
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}
