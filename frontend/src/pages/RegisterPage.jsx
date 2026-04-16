import { useState } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Enter your email to continue.');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/stripe/create-lead-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), return_path: '/register' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Checkout failed');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Try again.');
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
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Join the Inner Circle.</h1>
          <p className="text-sm text-slate-400 leading-relaxed">Real cycles. Real bloodwork. Real community.<br />No hype. No bro-science without receipts.</p>
        </div>

        {/* Pricing Card */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl shadow-black/20">
          <div className="flex items-baseline justify-between mb-5">
            <span className="text-lg font-bold text-white">Inner Circle</span>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-white">$19</span>
              <span className="text-sm text-slate-400">/month</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0"><span className="text-emerald-400 text-xs font-bold">&#10003;</span></div>
              <span className="text-sm text-slate-300">Full access to the 101+ Compound Encyclopedia</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0"><span className="text-emerald-400 text-xs font-bold">&#10003;</span></div>
              <span className="text-sm text-slate-300">Unrestricted access to verified cycle logs and bloodwork</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0"><span className="text-emerald-400 text-xs font-bold">&#10003;</span></div>
              <span className="text-sm text-slate-300">Exclusive 10-20% vendor discount codes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0"><span className="text-emerald-400 text-xs font-bold">&#10003;</span></div>
              <span className="text-sm text-slate-300">Direct access to the founding brain trust</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={ic} required autoFocus autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">
              {loading ? 'Redirecting to checkout...' : 'Join Inner Circle | $19/mo'}
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-500 text-center mt-5 mb-3">Secure checkout powered by Stripe. Cancel anytime.</p>
        <p className="text-xs text-slate-500 text-center">Already a member? <Link to="/login" className="text-[#229DD8] hover:text-white font-medium transition-colors">Log in</Link></p>
        <p className="text-[10px] text-slate-500 mt-8 text-center">Skepticism without data is fear. Skepticism with data is power.</p>
      </div>
    </div>
  );
}
