import { Link, useLocation } from 'react-router-dom';
import { Lock, FlaskConical, BookOpen, Home, MessageSquare, BarChart3, User, Bell, Shield, Beaker } from 'lucide-react';
import useAuthStore from '../../stores/auth';

const TIER_LEVELS = { free: 0, inner_circle: 1, admin: 2 };

export default function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const userLevel = TIER_LEVELS[user?.tier || 'free'] ?? 0;

  const linkClass = (path, exact) => {
    const active = exact ? location.pathname === path : location.pathname.startsWith(path);
    return `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
      active
        ? 'bg-[var(--prohp-glow)] text-[var(--prohp-blue)] border border-[rgba(34,157,216,0.15)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
    }`;
  };

  const sectionLabel = (text) => (
    <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2 px-2 mt-4 first:mt-0">{text}</h3>
  );

  return (
    <aside className="w-52 flex-shrink-0 hidden lg:block">
      <div className="sticky top-16 space-y-1 py-4">

        {/* Home */}
        <div className="px-2 mb-3">
          <Link to="/" className={linkClass('/', true)}>
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Research */}
        {sectionLabel('Research')}
        <div className="space-y-0.5 px-2">
          <Link to="/compounds" className={linkClass('/compounds', false)}>
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="flex-1">Encyclopedia</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">105</span>
          </Link>
          <Link to="/cycles" className={linkClass('/cycles', false)}>
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Cycle Logs</span>
          </Link>
          <Link to="/community-intel" className={linkClass('/community-intel', false)}>
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Community Intel</span>
          </Link>
          <Link to="/pct" className={linkClass('/pct', false)}>
            <Shield className="w-3.5 h-3.5" />
            <span>PCT Guide</span>
          </Link>
        </div>

        {/* Discuss */}
        {sectionLabel('Discuss')}
        <div className="space-y-0.5 px-2">
          <Link to="/r/general" className={linkClass('/r/general', false)}>
            <span className="flex-1">General</span>
          </Link>
          <Link to="/r/library" className={linkClass('/r/library', false)}>
            <span className="flex-1">The Library</span>
            {userLevel < 1 && <Lock className="w-3 h-3 text-[var(--text-muted)]" />}
          </Link>
          <Link to="/r/lab" className={linkClass('/r/lab', false)}>
            <span className="flex-1">The Lab</span>
            {userLevel < 1 && <Lock className="w-3 h-3 text-[var(--text-muted)]" />}
          </Link>
        </div>

        {/* You (logged in only) */}
        {user && (
          <>
            {sectionLabel('You')}
            <div className="space-y-0.5 px-2">
              <Link to="/cycles" className={linkClass('/cycles', true)}>
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Your Cycles</span>
              </Link>
              <Link to={'/u/' + user.username} className={linkClass('/u/' + user.username, false)}>
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </Link>
              <Link to="/notifications" className={linkClass('/notifications', false)}>
                <Bell className="w-3.5 h-3.5" />
                <span>Notifications</span>
              </Link>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-2 pt-4 mt-4 border-t border-[var(--border-subtle)]">
          <p className="text-[10px] font-mono tracking-wider text-[var(--text-muted)] leading-relaxed">
            Proof Over Hype.<br />
            The Chain Is Unbroken.<br />
            <span className="text-[var(--prohp-blue)]">E3592DC3</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
