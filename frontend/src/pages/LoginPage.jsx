import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-extrabold text-white mb-2">Welcome back.</h1>
        <p className="text-sm text-slate-400">Log in to access your Inner Circle membership, threads, and cycle logs.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="prohp-input text-sm" required autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="prohp-input text-sm" required />
        </div>
        {error && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}
        <button type="submit" disabled={loading} className="prohp-btn-primary w-full text-sm py-3">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-slate-800">
        <div className="text-center">
          <p className="text-sm text-slate-300 font-semibold mb-2">Not a member yet?</p>
          <p className="text-xs text-slate-500 mb-4">Join the Inner Circle for full access to threads, cycle logs, bloodwork, and community intel.</p>
          <Link to="/register" className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00c6ff] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,118,255,.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,118,255,.50)] transition-all">
            Join Inner Circle
          </Link>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 mt-8 text-center leading-relaxed">
        Proof over hype. The chain is unbroken.
      </p>
    </div>
  );
}
