import { Link } from 'react-router-dom';

const heroBg = 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop';

export default function Landing() {
  return (
    <div className="relative">
      <section
        className="relative min-h-[85vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 drop-shadow-lg">
            TrekConnect – Find Your Perfect Trek Companion
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 mb-10 max-w-2xl mx-auto drop-shadow">
            Connect with like-minded trekkers before your next adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-trek-500 text-white font-semibold text-lg hover:bg-trek-600 transition shadow-lg hover:shadow-xl"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/10 border-2 border-white text-white font-semibold text-lg hover:bg-white/20 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Why TrekConnect?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-trek-100 text-trek-600 flex items-center justify-center mx-auto mb-4 text-xl">👥</div>
              <h3 className="font-semibold text-slate-800 mb-2">Find Companions</h3>
              <p className="text-slate-600 text-sm">Match with trekkers who share your fitness level and goals.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-trek-100 text-trek-600 flex items-center justify-center mx-auto mb-4 text-xl">🏔️</div>
              <h3 className="font-semibold text-slate-800 mb-2">Plan Trips</h3>
              <p className="text-slate-600 text-sm">Discover and join treks or create your own adventures.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-trek-100 text-trek-600 flex items-center justify-center mx-auto mb-4 text-xl">✓</div>
              <h3 className="font-semibold text-slate-800 mb-2">Safe & Verified</h3>
              <p className="text-slate-600 text-sm">Connect with verified profiles and plan with confidence.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
