import { Link, useLocation } from 'react-router-dom';
import { Lock, FlaskConical, BookOpen } from 'lucide-react';
import useAuthStore from '../../stores/auth';

const TIER_LEVELS = { free: 0, inner_circle: 1, admin: 2 };

const rooms = [
  { slug: 'general', name: 'General', tier: 'free', desc: 'Start here' },
  { slug: 'library', name: 'The Library', tier: 'inner_circle', desc: 'Research' },
  { slug: 'lab', name: 'The Lab', tier: 'inner_circle', desc: 'Bloodwork' },
];

export default function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const userLevel = TIER_LEVELS[user?.tier || 'free'] ?? 0;

  return (
    <aside className="w-52 flex-shrink-0 hidden lg:block">
      <div className="sticky top-16 space-y-6 py-4">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2.5 px-2">
            Districts
          </h3>
          <div className="space-y-0.5">
            {rooms.map((r) => {
              const locked = userLevel < (TIER_LEVELS[r.tier] ?? 0);
              const active = location.pathname === `/r/${r.slug}`;
              return (
                <Link
                  key={r.slug}
                  to={`/r/${r.slug}`}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150
                    ${active
                      ? 'bg-[var(--prohp-glow)] text-[var(--prohp-blue)] border border-[rgba(34,157,216,0.15)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'}
                    ${locked ? 'opacity-50' : ''}`}
                >
                  <span className="flex-1">{r.name}</span>
                  {locked && <Lock className="w-3 h-3 text-[var(--text-muted)]" />}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2.5 px-2">
            Explore
          </h3>
          <div className="space-y-0.5">
            <Link
              to="/compounds"
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150
                ${location.pathname.startsWith('/compounds')
                  ? 'bg-[var(--prohp-glow)] text-[var(--prohp-blue)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'}`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Encyclopedia</span>
              <span className="ml-auto text-[10px] font-mono text-[var(--text-muted)]">52</span>
            </Link>
            <Link
              to="/cycles"
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150
                ${location.pathname.startsWith('/cycles')
                  ? 'bg-[var(--prohp-glow)] text-[var(--prohp-blue)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cycle Logs</span>
            </Link>
          </div>
        </div>

        <div className="px-2 pt-2 border-t border-[var(--border-subtle)]">
          <p className="text-[9px] font-mono tracking-wider text-[var(--text-muted)] leading-relaxed">
            Proof Over Hype.<br />
            The Chain Is Unbroken.<br />
            <span className="text-[var(--prohp-blue)]">E3592DC3</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
