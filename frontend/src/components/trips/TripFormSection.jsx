export default function TripFormSection({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="h-px bg-gradient-to-r from-emerald-400 via-sky-400 to-transparent" />
      <div className="space-y-3">{children}</div>
    </section>
  );
}

