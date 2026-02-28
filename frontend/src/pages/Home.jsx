import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Lock, MessageSquare, Users, FlaskConical, Play, ExternalLink, Plus } from 'lucide-react';
import { api } from '../hooks/api';
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
            <p className="text-sm text-[var(--text-secondary)]">
              52+ compounds reviewed. 1M+ views. Every claim receipted.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2 leading-tight">
              The place where proof beats hype.
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
              52+ compounds reviewed. 1M+ YouTube views. 200+ consultations.
              Every claim receipted, every protocol questioned, every side effect documented.
              No unverified claims. Just the work.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link to="/register" className="prohp-btn-primary text-sm">
                Start Here
              </Link>
              <Link to="/r/general" className="prohp-btn-ghost text-sm">
                Browse the Forum
              </Link>
            </div>
          </div>
        )}
      </div>

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
                      <span className="tier-badge tier-premium text-[8px] py-0">
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

      {/* ── Encyclopedia Teaser ── */}
      <Link
        to="/compounds"
        className="prohp-card flex items-center justify-between p-4 mb-8 group"
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
              52 compounds. SARMs, prohormones, peptides, PCT. Risk tiers and mechanism breakdowns.
            </div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--prohp-blue)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>

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
            <div className="stat-value">1M+</div>
            <div className="stat-label">Views</div>
          </div>
          <div className="text-center">
            <div className="stat-value">13K+</div>
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
          <p className="text-[10px] text-[var(--text-muted)] mt-1">&mdash; Dylan M., YouTube comment</p>
        </div>
      </div>

      {/* ── Consultation CTA ── */}
      <div className="prohp-card p-5 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              1-on-1 consultation &mdash; $500
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              Your stack, your goals, your questions. Real talk, no script, receipts included.
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 ml-4">
            <a
              href="https://prohormonepro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="prohp-btn-primary text-xs"
            >
              Book a Consultation
            </a>
            <Link
              to="/r/general"
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--prohp-blue)] transition-colors text-right"
            >
              See what a real session looks like
            </Link>
          </div>
        </div>
      </div>

      {/* ── Founding Member Banner ── */}
      {!user && (
        <div className="rounded-xl p-5 mb-8 border border-amber-500/15 bg-amber-500/[0.04]">
          <div className="flex items-center gap-2 mb-2">
            <span className="tier-badge tier-founding">Founding Member</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            First 1,000 members get a permanent Founding Member badge. No gimmick. You showed up before anyone else did.
          </p>
          <Link to="/register" className="prohp-btn-primary text-xs">
            Claim Your Spot
          </Link>
        </div>
      )}
    </div>
  );
}
