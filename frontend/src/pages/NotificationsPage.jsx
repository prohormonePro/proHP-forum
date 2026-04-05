import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowLeft, Check, CheckCheck, AtSign, MessageSquare, Star, AlertCircle } from 'lucide-react';
import { api } from '../hooks/api';
import useAuthStore from '../stores/auth';
import BackButton from '../components/layout/BackButton';

const TYPE_ICONS = {
  mention: { icon: AtSign, color: 'text-[#229DD8]', bg: 'bg-[#229DD8]/10' },
  reply: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  vote: { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  badge: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  system: { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  cycle_update: { icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/api/notifications').then(res => {
      setNotifications(res.notifications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const markAllRead = async () => {
    await api.post('/api/notifications/read');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markOneRead = async (id) => {
    await api.post('/api/notifications/' + id + '/read');
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  };

  if (!user) return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <p className="text-sm text-slate-400 mb-3">Log in to view notifications.</p>
      <Link to="/login" className="prohp-btn-primary text-xs">Log in</Link>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in px-3 sm:px-6 py-4 sm:py-6">
      <BackButton fallback="/" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-[#229DD8]" />
          <h1 className="text-lg font-extrabold text-white">Notifications</h1>
          {unreadCount > 0 && <span className="text-[10px] font-bold text-[#229DD8] bg-[#229DD8]/10 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#229DD8] transition-colors">
            <CheckCheck className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12"><p className="text-sm text-slate-500">Loading...</p></div>
      ) : notifications.length === 0 ? (
        <div className="prohp-card p-8 text-center">
          <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-1">No notifications yet.</p>
          <p className="text-[10px] text-slate-600">You'll see replies, mentions, and activity here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => {
            const typeInfo = TYPE_ICONS[n.type] || TYPE_ICONS.system;
            const Icon = typeInfo.icon;
            return (
              <div key={n.id} onClick={() => { if (!n.is_read) markOneRead(n.id); if (n.link) window.location.href = n.link; }}
                className={`prohp-card p-3 sm:p-4 border transition-all cursor-pointer ${n.is_read ? 'border-white/5 opacity-60' : 'border-[#229DD8]/15 hover:border-[#229DD8]/30'}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${typeInfo.bg}`}>
                    <Icon className={`w-4 h-4 ${typeInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${n.is_read ? 'text-slate-400' : 'text-white'}`}>{n.title}</p>
                      <span className="text-[10px] text-slate-600 whitespace-nowrap">{timeAgo(n.created_at)}</span>
                    </div>
                    {n.body && <p className="text-xs text-slate-500 mt-0.5 truncate">{n.body}</p>}
                    {n.link && <Link to={n.link} className="text-[10px] text-[#229DD8] hover:underline mt-1 inline-block" onClick={(e) => e.stopPropagation()}>View</Link>}
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-[#229DD8] shrink-0 mt-2"></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}