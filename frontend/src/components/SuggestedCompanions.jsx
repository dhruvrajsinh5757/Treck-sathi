const mockSuggestions = [
  { id: 1, name: 'Aditi Sharma', fitnessLevel: 'Intermediate', initials: 'AS' },
  { id: 2, name: 'Rahul Mehta', fitnessLevel: 'Advanced', initials: 'RM' },
  { id: 3, name: 'Karan Patel', fitnessLevel: 'Beginner', initials: 'KP' },
];

export default function SuggestedCompanions() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-3">
        Suggested companions
      </h2>
      <div className="space-y-3">
        {mockSuggestions.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">
                {s.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{s.name}</p>
                <p className="text-[11px] text-slate-500">
                  Fitness: {s.fitnessLevel}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-[11px] font-semibold text-trek-600 hover:text-trek-700"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

