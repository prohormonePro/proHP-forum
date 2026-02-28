import { useState } from 'react';
import useAuthStore from '../stores/auth';

const API = import.meta.env.VITE_API_URL || '';

export default function UpgradeButton({
  className = '',
  children = 'Unlock Inner Circle',
  variant = 'primary'
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { accessToken, hasLeadAccess } = useAuthStore();

  const handleUpgrade = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const isAuthed = !!accessToken;
      const endpoint = isAuthed
        ? '/api/stripe/create-checkout-session'
        : '/api/stripe/create-lead-checkout';

      const headers = { 'Content-Type': 'application/json' };
      if (isAuthed) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          setError('You already have Inner Circle access.');
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Checkout failed');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const styles = {
    primary: 'bg-gradient-to-r from-[#0070f3] to-[#00c6ff] text-white font-black text-sm py-3.5 px-8 rounded-full shadow-[0_10px_28px_rgba(0,118,255,.45)] hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,118,255,.60)] active:translate-y-0 transition-all',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg border border-slate-600 transition-all',
    outline: 'border-2 border-[#00c6ff] text-[#00c6ff] hover:bg-[#00c6ff]/10 font-semibold py-3 px-6 rounded-lg transition-all',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className={`${styles[variant] || styles.primary} disabled:opacity-50 ${className}`}
      >
        {loading ? 'Securing checkout...' : children}
      </button>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    </div>
  );
}
