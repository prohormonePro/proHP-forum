import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state?.from; const from = typeof fromState === "string" ? fromState : (fromState ? (fromState.pathname + (fromState.search || "")) : "/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const ic = "w-full rounded-xl border border-slate-700/50 bg-slate-950/50 py-3 px-4 text-white text-base placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Back */}
        <div className="mb-6">
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#229DD8]/10 border border-[#229DD8]/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#229DD8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Inner Circle Access</h1>
          <p className="text-sm text-slate-400">Proof over hype. The chain is unbroken.</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit} method="post" className="space-y-4" autoComplete="on">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input type="email" name="email" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={ic} required autoFocus autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="email" />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <input type="password" name="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className={ic} required autoComplete="current-password" />
            </div>
            {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] disabled:opacity-50 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-[#229DD8]/20 hover:shadow-[#229DD8]/40">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        {/* What You're Missing */}
        <div className="mt-6 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/5 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">What you unlock inside</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><span className="text-emerald-400 text-base">&#128218;</span></div>
              <div><p className="text-sm text-white font-medium">The Encyclopedia</p><p className="text-[11px] text-slate-500">Full access to 101+ deep-dive compound profiles and dosing protocols</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#229DD8]/10 flex items-center justify-center shrink-0"><span className="text-[#229DD8] text-base">&#9889;</span></div>
              <div><p className="text-sm text-white font-medium">Speed to Intel</p><p className="text-[11px] text-slate-500">Cut through the bro-science. Find exact cycle setups and verify side effects instantly</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0"><span className="text-amber-400 text-base">&#128176;</span></div>
              <div><p className="text-sm text-white font-medium">Exclusive ROI</p><p className="text-[11px] text-slate-500">Revolving 10-20% vendor discounts. The membership pays for itself on day one</p></div>
            </div>
          </div>
        </div>

        {/* Join CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-300 font-semibold mb-2">Not a member yet?</p>
          <p className="text-xs text-slate-500 mb-4">Full access to threads, cycle logs, bloodwork, and community intel.</p>
          <Link to="/register" className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all">
            Join Inner Circle | $19/mo
          </Link>
        </div>

        <p className="text-[10px] text-slate-500 mt-8 text-center">
          Proof over hype. The chain is unbroken.
        </p>
      </div>
    </div>
  );
}
