import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MessageSquare, Search, X, AlertTriangle, Youtube, Lock, ExternalLink, ArrowUp, ArrowDown, CornerDownRight, CheckCircle, Award, Clock, Shield, Beaker, Heart, Activity, Zap } from 'lucide-react';
import { api } from '../hooks/api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import GrepGate from '../components/GrepGate';
import BackButton from '../components/layout/BackButton';
import useAuthStore from '../stores/auth';

/* ═══════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════ */

function getSessionInt(key, fallback) {
  try {
    var raw = sessionStorage.getItem(key);
    var v = raw ? parseInt(raw, 10) : fallback;
    return Number.isFinite(v) ? v : fallback;
  } catch (e) {
    return fallback;
  }
}

function setSessionInt(key, value) {
  try { sessionStorage.setItem(key, String(value)); } catch (e) {}
}

function extractYouTubeId(input) {
  if (!input) return '';
  var s = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    var u = new URL(s);
    var host = u.hostname.replace('www.', '');
    if (host === 'youtu.be') {
      var id = u.pathname.replace('/', '').trim();
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : '';
    }
    var v = u.searchParams.get('v');
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    var m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (m && m[1]) return m[1];
  } catch (e) {}
  return '';
}

/* Render compound content with HTML support */
function ContentBlock({ content, className }) {
  if (!content) return null;
  /* Check if content has HTML tags (our wiki hyperlinks) */
  var hasHtml = /<[a-z][\s\S]*>/i.test(content);
  if (hasHtml) {
    return (
      <div
        className={className || 'text-sm text-slate-300 leading-relaxed whitespace-pre-line'}
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
      />
    );
  }
  return <MarkdownRenderer content={content} className={className} />;
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function YouTubeEmbed({ videoId, title, className }) {
  if (!videoId) return null;
  var src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&autoplay=0&playsinline=1';
  return (
    <iframe
      src={src}
      title={title || 'YouTube video'}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className={className || ''}
    />
  );
}

function Modal({ open, title, onClose, children }) {
  useEffect(function() {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    var prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return function() {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-sm font-semibold text-slate-200 truncate">{title}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4" /> Close
          </button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

function JoinModal({ open, onClose }) {
  useEffect(function() {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    var prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return function() {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="text-base font-bold text-slate-100">Join Inner Circle</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">
          <div className="text-sm text-slate-300 leading-relaxed mb-4">Full access to every thread, every search result, and every compound breakdown in The Library and The Lab.</div>
          <div className="space-y-2 mb-5">
            {['Unlimited search across all threads and compounds', 'Post threads, log cycles, ask questions', 'Filter compounds by risk tier, hair loss, benefits', 'Full ranking list and side-by-side comparisons', 'Access every compound video breakdown'].map(function(item, i) {
              return (<div key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="text-prohp-400 mt-0.5">&#10003;</span><span>{item}</span></div>);
            })}
          </div>
          <div className="text-center mb-4"><span className="text-3xl font-extrabold text-slate-100">$19</span><span className="text-sm text-slate-400 ml-1">/ month</span></div>
          <Link to="/register" className="prohp-btn-primary w-full text-center block py-3 text-sm font-bold">Join Inner Circle</Link>
          <div className="mt-3 text-center text-[11px] text-slate-500">First 1,000 members get a permanent Founding Member badge.</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BADGE & CLASS HELPERS
   ═══════════════════════════════════════════ */

function riskClass(tier) {
  var t = (tier || '').toLowerCase();
  if (t === 'low') return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40';
  if (t === 'moderate') return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/40';
  if (t === 'high') return 'bg-orange-900/60 text-orange-300 border border-orange-700/40';
  if (t === 'extreme') return 'bg-red-900/60 text-red-300 border border-red-700/40';
  return 'bg-slate-800 text-slate-300';
}

function hairClass(sev) {
  var s = (sev || '').toLowerCase();
  if (s === 'none') return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40';
  if (s === 'mild') return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/40';
  if (s === 'moderate') return 'bg-orange-900/60 text-orange-300 border border-orange-700/40';
  if (s === 'severe') return 'bg-red-900/60 text-red-300 border border-red-700/40';
  return 'bg-slate-800 text-slate-300';
}

function riskColor(tier) {
  var t = (tier || '').toLowerCase();
  if (t === 'low') return '#34d399';
  if (t === 'moderate') return '#fbbf24';
  if (t === 'high') return '#f97316';
  if (t === 'extreme') return '#ef4444';
  return '#94a3b8';
}

/* ═══════════════════════════════════════════
   V2 MICRO-COMPONENTS
   ═══════════════════════════════════════════ */

function HalfLifeBar({ halfLife, dosageRange }) {
  if (!halfLife && !dosageRange) return null;
  return (
    <div className="prohp-card p-4 mb-4 flex flex-wrap items-center gap-4 border border-white/5">
      {halfLife && (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-prohp-400" />
          <span className="text-xs text-slate-400">Half-life:</span>
          <span className="text-xs font-bold text-slate-200">{halfLife}</span>
        </div>
      )}
      {dosageRange && (
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-prohp-400" />
          <span className="text-xs text-slate-400">Dose:</span>
          <span className="text-xs font-bold text-slate-200">{dosageRange}</span>
        </div>
      )}
    </div>
  );
}

function SuppressionNote() {
  return (
    <div className="mt-1 ml-1 text-[11px] text-slate-500 italic leading-snug">
      Suppression = your body slows or stops making its own testosterone. You feel moody, tired, and unmotivated until levels recover. <Link to="/compounds/arimiplex" className="text-prohp-400 hover:text-prohp-300">PCT</Link> fixes this.
    </div>
  );
}

function BloodworkCTA({ compoundName }) {
  var ultaUrl = 'https://www.ultalabtests.com/partners/travisdillard/cart/cartshare?scl=eyJBY2NvdW50SUQiOjQ0NTA3LCJGZWVJRHMiOlsxXSwiSXRlbUlEcyI6WzQ4Miw2NzUsMzA3M10sIkl0ZW1Qcm9tb3Rpb25JRCI6bnVsbH0=#/shopping-cart';
  return (
    <div className="prohp-card p-5 mb-4 border border-prohp-400/15 bg-prohp-400/[0.03]">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-prohp-400" />
        <span className="text-sm font-bold text-slate-200">Bloodwork</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-white/5">
          <div className="text-[10px] font-bold text-prohp-400 uppercase tracking-wider mb-1">Before</div>
          <div className="text-[10px] text-slate-400 leading-tight">Baseline<br/>Total T, Free T, SHBG, E2, Liver, Lipids, CBC</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-white/5">
          <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1">During (wk4)</div>
          <div className="text-[10px] text-slate-400 leading-tight">Mid-cycle<br/>Same panel, compare to baseline</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-white/5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Post-PCT</div>
          <div className="text-[10px] text-slate-400 leading-tight">4 wks after<br/>Confirm recovery</div>
        </div>
      </div>
      <a
        href={ultaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-prohp-400 to-[#00c6ff] px-5 py-3 text-sm font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all"
      >
        <Activity className="w-4 h-4" />
        Order your bloodwork. Walk into any lab. No doctor needed.
      </a>
    </div>
  );
}

function CycleLogCTA({ compoundName }) {
  return (
    <div className="prohp-card p-5 mb-4 border border-emerald-700/20 bg-emerald-900/[0.06]">
      <div className="text-sm font-bold text-slate-200 mb-2">Have you run {compoundName}?</div>
      <p className="text-xs text-slate-400 mb-3">Log your cycle. We will give you in-the-trenches feedback.</p>
      <div className="flex flex-wrap gap-3">
        <Link to="/cycles" className="prohp-btn-primary text-xs inline-flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Start a Cycle Log
        </Link>
        <Link to="/rooms/lab" className="text-xs text-slate-400 hover:text-prohp-400 transition-colors inline-flex items-center gap-1">
          Your log appears publicly in The Lab &rarr;
        </Link>
      </div>
    </div>
  );
}

function GateCTA({ gate_state, upgrade_cta }) {
  if (!upgrade_cta || gate_state === "member") return null;
  var isWindow = gate_state === "window";
  return (
    <div className="prohp-card p-6 mb-4 border border-[rgba(34,157,216,0.2)] bg-[rgba(34,157,216,0.04)]">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-[#229DD8]" />
        <span className="text-sm font-bold text-slate-100">
          {isWindow ? "Unlock the Full Breakdown" : "Want the full breakdown?"}
        </span>
      </div>
      <p className="text-[13px] text-slate-400 leading-relaxed mb-4">
        {isWindow ? upgrade_cta : "Dosing protocols, stacking logic, PCT, bloodwork markers."}
      </p>
      {isWindow ? (
        <a href="/compounds" className="prohp-btn-primary inline-flex items-center gap-2 text-xs px-4 py-2">Enter Your Email to Unlock</a>
      ) : (
        <Link to="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00c6ff] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all">
          Unlock Inner Circle
        </Link>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DISCOUNT CODE SECTION (preserved from V1)
   ═══════════════════════════════════════════ */

function DiscountSection({ compound, gate_state }) {
  if (!compound.public_discount_code || !compound.product_url) return null;

  var isSoma = (compound.product_url || '').toLowerCase().indexOf('somachem') !== -1;

  if (isSoma) {
    return (
      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-emerald-400 text-sm font-semibold">Discount Available</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="bg-slate-800 text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-wider">TRAVISD</code>
          <span className="text-slate-400 text-sm">20% off - use at checkout</span>
          <a href={compound.product_url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 transition-colors shadow-md">
            <ExternalLink className="w-3.5 h-3.5" />Buy Now
          </a>
        </div>
        <p className="text-xs text-slate-500 mt-2">Apply to your order at the product page.</p>
      </div>
    );
  }

  var now = new Date();
  var mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  var yy = String(now.getUTCFullYear()).slice(-2);
  var activeMemCode = 'PROHP' + mm + yy;
  var price = compound.product_price ? parseFloat(compound.product_price) : 0;
  var hasPrice = price > 0;

  return (
    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-emerald-400 text-sm font-semibold">Discount Available</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <code className="bg-slate-800 text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-wider">
          {gate_state === 'member' ? activeMemCode : 'TRAVISD'}
        </code>
        <span className="text-slate-400 text-sm">
          {gate_state === 'member' ? '20% off - Inner Circle exclusive' : '10% off - use at checkout'}
        </span>
        <a href={compound.product_url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 transition-colors shadow-md">
          <ExternalLink className="w-3.5 h-3.5" />Buy Now
        </a>
      </div>
      {hasPrice ? (
        <div className="mt-3 space-y-2">
          {gate_state !== 'member' ? (
            <div className="text-xs text-slate-400">
              <span className="text-slate-300 font-semibold">Use code TRAVISD</span>{" for 10% off. "}
              {"Retail $" + price.toFixed(2)}{" \u2192 "}
              <span className="text-emerald-400 font-semibold">{"$" + (price * 0.9).toFixed(2)}</span>
              {" (save $" + (price * 0.1).toFixed(2) + ")"}
            </div>
          ) : (
            <div className="text-xs bg-[rgba(34,157,216,0.06)] border border-[rgba(34,157,216,0.15)] rounded-lg p-3">
              <div className="text-slate-300 font-semibold mb-1">{"Your Inner Circle code " + activeMemCode + " saves 20%"}</div>
              <div className="text-slate-400">
                {"Retail $" + price.toFixed(2)}{" \u2192 "}
                <span className="text-[#229DD8] font-semibold">{"$" + (price * 0.8).toFixed(2)}</span>
                {" (save $" + (price * 0.2).toFixed(2) + ")"}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {"That is $" + (price * 0.1).toFixed(2) + " more per bottle than the public code. Your membership pays for itself."}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500 mt-2">Apply to your order at the product page.</p>
      )}
      {gate_state !== 'member' && (
        <div className="mt-2 text-[11px] text-slate-500">Inner Circle members get 20% off.</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function CompoundDetail() {
  var { slug } = useParams();

  var { data, isLoading, error } = useQuery({
    queryKey: ['compound', slug],
    queryFn: function() { return api.get('/api/compounds/' + slug); },
    enabled: !!slug,
  });

  var compound = data ? data.compound : null;
  var relatedThreads = data ? (data.related_threads || []) : [];
  var relatedCycles = data ? (data.related_cycles || []) : [];
  var gate_state = data ? (data.gate_state || 'window') : 'window';
  var upgrade_cta = data ? (data.upgrade_cta || '') : '';

  /* --- Community Discussion Thread (STAGE_046b) --- */
  var user = useAuthStore(function(s) { return s.user; });
  var queryClient = useQueryClient();
  var [replyBody046, setReplyBody046] = useState("");
  var [replyTo046, setReplyTo046] = useState(null);
  var [replyError046, setReplyError046] = useState("");

  var threadQuery = useQuery({
    queryKey: ["compound-thread", compound ? compound.thread_id : null],
    queryFn: function() { return api.get("/api/threads/" + compound.thread_id); },
    enabled: !!(compound && compound.thread_id),
  });

  var threadData = threadQuery.data || null;
  var threadPosts = threadData ? (threadData.posts || []) : [];
  var threadPagination = threadData ? (threadData.pagination || {}) : {};

  var votePost046 = useMutation({
    mutationFn: function(args) { return api.post("/api/posts/" + args.postId + "/vote", { value: args.value }); },
    onSuccess: function() { queryClient.invalidateQueries({ queryKey: ["compound-thread", compound ? compound.thread_id : null] }); },
  });

  var createReply046 = useMutation({
    mutationFn: function(payload) { return api.post("/api/posts", payload); },
    onSuccess: function() {
      queryClient.invalidateQueries({ queryKey: ["compound-thread", compound ? compound.thread_id : null] });
      setReplyBody046("");
      setReplyTo046(null);
      setReplyError046("");
    },
    onError: function(err) { setReplyError046(err.message); },
  });

  var handleReply046 = function(e) {
    e.preventDefault();
    if (!replyBody046.trim()) { setReplyError046("Say something."); return; }
    setReplyError046("");
    createReply046.mutate({
      thread_id: compound.thread_id,
      body: replyBody046.trim(),
      parent_id: replyTo046 || undefined,
    });
  };

  var videoId = useMemo(function() {
    if (!compound) return '';
    return extractYouTubeId(compound.youtube_video_id) || extractYouTubeId(compound.youtube_url);
  }, [compound]);

  var [videoOpen, setVideoOpen] = useState(false);
  var [joinOpen, setJoinOpen] = useState(false);
  var [labelOpen, setLabelOpen] = useState(false);
  var [showAllPosts, setShowAllPosts] = useState(false);

  var [q, setQ] = useState('');
  var [searching, setSearching] = useState(false);
  var [searchErr, setSearchErr] = useState('');
  var [results, setResults] = useState(null);

  var searchKey = 'compoundSearchCount:' + (slug || 'x');
  var dismissKey = 'compoundBannerDismissed:' + (slug || 'x');
  var [searchCount, setSearchCountState] = useState(function() { return getSessionInt(searchKey, 0); });
  var [bannerDismissed, setBannerDismissed] = useState(function() { return getSessionInt(dismissKey, 0) === 1; });
  var abortRef = useRef(null);

  useEffect(function() {
    setQ(''); setResults(null); setSearchErr('');
    setSearchCountState(getSessionInt(searchKey, 0));
    setBannerDismissed(getSessionInt(dismissKey, 0) === 1);
  }, [slug, searchKey, dismissKey]);

  useEffect(function() { setSessionInt(searchKey, searchCount); }, [searchKey, searchCount]);
  useEffect(function() { setSessionInt(dismissKey, bannerDismissed ? 1 : 0); }, [dismissKey, bannerDismissed]);

  /* === Community Intel (STAGE_764) === */
  var [communityStats, setCommunityStats] = useState(null);
  var [communityComments, setCommunityComments] = useState([]);

  useEffect(function() {
    if (!compound || !compound.name) return;
    var apiBase = import.meta.env.VITE_API_URL || '';
    var encoded = encodeURIComponent(compound.name);
    Promise.all([
      fetch(apiBase + '/api/community-comments/stats?compound=' + encoded).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
      fetch(apiBase + '/api/community-comments?compound=' + encoded + '&limit=5&sort=likes').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
    ]).then(function(results) {
      setCommunityStats(results[0]);
      setCommunityComments(results[1] && results[1].comments ? results[1].comments : []);
    }).catch(function() {
      setCommunityStats(null);
      setCommunityComments([]);
    });
  }, [compound ? compound.name : null]);

  function runSearch(e) {
    if (e && e.preventDefault) e.preventDefault();
    var query = q.trim();
    if (!query) return;
    setSearchCountState(function(n) { return n + 1; });
    try { if (abortRef.current) abortRef.current.abort(); } catch (ex) {}
    var controller = new AbortController();
    abortRef.current = controller;
    setSearching(true); setSearchErr(''); setResults(null);
    api.get('/api/threads/search/query?q=' + encodeURIComponent(query) + '&limit=12&offset=0')
      .then(function(res) { setResults(res); })
      .catch(function(err2) {
        if (err2 && err2.name === 'AbortError') return;
        setSearchErr(err2 ? (err2.message || 'Search failed') : 'Search failed');
      })
      .finally(function() { setSearching(false); });
  }

  /* ═══════════════════════════════════════════
     LOADING / ERROR / NOT FOUND STATES
     ═══════════════════════════════════════════ */

  if (isLoading) {
    return (
      <div className="animate-pulse max-w-3xl mx-auto px-4 py-6">
        <div className="h-8 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-4 bg-slate-800/60 rounded w-2/3 mb-3" />
        <div className="h-40 bg-slate-800 rounded mb-4" />
        <div className="h-24 bg-slate-800/40 rounded" />
      </div>
    );
  }

  if (error) return <div className="text-red-400 text-sm text-center py-12">{error.message}</div>;
  if (!compound) return <div className="text-slate-400 text-sm text-center py-12">Compound not found.</div>;

  var hasRealSummary = compound.summary && !compound.summary.toLowerCase().includes('buy it here');
  var isSuppressive = compound.risk_tier && ['moderate', 'high', 'extreme'].indexOf(compound.risk_tier.toLowerCase()) !== -1;

  /* Cap discussion at 5 posts unless expanded */
  var visiblePosts = showAllPosts ? threadPosts : threadPosts.slice(0, 5);
  var hasMorePosts = threadPosts.length > 5;

  /* ═══════════════════════════════════════════
     V2 RENDER - REORDERED SECTIONS
     ═══════════════════════════════════════════ */

  return (
    <div className="max-w-3xl mx-auto animate-fade-in px-4 py-6">
      <BackButton fallback="/compounds" label="Back to Compounds" className="sticky top-0 z-30 flex w-fit items-center gap-1.5 text-xs text-slate-500 hover:text-prohp-400 transition-colors mb-4 py-3 -mt-6 pt-6 bg-[#0f1117]" />
      <Link to="/compounds" className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[100] inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 backdrop-blur-md px-5 py-3 text-sm font-semibold text-slate-200 shadow-lg transition hover:bg-slate-800 hover:border-white/20 hover:text-[#229DD8]" aria-label="Back to Encyclopedia"><ChevronLeft className="w-4 h-4" /> Encyclopedia</Link>

      {/* ═══ SECTION 1: HEADER - Name, Badges, Risk, Category ═══ */}
      <div className="prohp-card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">{compound.name}</h1>
            {compound.company && <p className="text-xs text-slate-500 mb-2">{compound.company}</p>}
            <div className="flex flex-wrap items-center gap-2">
              {compound.risk_tier && (
                <span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + riskClass(compound.risk_tier)}>
                  Risk: {compound.risk_tier.charAt(0).toUpperCase() + compound.risk_tier.slice(1).toLowerCase()}
                </span>
              )}
              {compound.category && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/40">
                  {compound.category}
                </span>
              )}
              {compound.hair_loss_severity && (
                <span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + hairClass(compound.hair_loss_severity)}>
                  Hair loss: {compound.hair_loss_severity}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {videoId && (
              <button type="button" onClick={function() { setVideoOpen(true); }} className="prohp-btn-primary inline-flex items-center gap-2 text-xs">
                <Youtube className="w-4 h-4" /> Watch breakdown
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        {hasRealSummary && <ContentBlock content={compound.summary} className="text-sm text-slate-300 leading-relaxed mb-4" />}

        {/* Product image */}
        {compound.product_image_url && (
          <div className="mb-4">
            <img src={compound.product_image_url} alt={compound.name} className="rounded-xl max-h-48 object-contain mx-auto" />
          </div>
        )}

        {/* Buy link + discount */}
        {compound.product_url && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <a href={compound.product_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-prohp-400 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Support the encyclopedia
            </a>
            <DiscountSection compound={compound} gate_state={gate_state} />
          </div>
        )}

        {/* Benefits */}
        {compound.benefits && (
          <div className="text-sm text-slate-400 mt-3">
            <span className="font-semibold text-slate-300">Benefits: </span>
            <ContentBlock content={compound.benefits} />
          </div>
        )}

        {/* Suppression note - only when relevant */}
        {isSuppressive && <SuppressionNote />}
      </div>

      {/* Modals */}
      <Modal open={videoOpen} title={(compound.name || 'Video') + ' - Breakdown'} onClose={function() { setVideoOpen(false); }}>
        <div className="aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
          <YouTubeEmbed videoId={videoId} title={compound.name + ' breakdown'} className="w-full h-full" />
        </div>
      </Modal>
      <JoinModal open={joinOpen} onClose={function() { setJoinOpen(false); }} />

      {/* Free user gate */}
      {gate_state === "window" && <GateCTA gate_state={gate_state} upgrade_cta={upgrade_cta} />}

      {/* ═══ SECTION 2: HALF-LIFE QUICK VIEW ═══ */}
      <HalfLifeBar halfLife={compound.half_life} dosageRange={compound.dosage_range} />

      {/* ═══ SECTION 3: MECHANISM (deep dive) ═══ */}
      {compound.mechanism && (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Mechanism</div>
          <ContentBlock content={compound.mechanism} />
        </div>
      )}

      {/* ═══ SECTION 4: VIDEO (moved below mechanism) ═══ */}
      {videoId && (
        <div className="prohp-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-slate-200">{compound.name} - Video Breakdown</span>
          </div>
          <div className="aspect-video rounded-lg overflow-hidden bg-black/30 border border-white/5">
            <YouTubeEmbed videoId={videoId} title={compound.name + ' breakdown'} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* ═══ SECTION 5: DOSING ═══ */}
      {compound.dosing && (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Dosing</div>
          <ContentBlock content={compound.dosing} />
        </div>
      )}

      {/* ═══ SECTION 6: SIDE EFFECTS ═══ */}
      {compound.side_effects && (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-yellow-500" /> Side Effects
          </div>
          <ContentBlock content={compound.side_effects} />
        </div>
      )}

      {/* Nutrition Label (member only) */}
      {gate_state === "member" && compound.nutrition_label_url && (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Supplement Facts</div>
          <img
            src={compound.nutrition_label_url}
            alt={(compound.name || "Supplement") + " supplement facts"}
            className="rounded-xl max-h-64 object-contain mx-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={function() { setLabelOpen(true); }}
          />
          <div className="mt-2 text-[11px] text-slate-500 text-center">Click to enlarge</div>
        </div>
      )}
      {gate_state === "member" && compound.nutrition_label_url && (
        <Modal open={labelOpen} title={(compound.name || "Supplement") + " - Supplement Facts"} onClose={function() { setLabelOpen(false); }}>
          <div className="flex items-center justify-center p-4">
            <img src={compound.nutrition_label_url} alt={(compound.name || "Supplement") + " supplement facts"} className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </Modal>
      )}

      {compound.hair_loss_explanation && (
        <div className="text-xs text-slate-400 italic mb-4 px-1">Hair loss note: {compound.hair_loss_explanation}</div>
      )}

      {/* Full article content (member only) */}
      {gate_state === "member" && compound.article_content && (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Full Breakdown</div>
          <ContentBlock content={compound.article_content} />
        </div>
      )}

      {/* Article preview + upsell (lead only) */}
      {gate_state === "lead" && compound.article_preview && (
        <div className="prohp-card p-6 mb-4 border border-[rgba(34,157,216,0.2)] bg-[rgba(34,157,216,0.04)]">
          <div className="text-sm font-semibold text-slate-200 mb-2">Article Preview</div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{compound.article_preview}</p>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-[#229DD8]" />
            <span className="text-sm font-bold text-slate-100">Want the full breakdown?</span>
          </div>
          <p className="text-[13px] text-slate-400 mb-4">Dosing protocols, stacking logic, PCT, bloodwork markers.</p>
          <Link to="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00c6ff] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all">
            Unlock Inner Circle
          </Link>
        </div>
      )}

      {gate_state === "lead" && <GateCTA gate_state={gate_state} upgrade_cta={upgrade_cta} />}

      {/* ═══ SECTION 7: BLOODWORK CTA (member only) ═══ */}
      {gate_state === "member" && isSuppressive && (
        <BloodworkCTA compoundName={compound.name} />
      )}

      {/* ═══ SECTION 8: CYCLE LOG CTA (member only) ═══ */}
      {gate_state === "member" && (
        <CycleLogCTA compoundName={compound.name} />
      )}

      {/* "Not covered yet" prompt */}
      {!videoId && compound && (
        <div className="prohp-card p-5 mb-4 border border-prohp-400/20 bg-prohp-400/[0.04] text-center">
          <div className="text-sm font-semibold text-slate-200 mb-2">This compound has not been covered yet.</div>
          <p className="text-xs text-slate-400 mb-3">Want Travis to break it down? Drop a comment below and let him know.</p>
          <button onClick={function() { var el = document.getElementById('community-discussion'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="prohp-btn-primary text-xs">Request Coverage</button>
        </div>
      )}

      {/* ═══ SECTION 9: SEARCH ═══ */}
      <div className="mb-8">
        {compound && (
          <GrepGate excludeSlug={compound.slug || ""}
            autoQuery={compound.name}
            title={'Still have a question about ' + compound.name + ' or another product? Search the library.'}
          />
        )}
      </div>

      {/* ═══ SECTION 10: COMMUNITY DISCUSSION (capped at 5) ═══ */}
      {compound && compound.thread_id && (
        <div id="community-discussion" className="prohp-card p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-prohp-400" />
              <div className="text-sm font-semibold text-slate-200">
                Community Discussion
                <span className="text-slate-500 font-normal ml-1.5">
                  ({threadPagination.total || 0} {threadPagination.total === 1 ? "reply" : "replies"})
                </span>
              </div>
            </div>
            <Link to={"/t/" + compound.thread_id} className="text-xs text-prohp-400 hover:text-prohp-300 transition-colors">
              View full discussion &rarr;
            </Link>
          </div>

          {threadQuery.isLoading ? (
            <div className="animate-pulse">
              <div className="h-16 bg-slate-800 rounded mb-2" />
              <div className="h-16 bg-slate-800 rounded mb-2" />
              <div className="h-16 bg-slate-800 rounded" />
            </div>
          ) : threadQuery.error ? (
            <div className="text-center py-4">
              <p className="text-xs text-slate-500">Discussion temporarily unavailable.</p>
              <Link to={"/t/" + compound.thread_id} className="text-xs text-prohp-400 hover:text-prohp-300">View thread directly &rarr;</Link>
            </div>
          ) : visiblePosts.length > 0 ? (
            <div className="flex flex-col gap-1.5 mb-4">
              {visiblePosts.map(function(post) {
                return (
                  <div key={post.id} className={"prohp-card px-4 py-3 " + (post.is_best_answer ? "border-l-2 border-l-emerald-500/50 bg-emerald-500/[0.03] " : "") + (post.parent_id ? "ml-8 border-l-2 border-l-slate-800/50" : "")}>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-0.5 min-w-[28px]">
                        <button onClick={function() { user && votePost046.mutate({ postId: post.id, value: 1 }); }} className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === 1 ? "text-prohp-400" : "text-slate-600 hover:text-prohp-400")} disabled={!user}>
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className={"text-[11px] font-bold font-mono " + (post.score > 0 ? "text-prohp-400" : post.score < 0 ? "text-red-400" : "text-slate-500")}>{post.score}</span>
                        <button onClick={function() { user && votePost046.mutate({ postId: post.id, value: -1 }); }} className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === -1 ? "text-red-400" : "text-slate-600 hover:text-red-400")} disabled={!user}>
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        {post.is_best_answer && (
                          <div className="flex items-center gap-1.5 mb-2 text-emerald-400 text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5" /> Verdict
                          </div>
                        )}
                        <MarkdownRenderer content={post.body} className="text-sm text-slate-300 leading-relaxed mb-2" />
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                          <Link to={"/u/" + post.author_username} className="font-medium text-slate-400 hover:text-prohp-400 hover:underline transition-colors">{post.author_username}</Link>
                          {post.author_founding && <span className="tier-badge tier-founding text-[8px] py-0">FM</span>}
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          {gate_state === "member" && user && (
                            <button onClick={function() { setReplyTo046(post.id); var el = document.getElementById("reply-box-046"); if (el) el.focus(); }} className="flex items-center gap-1 text-slate-500 hover:text-prohp-400 transition-colors ml-auto">
                              <CornerDownRight className="w-3 h-3" /> Reply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Show more button */}
              {hasMorePosts && !showAllPosts && (
                <button onClick={function() { setShowAllPosts(true); }} className="text-xs text-prohp-400 hover:text-prohp-300 transition-colors py-2 text-center">
                  Show all {threadPosts.length} replies &darr;
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="w-5 h-5 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No replies yet. Be the first to share your experience.</p>
            </div>
          )}

          {/* Reply form - ONLY for members */}
          {user && gate_state === "member" ? (
            <div className="border-t border-white/[0.04] pt-4">
              {replyTo046 && (
                <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                  <CornerDownRight className="w-3 h-3" />
                  <span>Replying to a post</span>
                  <button type="button" onClick={function() { setReplyTo046(null); }} className="text-slate-500 hover:text-slate-300 ml-1">cancel</button>
                </div>
              )}
              <textarea id="reply-box-046" value={replyBody046} onChange={function(e) { setReplyBody046(e.target.value); }} placeholder="Drop your experience, ask your question..." className="prohp-input min-h-[80px] resize-y mb-3 text-sm" rows={3} />
              {replyError046 && <div className="text-xs text-red-400 mb-2">{replyError046}</div>}
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-600">Receipts appreciated. Proof over hype.</p>
                <button type="submit" onClick={handleReply046} disabled={createReply046.isPending} className="prohp-btn-primary text-xs">
                  {createReply046.isPending ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ═══ SECTION 11: RELATED THREADS ═══ */}
      <div className="prohp-card p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <div className="text-sm font-semibold text-slate-200">Related Threads</div>
          </div>
          <Link to="/rooms/library" className="text-xs text-slate-500 hover:text-prohp-400 transition-colors">Library</Link>
        </div>
        {relatedThreads.length ? (
          <div className="flex flex-col gap-2">
            {relatedThreads.map(function(t) {
              return (
                <Link key={t.id} to={'/t/' + t.id} className="prohp-card p-3 hover:bg-slate-800/40 transition-colors">
                  <div className="text-[13px] font-semibold text-slate-200">{t.title}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{t.reply_count} replies</div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-400">No related threads yet.</div>
        )}
      </div>

      {/* Related Cycles */}
      {relatedCycles.length > 0 && (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-3">Related Cycles</div>
          <div className="flex flex-col gap-2">
            {relatedCycles.map(function(c) {
              return (
                <div key={c.id} className="prohp-card p-3">
                  <div className="text-[13px] font-semibold text-slate-200">{c.title}</div>
                  <div className="mt-1 text-[12px] text-slate-400">
                    {c.status ? 'Status: ' + c.status : ''}
                    {c.duration_weeks ? ' - ' + c.duration_weeks + ' weeks' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === Community Intel (STAGE_764) === */}
      {communityStats && communityStats.total > 0 && (
        <div className="prohp-card p-6 mb-4 border border-prohp-400/15 bg-prohp-400/[0.03]">
          <h3 className="text-sm font-bold text-prohp-400 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Community Intel
          </h3>
          <div className="flex gap-3 flex-wrap mb-4">
            <div className="bg-prohp-400/10 rounded-lg px-3 py-2">
              <span className="text-[10px] text-slate-400 block">Total Reports</span>
              <div className="text-lg font-bold text-white">{communityStats.total}</div>
            </div>
            {communityStats.with_side_effects > 0 && (
              <div className="bg-red-900/20 rounded-lg px-3 py-2">
                <span className="text-[10px] text-slate-400 block">Side Effect Reports</span>
                <div className="text-lg font-bold text-red-400">{communityStats.with_side_effects}</div>
              </div>
            )}
          </div>
          {communityStats.top_side_effects && communityStats.top_side_effects.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {communityStats.top_side_effects.slice(0, 6).map(function(se, i) {
                return (
                  <span key={i} className="bg-red-900/15 border border-red-700/25 rounded-full px-3 py-1 text-[11px] text-red-400">
                    {se.effect} ({se.count})
                  </span>
                );
              })}
            </div>
          )}
          {user && (user.tier === 'inner_circle' || user.tier === 'admin' || user.role === 'admin') ? (
            <div>
              {communityComments.length > 0 && (
                <div className="flex flex-col gap-2 mt-3">
                  <h4 className="text-xs font-semibold text-slate-400">Top Community Comments</h4>
                  {communityComments.map(function(c, i) {
                    return (
                      <div key={c.id || i} className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                        <div className="text-[13px] text-slate-300 leading-relaxed mb-2">
                          {c.content && c.content.length > 280 ? c.content.slice(0, 280) + '...' : c.content}
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>{c.author || 'Anonymous'}</span>
                          <span className="text-prohp-400">{c.likes || 0} likes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center pt-3 border-t border-white/5">
              <p className="text-xs text-slate-400 mb-3">Unlock full community intel: top comments, dosage patterns, and detailed reports</p>
              <Link to="/register" className="prohp-btn-primary text-xs px-4 py-2">Unlock Community Intel</Link>
            </div>
          )}
        </div>
      )}

      {/* ═══ SECTION 12: FOOTER ═══ */}
      <div className="text-center py-6 mb-8">
        <div className="text-sm font-bold text-slate-300 mb-1">Proof Over Hype.</div>
        <div className="text-xs text-slate-500">Track your bloodwork. Trust your body. Adjust accordingly.</div>
      </div>

      {/* Back to top */}
      <div className="flex justify-center mb-4">
        <button onClick={function() { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs text-slate-500 hover:text-[var(--prohp-blue)] transition-colors">
          &uarr; Back to top
        </button>
      </div>
    </div>
  );
}
