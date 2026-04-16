import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/auth';

export default function ClaimAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) setError('Invalid or missing secure session. If you just paid, check your email.');
  }, [sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!sessionId) return setError('Invalid or missing session');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters');
    if (formData.username.length < 3) return setError('Username must be at least 3 characters');

    setIsLoading(true);

    try {
      const API = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API}/api/claim-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to secure account.');
      }

      // Exact match to your auth store logic
      useAuthStore.getState()._setTokens(data.access_token, data.refresh_token);
      useAuthStore.setState({ user: data.user, loading: false });
      
      // Send them straight to the encyclopedia
      navigate('/compounds');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_700px_at_50%_25%,rgba(37,99,235,.10),transparent_58%)] pointer-events-none" />
        <div className="relative z-10 w-full max-w-md text-center bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Session</h1>
          <p className="text-white/60 mb-6 text-sm">We couldn't verify your payment token. If you just checked out, please check your email for a secure link.</p>
          <button onClick={() => navigate('/')} className="text-[#229DD8] hover:text-[#2bb5e8] font-semibold transition-colors">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(1100px_700px_at_50%_25%,rgba(37,99,235,.10),transparent_58%),linear-gradient(180deg,#020617_0%,#000000_100%)] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,.55)]">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome to the Inner Circle</h1>
            <p className="text-sm text-white/60">Secure your credentials to unlock the ecosystem.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-400 text-sm font-medium">{error}</p>
              {error.includes('already exists') && (
                <Link to="/login" state={{ from: { pathname: window.location.pathname, search: window.location.search } }} className="text-red-300 hover:text-red-200 text-xs mt-2 inline-block underline">Go to login →</Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/45 focus:border-[#229DD8] focus:shadow-[0_0_0_3px_rgba(34,157,216,.25)] focus:bg-black/40 outline-none transition-all"
                placeholder="Choose a Username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/45 focus:border-[#229DD8] focus:shadow-[0_0_0_3px_rgba(34,157,216,.25)] focus:bg-black/40 outline-none transition-all"
                placeholder="Create a Password"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/45 focus:border-[#229DD8] focus:shadow-[0_0_0_3px_rgba(34,157,216,.25)] focus:bg-black/40 outline-none transition-all"
                placeholder="Confirm Password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-black text-sm py-4 mt-2 rounded-full transition-all disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "linear-gradient(180deg, #2bb5e8 0%, #229DD8 50%, #1a7eb0 100%)", boxShadow: "0 10px 32px rgba(34,157,216,.40), 0 0 60px rgba(34,157,216,.15)" }}
            >
              {isLoading ? 'Encrypting Credentials...' : 'Secure Account & Enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
