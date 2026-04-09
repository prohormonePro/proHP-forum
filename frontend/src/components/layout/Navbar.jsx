import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, Bell } from 'lucide-react';
import { api } from '../../hooks/api';
import useAuthStore from '../../stores/auth';

const TIER_LABELS = {
  free: 'Free',
  inner_circle: 'Inner Circle',
  admin: 'Admin',
};

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    api.get('/api/notifications/unread-count').then(r => setUnreadCount(r.count || 0)).catch(() => {});
    const interval = setInterval(() => { api.get('/api/notifications/unread-count').then(r => setUnreadCount(r.count || 0)).catch(() => {}); }, 60000);
    return () => clearInterval(interval);
  }, [user]);
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-white/[0.04]">
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
              <Link to={`/u/${user.username}`} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors">
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
              <a href="/notifications" className="relative text-slate-500 hover:text-[#229DD8] p-1.5 transition-colors" title="Notifications">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </a>
              <button onClick={() => { logout(); navigate("/"); }} className="text-slate-500 hover:text-slate-300 p-1.5 transition-colors" title="Log out">
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
