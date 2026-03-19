import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MessageSquare, Search, X, AlertTriangle, Youtube, Lock, ExternalLink, ArrowUp, ArrowDown, CornerDownRight, CheckCircle, Award } from 'lucide-react';
import { api } from '../hooks/api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import GrepGate from '../components/GrepGate';
import BackButton from '../components/layout/BackButton';
// import UpgradeButton removed - all CTAs now use Link to /register
import useAuthStore from '../stores/auth';

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

function Banner({ title, body, actions, onDismiss }) {
  return (
    <div className="prohp-card p-4 border border-prohp-400/20 bg-prohp-400/8 relative mt-4">
      <button onClick={onDismiss} className="absolute top-2 right-2 text-slate-400 hover:text-slate-200" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-1 text-[13px] leading-relaxed text-slate-400">{body}</div>
      {actions ? <div className="mt-3 flex gap-2 flex-wrap">{actions}</div> : null}
    </div>
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <div className="text-sm text-slate-300 leading-relaxed mb-4">
            Full access to every thread, every search result, and every compound breakdown in The Library and The Lab.
          </div>
          <div className="space-y-2 mb-5">
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-prohp-400 mt-0.5">&#10003;</span>
              <span>Unlimited search across all threads and compounds</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-prohp-400 mt-0.5">&#10003;</span>
              <span>Post threads, log cycles, ask questions</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-prohp-400 mt-0.5">&#10003;</span>
              <span>Filter compounds by risk tier, hair loss, benefits</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-prohp-400 mt-0.5">&#10003;</span>
              <span>Full ranking list and side-by-side comparisons</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-prohp-400 mt-0.5">&#10003;</span>
              <span>Access every compound video breakdown</span>
            </div>
          </div>
          <div className="text-center mb-4">
            <span className="text-3xl font-extrabold text-slate-100">$19</span>
            <span className="text-sm text-slate-400 ml-1">/ month</span>
          </div>
          <Link to="/register" className="prohp-btn-primary w-full text-center block py-3 text-sm font-bold">
            Join Inner Circle
          </Link>
          <div className="mt-3 text-center text-[11px] text-slate-500">
            First 1,000 members get a permanent Founding Member badge.
          </div>
        </div>
      </div>
    </div>
  );
}

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


