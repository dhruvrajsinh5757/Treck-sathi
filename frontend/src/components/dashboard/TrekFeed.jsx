import TrekCard from './TrekCard';

export default function TrekFeed({ treks }) {
  return (
    <section className="bg-slate-900/60 border border-slate-800/70 rounded-3xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
          Trek feed
        </h2>
        <button className="text-xs font-medium text-emerald-300 hover:text-emerald-200 transition">
          View all
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {treks.map((trek) => (
          <TrekCard key={trek.id} trek={trek} />
        ))}
      </div>
    </section>
  );
}

