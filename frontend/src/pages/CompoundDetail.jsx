import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, MessageSquare, Search, X, AlertTriangle, Youtube } from 'lucide-react';
import { api } from '../hooks/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

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

  var videoId = useMemo(function() {
    if (!compound) return '';
    return extractYouTubeId(compound.youtube_video_id) || extractYouTubeId(compound.youtube_url);
  }, [compound]);

  var [videoOpen, setVideoOpen] = useState(false);

  // Search state
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

  return (
    <div className="max-w-3xl mx-auto animate-fade-in px-4 py-6">
      <Link to="/compounds" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-prohp-400 transition-colors mb-4">
        <ChevronLeft className="w-3.5 h-3.5" /> Encyclopedia
      </Link>

      {/* Header card */}
      <div className="prohp-card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">{compound.name}</h1>
            {compound.company ? <p className="text-xs text-slate-500 mb-2">{compound.company}</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              <span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded risk-' + (compound.risk_tier || 'unknown')}>
                Risk: {compound.risk_tier || 'unknown'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                {compound.category}
              </span>
              {compound.hair_loss_severity ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-300">
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

        {compound.summary ? (
          <div className="text-sm text-slate-300 leading-relaxed mb-4">{compound.summary}</div>
        ) : null}

        {/* Inline YouTube embed */}
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

        {compound.benefits ? (
          <div className="text-sm text-slate-400">
            <span className="font-semibold text-slate-300">Benefits: </span>{compound.benefits}
          </div>
        ) : null}
      </div>

      {/* Theater mode modal */}
      <Modal open={videoOpen} title={(compound.name || 'Video') + ' — Breakdown'} onClose={function() { setVideoOpen(false); }}>
        <div className="aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
          <YouTubeEmbed videoId={videoId} title={compound.name + ' breakdown'} className="w-full h-full" />
        </div>
      </Modal>

      {/* Narrative fields */}
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

      {compound.hair_loss_explanation ? (
        <div className="text-xs text-slate-400 italic mb-6 px-1">
          Hair loss note: {compound.hair_loss_explanation}
        </div>
      ) : null}

      {/* Search box */}
      <div className="prohp-card p-6 mb-4">
        <div className="text-sm font-semibold text-slate-200">
          Have a question about {compound.name}? Chances are it has been answered by me or the community.
        </div>

        <form onSubmit={runSearch} className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={function(e) { setQ(e.target.value); }} placeholder={'Search ' + compound.name + '... (PCT, suppression, hair loss, dosing)'} className="prohp-input w-full pl-9" />
          </div>
          <button className="prohp-btn-primary text-xs" type="submit" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {showBanner5 ? (
          <Banner
            title={"Have not found what you are looking for on " + compound.name + "?"}
            body="Try a different phrase. If it is still not showing up, post the question in the Library so the answer gets sealed once and stops repeating."
            onDismiss={function() { setBannerDismissed(true); }}
            actions={<Link to="/rooms/library" className="prohp-btn-primary text-xs">Ask in Library</Link>}
          />
        ) : null}

        {showBanner15 ? (
          <Banner
            title={"Deep dive needed on " + compound.name + "."}
            body="You have searched a lot. Post the question clean in the Library. That turns the answer into a permanent reference."
            onDismiss={function() { setBannerDismissed(true); }}
            actions={<Link to="/rooms/library" className="prohp-btn-primary text-xs">Ask in Library</Link>}
          />
        ) : null}

        {searchErr ? <div className="mt-3 text-[13px] text-red-300">{searchErr}</div> : null}

        {results ? (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-200">Results</div>
              <div className="text-xs text-slate-500">{results.results ? results.results.length : 0} found</div>
            </div>

            {results.results && results.results.length ? (
              <div className="mt-3 flex flex-col gap-2">
                {results.results.map(function(t) {
                  return (
                    <Link key={t.id} to={'/t/' + t.id} className="prohp-card p-3 hover:bg-slate-800/40 transition-colors">
                      <div className="text-[13px] font-semibold text-slate-200">{t.title}</div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                        <span>{t.room_name}</span>
                        <span>{t.reply_count} replies</span>
                        <span>{t.author_username}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2 text-[13px] text-slate-400">
                No matches. Try shorter terms (e.g. "PCT", "ALT", "gyno", "suppression", "hair loss").
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Related Threads */}
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
                    {c.duration_weeks ? ' · ' + c.duration_weeks + ' weeks' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