function GateCTA({ gate_state, upgrade_cta }) {
  if (!upgrade_cta || gate_state === "member") return null;
  var isWindow = gate_state === "window";
  return (
    <div className="prohp-card p-6 mb-4 border border-[rgba(34,157,216,0.2)] bg-[rgba(34,157,216,0.04)]">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-[#229DD8]" />
        <span className="text-sm font-bold text-slate-100">
          {isWindow ? "Unlock the Full Breakdown" : "Go Deeper"}
        </span>
      </div>
      <p className="text-[13px] text-slate-400 leading-relaxed mb-4">{upgrade_cta}</p>
      {isWindow ? (
        <a href="/compounds" className="prohp-btn-primary inline-flex items-center gap-2 text-xs px-4 py-2">
          Enter Your Email to Unlock
        </a>
      ) : (
        <div className="mt-2">
          <Link to="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00c6ff] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all">
            Unlock Inner Circle
          </Link>
        </div>
      )}
    </div>
  );
}

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

    // --- STAGE_046b: Compound Discussion Thread ---
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
    // --- /STAGE_046b ---

  var videoId = useMemo(function() {
    if (!compound) return '';
    return extractYouTubeId(compound.youtube_video_id) || extractYouTubeId(compound.youtube_url);
  }, [compound]);

  var [videoOpen, setVideoOpen] = useState(false);
  var [joinOpen, setJoinOpen] = useState(false);
  var [labelOpen, setLabelOpen] = useState(false);

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
    setQ('');
    setResults(null);
    setSearchErr('');
    setSearchCountState(getSessionInt(searchKey, 0));
    setBannerDismissed(getSessionInt(dismissKey, 0) === 1);
  }, [slug, searchKey, dismissKey]);

  useEffect(function() { setSessionInt(searchKey, searchCount); }, [searchKey, searchCount]);
  useEffect(function() { setSessionInt(dismissKey, bannerDismissed ? 1 : 0); }, [dismissKey, bannerDismissed]);

  // === STAGE_764: Community Intel (tier-gated) ===
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
  // === END STAGE_764 State ===


  var showBanner5 = !bannerDismissed && searchCount >= 5 && searchCount < 15;
  var showBanner15 = !bannerDismissed && searchCount >= 15;

  function runSearch(e) {
    if (e && e.preventDefault) e.preventDefault();
    var query = q.trim();
    if (!query) return;

    setSearchCountState(function(n) { return n + 1; });

    try { if (abortRef.current) abortRef.current.abort(); } catch (ex) {}
    var controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    setSearchErr('');
    setResults(null);

    api.get('/api/threads/search/query?q=' + encodeURIComponent(query) + '&limit=12&offset=0')
      .then(function(res) { setResults(res); })
      .catch(function(err2) {
        if (err2 && err2.name === 'AbortError') return;
        setSearchErr(err2 ? (err2.message || 'Search failed') : 'Search failed');
      })
      .finally(function() { setSearching(false); });
  }

  if (isLoading) {
    return (
      <div className="animate-pulse max-w-3xl mx-auto px-4 py-6">
        <div className="h-8 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-40 bg-slate-800 rounded" />
      </div>
    );
  }

  if (error) return <div className="text-red-400 text-sm text-center py-12">{error.message}</div>;
  if (!compound) return <div className="text-slate-400 text-sm text-center py-12">Compound not found.</div>;

  var hasRealSummary = compound.summary && !compound.summary.toLowerCase().includes('buy it here');

  return (
    <div className="max-w-3xl mx-auto animate-fade-in px-4 py-6">
      <BackButton fallback="/compounds" label="Back to Compounds" className="sticky top-0 z-30 flex w-fit items-center gap-1.5 text-xs text-slate-500 hover:text-prohp-400 transition-colors mb-4 py-3 -mt-6 pt-6 bg-[#0f1117]" />
      <Link to="/compounds" className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[100] inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 backdrop-blur-md px-5 py-3 text-sm font-semibold text-slate-200 shadow-lg transition hover:bg-slate-800 hover:border-white/20 hover:text-[#229DD8]" aria-label="Back to Encyclopedia"><ChevronLeft className="w-4 h-4" /> Encyclopedia</Link>

      <div className="prohp-card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">{compound.name}</h1>
            {compound.company ? <p className="text-xs text-slate-500 mb-2">{compound.company}</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              {compound.risk_tier ? (
                <span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + riskClass(compound.risk_tier)}>
                  Risk: {compound.risk_tier}
                </span>
              ) : null}
              {compound.category ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/40">
                  {compound.category}
                </span>
              ) : null}
              {compound.hair_loss_severity ? (
                <span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + hairClass(compound.hair_loss_severity)}>
                  Hair loss: {compound.hair_loss_severity}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex gap-2">
            {videoId ? (
              <button type="button" onClick={function() { setVideoOpen(true); }} className="prohp-btn-primary inline-flex items-center gap-2 text-xs">
                <Youtube className="w-4 h-4" /> Watch breakdown
              </button>
            ) : null}
          </div>
        </div>

        {hasRealSummary ? (
          <div className="text-sm text-slate-300 leading-relaxed mb-4">{compound.summary}</div>
        ) : null}

        {compound.product_image_url ? (
          <div className="mb-4">
            <img src={compound.product_image_url} alt={compound.name} className="rounded-xl max-h-48 object-contain mx-auto" />
          </div>
        ) : null}

        {videoId ? (
          <div className="mb-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-black/30 border border-white/5">
              <YouTubeEmbed videoId={videoId} title={compound.name + ' breakdown'} className="w-full h-full" />
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Use the player fullscreen icon, or hit <span className="text-slate-300 font-semibold">Watch breakdown</span> for theater mode.
            </div>
          </div>
        ) : null}

        {compound.product_url ? (
          <div className="mt-3 pt-3 border-t border-white/5">
            <a
              href={compound.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-prohp-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Support the encyclopedia
            </a>

      {/* Discount Code Display -- Stage 1308 / PL-017 */}
      {compound.public_discount_code && compound.product_url && (
        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-400 text-sm font-semibold">Discount Available</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="bg-slate-800 text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-wider">
              {gate_state === 'member' && compound.member_discount_code ? compound.member_discount_code : compound.public_discount_code}
            </code>
            <span className="text-slate-400 text-sm">
              {gate_state === 'member' && compound.member_discount_code
                ? 'Exclusive Inner Circle discount'
                : 'Use at checkout'}
            </span>
            <a href={compound.product_url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 transition-colors shadow-md"><ExternalLink className="w-3.5 h-3.5" />Buy Now</a>
          </div>
          {compound.product_price && (
            <p className="text-xs text-slate-500 mt-2">
              Apply to your order at the product page.
              {gate_state !== 'member' && ' Inner Circle members get exclusive deeper discounts.'}
            </p>
          )}
        </div>
      )}
            {compound.product_price && Number(compound.product_price) > 0 ? (function() {
              var price = parseFloat(compound.product_price);
              var pubCode = compound.public_discount_code;
              var memCode = compound.member_discount_code;
              var now = new Date();
              var mm = String(now.getUTCMonth() + 1).padStart(2, '0');
              var yy = String(now.getUTCFullYear()).slice(-2);
              var activeMemCode = 'PROHP' + mm + yy;
              var pubPrice = (price * 0.9).toFixed(2);
              var pubSave = (price * 0.1).toFixed(2);
              var memPrice = (price * 0.8).toFixed(2);
              var memSave = (price * 0.2).toFixed(2);
              var extraSave = (price * 0.1).toFixed(2);
              return (
                <div className="mt-3 space-y-2">
                  {pubCode ? (
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-300 font-semibold">{"Use code " + pubCode}</span>{" for 10% off. "}
                      {"Retail $" + price.toFixed(2)}{" → "}
                      <span className="text-emerald-400 font-semibold">{"$" + pubPrice}</span>
                      {" (save $" + pubSave + ")"}
                    </div>
                  ) : null}
                  {gate_state === "member" ? (
                    <div className="text-xs bg-[rgba(34,157,216,0.06)] border border-[rgba(34,157,216,0.15)] rounded-lg p-3">
                      <div className="text-slate-300 font-semibold mb-1">{"Your Inner Circle code " + activeMemCode + " saves 20%"}</div>
                      <div className="text-slate-400">
                        {"Retail $" + price.toFixed(2)}{" → "}
                        <span className="text-[#229DD8] font-semibold">{"$" + memPrice}</span>
                        {" (save $" + memSave + ")"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {"That is $" + extraSave + " more per bottle than the public code. Your membership pays for itself."}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })() : null}
          </div>
        ) : null}

        {compound.benefits ? (
          <div className="text-sm text-slate-400 mt-3">
            <span className="font-semibold text-slate-300">Benefits: </span>{compound.benefits}
          </div>
        ) : null}
      </div>

      <Modal open={videoOpen} title={(compound.name || 'Video') + ' - Breakdown'} onClose={function() { setVideoOpen(false); }}>
        <div className="aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
          <YouTubeEmbed videoId={videoId} title={compound.name + ' breakdown'} className="w-full h-full" />
        </div>
      </Modal>

      <JoinModal open={joinOpen} onClose={function() { setJoinOpen(false); }} />

      {gate_state === "window" && <GateCTA gate_state={gate_state} upgrade_cta={upgrade_cta} />}

      {compound.mechanism ? (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Mechanism</div>
          <MarkdownRenderer content={compound.mechanism} />
        </div>
      ) : null}

      {compound.dosing ? (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Dosing</div>
          <MarkdownRenderer content={compound.dosing} />
        </div>
      ) : null}

      {compound.side_effects ? (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-yellow-500" /> Side Effects
          </div>
          <MarkdownRenderer content={compound.side_effects} />
        </div>
      ) : null}

      {/* Nutrition Label - STAGE_045 */}
      {gate_state === "member" && compound.nutrition_label_url ? (
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
      ) : null}

      {gate_state === "member" && compound.nutrition_label_url ? (
        <Modal open={labelOpen} title={(compound.name || "Supplement") + " - Supplement Facts"} onClose={function() { setLabelOpen(false); }}>
          <div className="flex items-center justify-center p-4">
            <img src={compound.nutrition_label_url} alt={(compound.name || "Supplement") + " supplement facts"} className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </Modal>
      ) : null}

      {compound.hair_loss_explanation ? (
        <div className="text-xs text-slate-400 italic mb-6 px-1">
          Hair loss note: {compound.hair_loss_explanation}
        </div>
      ) : null}

      {/* Article Content Section - STAGE_045 */}
      {gate_state === "member" && compound.article_content ? (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Full Breakdown</div>
          <MarkdownRenderer content={compound.article_content} />
        </div>
      ) : null}

      {gate_state === "lead" && compound.article_preview ? (
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
      ) : null}

      {gate_state === "lead" && <GateCTA gate_state={gate_state} upgrade_cta={upgrade_cta} />}

      {!videoId && compound && (
        <div className="prohp-card p-5 mb-4 border border-prohp-400/20 bg-prohp-400/[0.04] text-center">
          <div className="text-sm font-semibold text-slate-200 mb-2">This compound hasn't been covered yet.</div>
          <p className="text-xs text-slate-400 mb-3">Want Travis to break it down? Drop a comment below and let him know.</p>
          <button onClick={function() { var el = document.getElementById('community-discussion'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="prohp-btn-primary text-xs">Request Coverage</button>
        </div>
      )}

      <div className="mb-12">
        {compound && (
          <GrepGate excludeSlug={compound?.slug || ""}
            autoQuery={compound.name}
            title={`Still have a question about ${compound.name} or another product? Search the library.`}
          />
        )}
      </div>


        {/* --- STAGE_046b: Community Discussion Thread --- */}
        {compound && compound.thread_id && (
  (
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
            ) : threadPosts.length > 0 ? (
              <div className="flex flex-col gap-1.5 mb-4">
                {threadPosts.map(function(post) {
                  return (
                    <div key={post.id} className={"prohp-card px-4 py-3 " + (post.is_best_answer ? "border-l-2 border-l-emerald-500/50 bg-emerald-500/[0.03] " : "") + (post.parent_id ? "ml-8 border-l-2 border-l-slate-800/50" : "")}>
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-0.5 min-w-[28px]">
                          <button
                            onClick={function() { user && votePost046.mutate({ postId: post.id, value: 1 }); }}
                            className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === 1 ? "text-prohp-400" : "text-slate-600 hover:text-prohp-400")}
                            disabled={!user}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className={"text-[11px] font-bold font-mono " + (post.score > 0 ? "text-prohp-400" : post.score < 0 ? "text-red-400" : "text-slate-500")}>{post.score}</span>
                          <button
                            onClick={function() { user && votePost046.mutate({ postId: post.id, value: -1 }); }}
                            className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === -1 ? "text-red-400" : "text-slate-600 hover:text-red-400")}
                            disabled={!user}
                          >
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
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageSquare className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No replies yet. Be the first to share your experience.</p>
              </div>
            )}

            {user && gate_state === "member" ? (
              <form onSubmit={handleReply046} className="border-t border-white/[0.04] pt-4">
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
                  <button type="submit" disabled={createReply046.isPending} className="prohp-btn-primary text-xs">
                    {createReply046.isPending ? "Posting..." : "Post Reply"}
                  </button>
                </div>
              </form>
              ) : gate_state === "lead" ? (
              <div className="border-t border-white/[0.04] pt-4 text-center">
                <p className="text-xs text-slate-400">
                  <a href="/login" className="text-prohp-400 hover:text-prohp-300">Log in</a> to join the conversation.
                </p>
              </div>
            ) : (
              <div className="border-t border-white/[0.04] pt-4 text-center">
                <p className="text-xs text-slate-400">
                  <Link to="/login" className="text-prohp-400 hover:text-prohp-300">Log in</Link> to join the conversation.
                </p>
              </div>
            )}
          </div>
        )
      )}
      {/* --- /STAGE_046b --- */}
      
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

      {relatedCycles.length ? (
        <div className="prohp-card p-6">
          <div className="text-sm font-semibold text-slate-200 mb-3">Related Cycles</div>
          <div className="flex flex-col gap-2">
            {relatedCycles.map(function(c) {
              return (
                <div key={c.id} className="prohp-card p-3">
                  <div className="text-[13px] font-semibold text-slate-200">{c.title}</div>
                  <div className="mt-1 text-[12px] text-slate-400">
                    {c.status ? 'Status: ' + c.status : ''}
                    {c.duration_weeks ? ' â”¬â•– ' + c.duration_weeks + ' weeks' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

        {/* === STAGE_764: Community Intel Section === */}
        {communityStats && communityStats.total > 0 && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(34,157,216,.06)', borderRadius: '12px', border: '1px solid rgba(34,157,216,.15)' }}>
            <h3 style={{ color: '#229DD8', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Community Intel
            </h3>

            {user && (user.tier === 'inner_circle' || user.tier === 'admin' || user.role === 'admin') ? (
              <div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div style={{ background: 'rgba(34,157,216,.12)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                    <span style={{ color: '#aaa', fontSize: '0.75rem' }}>Total Reports</span>
                    <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>{communityStats.total}</div>
                  </div>
                  {communityStats.with_side_effects > 0 && (
                    <div style={{ background: 'rgba(255,107,107,.12)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                      <span style={{ color: '#aaa', fontSize: '0.75rem' }}>Side Effect Reports</span>
                      <div style={{ color: '#ff6b6b', fontSize: '1.25rem', fontWeight: 600 }}>{communityStats.with_side_effects}</div>
                    </div>
                  )}
                </div>
                {communityStats.top_side_effects && communityStats.top_side_effects.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {communityStats.top_side_effects.slice(0, 6).map(function(se, i) {
                      return (
                        <span key={i} style={{ background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.25)', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: '#ff6b6b' }}>
                          {se.effect} ({se.count})
                        </span>
                      );
                    })}
                  </div>
                )}
                {communityComments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h4 style={{ color: '#ccc', fontSize: '0.8rem', fontWeight: 500, margin: 0 }}>Top Community Comments</h4>
                    {communityComments.map(function(c, i) {
                      return (
                        <div key={c.id || i} style={{ background: 'rgba(255,255,255,.04)', borderRadius: '8px', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,.06)' }}>
                          <div style={{ color: '#e0e0e0', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                            {c.content && c.content.length > 280 ? c.content.slice(0, 280) + '...' : c.content}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#888' }}>
                            <span>{c.author || 'Anonymous'}</span>
                            <span style={{ color: '#229DD8' }}>{c.likes || 0} likes</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <a href={'/community-intel?compound=' + encodeURIComponent(compound.name)} style={{ display: 'inline-block', marginTop: '1rem', color: '#229DD8', fontSize: '0.8rem', textDecoration: 'none' }}>
                  View all community data
                </a>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div style={{ background: 'rgba(34,157,216,.12)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                    <span style={{ color: '#aaa', fontSize: '0.75rem' }}>Total Reports</span>
                    <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>{communityStats.total}</div>
                  </div>
                  {communityStats.with_side_effects > 0 && (
                    <div style={{ background: 'rgba(255,107,107,.12)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                      <span style={{ color: '#aaa', fontSize: '0.75rem' }}>Side Effect Reports</span>
                      <div style={{ color: '#ff6b6b', fontSize: '1.25rem', fontWeight: 600 }}>{communityStats.with_side_effects}</div>
                    </div>
                  )}
                </div>
                {communityStats.top_side_effects && communityStats.top_side_effects.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {communityStats.top_side_effects.slice(0, 6).map(function(se, i) {
                      return (
                        <span key={i} style={{ background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.25)', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: '#ff6b6b' }}>
                          {se.effect} ({se.count})
                        </span>
                      );
                    })}
                  </div>
                )}
                <div style={{ textAlign: 'center', padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <p style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    Unlock full community intel: top comments, dosage patterns, and detailed reports
                  </p>
                  <a href="/register" className="prohp-btn-primary" style={{ display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none' }}>
                    Unlock Community Intel
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        {/* === END STAGE_764 === */}


          {/* Back to top — Stage 1123 */}
          <div className="flex justify-center mt-8 mb-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-slate-500 hover:text-[var(--prohp-blue)] transition-colors"
            >
              ↑ Back to top
            </button>
          </div>
    </div>
  );
}
