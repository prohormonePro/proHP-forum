import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Lock, MessageSquare, Users, FlaskConical, Play, ExternalLink, Plus } from 'lucide-react';
import { api } from '../hooks/api';
import WelcomeVideo from '../components/WelcomeVideo';
import useAuthStore from '../stores/auth';

const TIER_LEVELS = { free: 0, inner_circle: 1, admin: 2 };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + 'd ago';
  return new Date(dateStr).toLocaleDateString();
}

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const isInnerCircle = user?.tier === 'inner_circle' || user?.tier === 'admin';
  const userLevel = TIER_LEVELS[user?.tier || 'free'] ?? 0;

  const { data } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get('/api/rooms'),
  });

  const rooms = data?.rooms || [];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">

      {/* ── Hero ── */}
      <div className="mb-8">
        {user ? (
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              Welcome back, {user.display_name || user.username}.
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              106 compounds reviewed. 2M+ views. Every claim receipted.
            </p>
            <p className="text-xs text-slate-500 italic">Skepticism without data is fear. Skepticism with data is power.</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2 leading-tight">
              Real compounds. Real logs. No guessing.
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
              106 compounds reviewed. 2M+ YouTube views. 600+ consultations.
              Every claim receipted, every protocol questioned, every side effect documented.
              No unverified claims. Just the work.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link to="/r/general" className="prohp-btn-ghost text-sm inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                Browse the Forum
              </Link>
            </div>
            <p className="text-xs text-slate-500 italic mt-4">Skepticism without data is fear. Skepticism with data is power.</p>
          </div>
        )}
      </div>

      {/* Mobile Quick Links (lg has sidebar) */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 lg:hidden scrollbar-hide">
        {isInnerCircle ? (
          <Link to="/cycles?new=1" className="shrink-0 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Log Your Cycle
          </Link>
        ) : (
          <Link to="/cycles" className="shrink-0 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Cycle Logs
          </Link>
        )}
        <Link to="/community-intel" className="shrink-0 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-xl border border-[#229DD8]/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#229DD8] hover:bg-[#229DD8]/15 hover:border-[#229DD8]/40 transition-all shadow-[0_2px_12px_rgba(34,157,216,0.08)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
          Community Intel
        </Link>
        <Link to="/consultation" className="shrink-0 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all shadow-[0_2px_12px_rgba(16,185,129,0.08)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          Protocol Analysis
        </Link>
      </div>

      <WelcomeVideo />

      {/* ── Encyclopedia Teaser ── */}
      <Link
        to="/compounds"
        className="bg-gradient-to-r from-slate-900/90 to-slate-950/80 backdrop-blur-md rounded-xl border border-[#229DD8]/15 flex items-center justify-between p-5 mb-8 group shadow-lg shadow-[#229DD8]/5 hover:border-[#229DD8]/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--prohp-glow)] flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-[var(--prohp-blue)]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--prohp-blue)] transition-colors">
              Compound Encyclopedia
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              106 compounds. SARMs, prohormones, peptides, PCT. Risk tiers and mechanism breakdowns.
            </div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--prohp-blue)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>

      {/* ── Room Cards ── */}
      <div className="stagger space-y-3 mb-8">
        {rooms.map((room) => {
          const locked = userLevel < (TIER_LEVELS[room.read_tier] ?? 0);
          const canWrite = userLevel >= (TIER_LEVELS[room.write_tier] ?? 0);
          const hasThreads = room.thread_count > 0;

          return (
            <div key={room.slug} className="prohp-card overflow-hidden">
              <Link
                to={`/r/${room.slug}`}
                className="block p-5 group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--prohp-blue)] transition-colors">
                      {room.name}
                    </h2>
                    {locked && (
                      <span className="tier-badge tier-inner_circle text-[8px] py-0">
                        <Lock className="w-2.5 h-2.5 mr-0.5" /> Inner Circle
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--prohp-blue)] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">
                  {room.description}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {room.thread_count || 0} {room.thread_count === 1 ? 'thread' : 'threads'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {room.post_count || 0} {room.post_count === 1 ? 'reply' : 'replies'}
                  </span>
                </div>

                {/* Latest thread preview OR empty state */}
                {hasThreads && room.last_thread_title ? (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--text-muted)]">Latest:</span>
                      <span className="text-[var(--text-secondary)] font-medium truncate flex-1">
                        {room.last_thread_title}
                      </span>
                      <span className="text-[var(--text-muted)] flex-shrink-0">
                        {room.last_thread_author && (
                          <span>{room.last_thread_author}</span>
                        )}
                        {room.last_thread_at && (
                          <span className="ml-1.5">{timeAgo(room.last_thread_at)}</span>
                        )}
                      </span>
                    </div>
                  </div>
                ) : !locked ? (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-muted)] italic">
                      No threads yet. Be the first to drop your experience.
                    </p>
                  </div>
                ) : null}
              </Link>

              {/* Action bar — outside the link so buttons work independently */}
              <div className="px-5 pb-4 flex items-center justify-between">
                {!locked && canWrite && user ? (
                  <Link
                    to={`/r/${room.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--prohp-blue)] hover:text-white bg-[var(--prohp-glow)] hover:bg-[var(--prohp-blue)] px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-3 h-3" /> Start a Thread
                  </Link>
                ) : !locked && !user ? (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--prohp-blue)] transition-colors"
                  >
                    Start here to join the conversation
                  </Link>
                ) : locked ? (
                  <span className="text-xs text-[var(--text-muted)]">
                    <Link to="/register" className="text-[var(--prohp-blue)] hover:underline font-medium">Upgrade</Link> to post in this room
                  </span>
                ) : null}

                {hasThreads && (
                  <Link
                    to={`/r/${room.slug}`}
                    className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors ml-auto"
                  >
                    View all threads
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Cycle Logs + Inner Circle CTA ── */}
      <div className="max-w-5xl mx-auto px-4 pt-2 pb-6">
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/15 p-5 shadow-lg shadow-amber-500/5">
          <h2 className="text-base font-bold text-white mb-1.5">Community Cycle Logs</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Real protocols. Real bloodwork. Real results. See what the community is running and how they respond.
          </p>
          {user && (user.tier === 'inner_circle' || user.tier === 'admin') ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/cycles" className="prohp-btn-primary text-xs text-center">
                Log Your Cycle
              </Link>
              <Link to="/r/lab" className="prohp-btn-ghost text-xs text-center">
                Browse Community Cycle Logs
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/r/lab" className="prohp-btn-primary text-xs text-center">
                Browse Community Cycle Logs
              </Link>
              <Link to="/register" className="prohp-btn-ghost text-xs text-center">
                Join Inner Circle for Full Access
              </Link>
            </div>
          )}
          <p className="text-xs text-[var(--text-secondary)] mt-2.5">
            Inner Circle members get full cycle log access, compound deep dives, and community intel.
          </p>
        </div>
      </div>
      {/* ── Social Proof Strip ── */}
      <div className="prohp-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Play className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-bold text-[var(--text-primary)]">YouTube</span>
          <a
            href="https://youtube.com/@prohormonepro"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--prohp-blue)] transition-colors"
          >
            Watch <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="stat-value">2M+</div>
            <div className="stat-label">Views</div>
          </div>
          <div className="text-center">
            <div className="stat-value">14K+</div>
            <div className="stat-label">Subscribers</div>
          </div>
          <div className="text-center">
            <div className="stat-value">300+</div>
            <div className="stat-label">Uploads</div>
          </div>
          <div className="text-center">
            <div className="stat-value">82K+</div>
            <div className="stat-label">Watch Hrs</div>
          </div>
        </div>
        <div className="border-t border-[var(--border-subtle)] pt-3">
          <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
            "Just got my bloodwork back after following your RAD protocol. Numbers are exactly where you said they'd be. Respect."
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">- Dylan M., YouTube comment</p>
        </div>
      </div>


      {/* Travis Image */}
      <div className="prohp-card p-5 mb-8">
        <div className="w-full max-w-md mx-auto rounded-xl overflow-hidden">
          <img src="/images/travis.jpg" alt="Travis Dillard" className="w-full h-auto rounded-xl object-cover" />
        </div>
      </div>
      {/* ── About Travis ── */}
      <div className="prohp-card p-5 mb-8">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">About Travis</h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          17 years in the space. 600+ one-on-one clients. 106 compound profiles written from direct experience.
          I built ProHormonePro because nobody else would do the work. Real risk discussion. Real receipts.
          No brand deals. No affiliate bias. Just the data and the experience to interpret it.
        </p>
      </div>

      {/* ── Consultation CTA ── */}
      <div className="prohp-card p-5 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              1-on-1 consultation - {user && (user.tier === 'inner_circle' || user.tier === 'admin') ? '$400' : '$500'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              Your stack, your goals, your questions. Real talk, no script, receipts included.
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 ml-4">
            <Link
              to="/consultation"
              className="prohp-btn-primary text-xs"
            >
              Book a Consultation
            </Link>
            <Link
              to="/r/general"
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--prohp-blue)] transition-colors text-right"
            >
              See what a real session looks like
            </Link>
          </div>
        </div>
      </div>



      {/* Dev Signal */}
      <div className="mb-8 py-4 text-center">
        <Link to="/dev" className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-600 hover:text-cyan-400 transition-colors group">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 group-hover:bg-cyan-400 transition-colors" />
          Are you a developer? Inspect the architecture.
        </Link>
      </div>
    </div>


  );
}
