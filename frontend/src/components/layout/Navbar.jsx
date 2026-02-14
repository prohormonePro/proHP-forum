import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import useAuthStore from '../../stores/auth';

const TIER_LABELS = {
  lab_rat: 'Lab Rat',
  premium: 'Brother-in-Arms',
  elite: 'Elite',
  admin: 'Admin',
};

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-extrabold tracking-tight">
            <span className="text-prohp-400">ProHP</span>
            <span className="text-slate-400"> Forum</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-auto hidden sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search compounds, threads..." className="w-full bg-slate-900/60 border border-white/[0.06] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-prohp-500/30 transition-colors" />
          </div>
        </form>

        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors">
                <div className="w-7 h-7 rounded-full bg-prohp-500/20 border border-prohp-500/30 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-prohp-400">
                    {(user.display_name || user.username).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="font-medium text-slate-200 text-xs">{user.display_name || user.username}</div>
                  <div className="text-[10px] text-slate-500">{TIER_LABELS[user.tier] || user.tier}</div>
                </div>
              </Link>
              <button onClick={logout} className="text-slate-500 hover:text-slate-300 p-1.5 transition-colors" title="Log out">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="prohp-btn-ghost text-xs">Log in</Link>
              <Link to="/register" className="prohp-btn-primary text-xs">Start Here</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
