import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/auth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (username.length < 3) return setError('Username needs at least 3 characters.');
    if (password.length < 8) return setError('Password needs at least 8 characters. Protect yourself.');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-12 animate-fade-in">
      <h1 className="text-xl font-extrabold mb-1">Start here.</h1>
      <p className="text-sm text-slate-400 mb-2">Free as a Lab Rat. No credit card. No hype. Just proof.</p>
      <p className="text-xs text-slate-500 mb-6">First 1,000 members get a permanent Founding Member badge.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="How you'll be known" className="prohp-input text-sm" required autoFocus minLength={3} maxLength={30} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="prohp-input text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="prohp-input text-sm" required minLength={8} />
        </div>
        {error && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}
        <button type="submit" disabled={loading} className="prohp-btn-primary w-full text-sm">
          {loading ? 'Creating account...' : 'Join the Forum'}
        </button>
      </form>

      <p className="text-xs text-slate-500 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-prohp-400 hover:text-prohp-300 font-medium">Log in</Link>
      </p>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-slate-600 leading-relaxed">
          By joining you agree to keep it real. No hype. No bro-science without receipts.<br />
          Proof over hype. The chain is unbroken.
        </p>
      </div>
    </div>
  );
}
