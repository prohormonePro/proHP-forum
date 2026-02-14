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
    <div className="max-w-sm mx-auto py-12 animate-fade-in">
      <h1 className="text-xl font-extrabold mb-1">Welcome back.</h1>
      <p className="text-sm text-slate-400 mb-6">Pick up where you left off.</p>

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
        <button type="submit" disabled={loading} className="prohp-btn-primary w-full text-sm">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="text-xs text-slate-500 mt-6 text-center">
        New here? <Link to="/register" className="text-prohp-400 hover:text-prohp-300 font-medium">Start here</Link>
      </p>
    </div>
  );
}
