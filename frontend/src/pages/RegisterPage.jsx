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

  return (
    <div className="max-w-md mx-auto py-16 px-4 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-3">Join the Inner Circle.</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Real cycles. Real bloodwork. Real community.<br />
          No hype. No bro-science without receipts.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-lg font-bold text-white">Inner Circle</span>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white">$19</span>
            <span className="text-sm text-slate-400">/month</span>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-slate-300 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-[#229DD8] mt-0.5">&#10003;</span>
            <span>Full access to every compound thread and cycle log</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#229DD8] mt-0.5">&#10003;</span>
            <span>Real bloodwork panels and dosing protocols</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#229DD8] mt-0.5">&#10003;</span>
            <span>Community discussion with verified users</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#229DD8] mt-0.5">&#10003;</span>
            <span>Direct access to the full compound encyclopedia</span>
          </li>
        </ul>

        <form onSubmit={handleCheckout} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="prohp-input text-sm w-full"
              required
              autoFocus
            />
          </div>
          {error && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00c6ff] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,118,255,.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,118,255,.50)] transition-all disabled:opacity-50"
          >
            {loading ? 'Redirecting to checkout...' : 'Join Inner Circle — $19/mo'}
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-500 text-center mb-4">
        Secure checkout powered by Stripe. Cancel anytime.
      </p>

      <p className="text-xs text-slate-500 text-center">
        Already a member? <Link to="/login" className="text-prohp-400 hover:text-prohp-300 font-medium">Log in</Link>
      </p>

      <p className="text-[10px] text-slate-600 mt-8 text-center leading-relaxed">
        Proof over hype. The chain is unbroken.
      </p>
    </div>
  );
}
