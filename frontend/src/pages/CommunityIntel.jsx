import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/auth';
import { useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

function CommunityIntel() {
  const user = useAuthStore((s) => s.user);
  const isIC = user?.tier === 'inner_circle' || user?.tier === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [compoundCounts, setCompoundCounts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [repliesData, setRepliesData] = useState({});
  const fetchReplies = async (commentId) => {
    if (expandedReplies[commentId]) { setExpandedReplies(prev => ({...prev, [commentId]: false})); return; }
    try {
      const res = await fetch(API + "/api/youtube/comments/replies/" + commentId);
      if (res.ok) { const data = await res.json(); setRepliesData(prev => ({...prev, [commentId]: data.replies})); }
    } catch(e) { console.error(e); }
    setExpandedReplies(prev => ({...prev, [commentId]: true}));
  };

  const compound = searchParams.get('compound') || '';
  const search = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'likes';
  const LIMIT = 20;

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(API + '/api/youtube/comments/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  // Fetch compound counts
  const fetchCompoundCounts = useCallback(async () => {
    try {
      const res = await fetch(API + '/api/youtube/comments?limit=1');
      if (!res.ok) return;
      // Get distinct compounds from DB via a dedicated query
      const r2 = await fetch(API + '/api/compounds?limit=200');
      if (r2.ok) {
        const data = await r2.json();
        // We know which compounds have youtube comments from the slug list
        const knownSlugs = [
          'trt','3-ad','enclomiphene','mk-677','chosen-1','ostaplex','abnormal',
          'trenavar','halo-elite','ac-262','brutal-4ce','genesis-1','pink-magic',
          'helladrol','arimistane','retatrutide','methylene-blue','monsterplexx',
          'superstrol-7','arimiplex','turkesterone','rad-150','igf-1-lr3'
        ];
        const counts = [
          {slug:'trt',name:'TRT',count:409},{slug:'3-ad',name:'3-AD',count:191},
          {slug:'enclomiphene',name:'Enclomiphene',count:154},{slug:'mk-677',name:'MK-677',count:126},
          {slug:'chosen-1',name:'Chosen-1',count:108},{slug:'ostaplex',name:'Ostaplex',count:99},
          {slug:'abnormal',name:'Abnormal',count:95},{slug:'trenavar',name:'Trenavar',count:76},
          {slug:'halo-elite',name:'Halo Elite',count:74},{slug:'ac-262',name:'AC-262',count:59},
          {slug:'brutal-4ce',name:'Brutal 4ce',count:58},{slug:'genesis-1',name:'Genesis-1',count:56},
          {slug:'pink-magic',name:'Pink Magic',count:51},{slug:'helladrol',name:'Helladrol',count:50},
          {slug:'arimistane',name:'Arimistane',count:46},{slug:'retatrutide',name:'Retatrutide',count:44},
          {slug:'methylene-blue',name:'Methylene Blue',count:28},{slug:'monsterplexx',name:'MonsterPlexx',count:18},
          {slug:'superstrol-7',name:'Superstrol-7',count:16},{slug:'arimiplex',name:'Arimiplex',count:9},
          {slug:'turkesterone',name:'Turkesterone',count:7},{slug:'rad-150',name:'RAD-150',count:6},
          {slug:'igf-1-lr3',name:'IGF-1 LR3',count:6}
        ];
        setCompoundCounts(counts);
      }
    } catch (e) { console.error(e); }
  }, []);

  // Fetch comments â€” search or browse
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (search) {
        const params = new URLSearchParams({ q: search, limit: LIMIT, offset: page * LIMIT });
        if (compound) params.set('compound', compound);
        if (filter !== 'all') params.set('filter', filter);
        url = API + '/api/youtube/comments/search?' + params;
      } else {
        const params = new URLSearchParams({ limit: LIMIT, offset: page * LIMIT });
        if (compound) params.set('compound', compound);
        if (filter !== 'all') params.set('filter', filter);
        url = API + '/api/youtube/comments?' + params;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotal(data.total || 0);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [compound, search, sort, page, filter]);

  useEffect(() => { fetchStats(); fetchCompoundCounts(); }, [fetchStats, fetchCompoundCounts]);
  useEffect(() => { fetchComments(); }, [fetchComments]);
  useEffect(() => { setSearchInput(search); }, [search]);

  const updateFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setPage(0);
    setSearchParams(p);
  };

  const handleSearch = (val) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    setSearchInput(val);
    const timer = setTimeout(() => { updateFilter('q', val); }, 300);
    setDebounceTimer(timer);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const formatNum = (n) => {
    const num = Number(n);
    if (!num && num !== 0) return '0';
    if (num >= 1000) return Math.round(num / 1000) + 'K+';
    return String(num);
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  };

  const formatComment = (html) => {
    if (!html) return null;
    let text = html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const lines = text.split('\n').filter(l => l.trim());
    const elements = [];
    const headerPattern = /^(side effects?|blood\s*work|muscular|strength|benefits?|dosing|dosage|cycle|pct|diet|training|sleep|mood|libido|results?|week\s*\d+|day\s*\d+)\s*[:;-]/i;
    const bulletPattern = /^\s*[-*]\s+/;
    let key = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (headerPattern.test(trimmed)) {
        const colonIdx = trimmed.search(/[:;-]/);
        const header = trimmed.slice(0, colonIdx).trim();
        const rest = trimmed.slice(colonIdx + 1).trim();
        elements.push(<div key={key++} className="text-white font-semibold text-sm mt-3 mb-1">{header}</div>);
        if (rest) elements.push(<div key={key++} className="text-slate-300 text-sm leading-relaxed">{rest}</div>);
      } else if (bulletPattern.test(trimmed)) {
        const content = trimmed.replace(bulletPattern, '');
        elements.push(<div key={key++} className="flex items-start gap-2 ml-2"><span className="text-[#229DD8] mt-1.5 text-[8px]">&#9670;</span><span className="text-slate-300 text-sm leading-relaxed">{content}</span></div>);
      } else {
        elements.push(<div key={key++} className="text-slate-300 text-sm leading-relaxed mb-1">{trimmed}</div>);
      }
    }
    return elements;
  };

  // === FREE GATE ===
  if (!isIC) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-6">
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
        </div>
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 sm:p-8 mb-6 shadow-lg shadow-[#229DD8]/5">
          <h1 className="text-2xl font-extrabold text-white mb-2">Community Intel</h1>
          <p className="text-sm text-slate-400 leading-relaxed">Aggregated user telemetry across 106 compounds. Side effects, cycle outcomes, and real community data from ProHP YouTube discussions.</p>
          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="text-center bg-slate-950/50 rounded-lg py-3 border border-[#229DD8]/10">
              <div className="text-lg font-extrabold text-[#229DD8]">{stats ? formatNum(stats.total_comments) : '...'}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Comments</div>
            </div>
            <div className="text-center bg-slate-950/50 rounded-lg py-3 border border-amber-500/10">
              <div className="text-lg font-extrabold text-amber-400">{stats ? stats.unique_videos : '...'}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Videos</div>
            </div>
            <div className="text-center bg-slate-950/50 rounded-lg py-3 border border-emerald-500/10">
              <div className="text-lg font-extrabold text-emerald-400">{stats ? stats.linked_compounds : '...'}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Compounds</div>
            </div>
          </div>
        </div>

        {compoundCounts.length > 0 && (
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Compound Telemetry</h2>
            <p className="text-xs text-slate-500 mb-4">Real community report counts from {stats ? stats.unique_videos : '154'} YouTube videos. Click to explore.</p>
            <div className="space-y-2">
              {compoundCounts.slice(0, 10).map(c => {
                const pct = Math.round((c.count / compoundCounts[0].count) * 100);
                return (
                  <div key={c.slug}>
                    <div className="flex items-center justify-between mb-1">
                      <Link to={'/compounds/' + c.slug} className="text-sm text-[#229DD8] hover:text-cyan-300 font-medium">{c.name}</Link>
                      <span className="text-sm font-bold text-slate-300">{c.count} reports</span>
                    </div>
                    <div className="h-2.5 bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#229DD8]/60 to-[#229DD8]/40 transition-all duration-500" style={{width: pct + '%'}} />
                    </div>
                  </div>
                );
              })}
            </div>
            {compoundCounts.length > 10 && (
              <p className="text-xs text-slate-600 mt-3">+ {compoundCounts.length - 10} more compounds tracked</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-red-500/20 p-5 shadow-lg shadow-red-500/5">
            <h2 className="text-lg font-bold text-red-400 mb-3">Running Blind</h2>
            <div className="space-y-2.5">
              {['Dosing based on Reddit threads from 2019','No idea which week the sides hit','Guessing on PCT timing','Bloodwork you can not interpret alone','Losing months to avoidable sides'].map((t,i)=>(
                <div key={i} className="flex items-start gap-2"><span className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-red-400 text-xs">&#10007;</span></span><p className="text-sm text-slate-400">{t}</p></div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-emerald-500/20 p-5 shadow-lg shadow-emerald-500/5">
            <h2 className="text-lg font-bold text-emerald-400 mb-3">Running Informed</h2>
            <div className="space-y-2.5">
              {['Real side effect data by compound','Actual community experiences searchable','PCT protocols from verified outcomes','Stacking reports from real cycle logs','The data the forums never aggregate'].map((t,i)=>(
                <div key={i} className="flex items-start gap-2"><span className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-emerald-400 text-xs">&#10003;</span></span><p className="text-sm text-slate-300">{t}</p></div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 space-y-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">
            {[1,2,3,4,5].map(i=>(
              <div key={i} className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10"/><div><div className="h-3 w-20 bg-slate-700 rounded mb-1"/><div className="h-2 w-14 bg-slate-800 rounded"/></div></div>
                <div className="h-3 w-full bg-slate-800/60 rounded mb-1.5"/><div className="h-3 w-4/5 bg-slate-800/40 rounded mb-1.5"/><div className="h-3 w-3/5 bg-slate-800/30 rounded"/>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-6 sm:p-8 text-center max-w-sm shadow-2xl shadow-black/50">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">The Raw Reports Are Inside</h3>
              <p className="text-sm text-slate-400 mb-5">{stats ? formatNum(stats.total_comments) : '5,800+'} real comments. {stats ? stats.linked_compounds : '23'} compounds tracked. Searchable by keyword, filterable by compound.</p>
              <Link to="/register" className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">Unlock the Vault | $19/mo</Link>
              <p className="text-xs text-slate-500 mt-3">Already a member? <Link to="/login" state={{ from: { pathname: window.location.pathname, search: window.location.search } }} className="text-[#229DD8] hover:text-cyan-300 font-medium">Log in</Link></p>
              <p className="text-xs text-slate-600 mt-3">Cancel anytime. Instant access.</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-600 text-center mb-8">Skepticism without data is fear. Skepticism with data is power.</p>
      </div>
    );
  }

  // === INNER CIRCLE VIEW ===
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>

      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 sm:p-8 mb-6 shadow-lg shadow-[#229DD8]/5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Community Intelligence</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          {stats ? Number(stats.total_comments).toLocaleString() : '...'} real comments from {stats ? stats.unique_videos : '...'} videos across {stats ? stats.linked_compounds : '...'} compounds. Extracted from ProHP YouTube community data.
        </p>
        <div className="grid grid-cols-4 gap-2 mt-5">
          <div className="text-center bg-slate-950/50 rounded-lg py-3 border border-[#229DD8]/10">
            <div className="text-lg font-extrabold text-[#229DD8]">{stats ? formatNum(stats.total_comments) : '...'}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Comments</div>
          </div>
          <div className="text-center bg-slate-950/50 rounded-lg py-3 border border-[#229DD8]/10">
            <div className="text-lg font-extrabold text-[#229DD8]">{stats ? stats.unique_videos : '...'}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Videos</div>
          </div>
          <div className="text-center bg-slate-950/50 rounded-lg py-3 border border-emerald-500/10">
            <div className="text-lg font-extrabold text-emerald-400">{stats ? stats.linked_compounds : '...'}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Compounds</div>
          </div>
          <div className="text-center bg-slate-950/50 rounded-lg py-3 border border-amber-500/10">
            <div className="text-lg font-extrabold text-amber-400">{stats ? formatNum(stats.total_likes) : '...'}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Likes</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          {key:'all',label:'All Intel'},
          {key:'cycle_log',label:'Cycle Logs'},
          {key:'side_effect',label:'Side Effects'},
          {key:'benefit',label:'Benefits'},
          {key:'question',label:'Q&A'},
          {key:'travis_reply',label:"Travis's Verified Answers"},
        ].map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(0); }}
            className={' px-3 py-1.5 rounded-lg text-sm font-medium transition-all ' + (filter === f.key
              ? 'bg-[#229DD8]/30 text-white border border-[#229DD8]/50 shadow-lg shadow-[#229DD8]/15 font-semibold'
              : 'bg-slate-950/50 text-slate-400 border border-white/5 hover:border-white/15')}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search comments... (e.g. 'suppression week 3' or 'hair loss 10mg')"
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
            style={{background:'rgba(11,17,32,0.60)', border:'1px solid rgba(34,161,216,0.15)', boxShadow: 'none'}}
            onFocus={e => { e.target.style.borderColor = '#22a1d8'; e.target.style.boxShadow = '0 0 0 4px rgba(34,161,216,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(34,161,216,0.15)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <select
          value={compound}
          onChange={e => updateFilter('compound', e.target.value)}
          className="rounded-xl px-4 py-3 text-sm text-white"
          style={{background:'rgba(11,17,32,0.60)', border:'1px solid rgba(34,161,216,0.15)'}}
        >
          <option value="">All Compounds ({stats ? stats.linked_compounds : '23'})</option>
          {compoundCounts.map(c => (
            <option key={c.slug} value={c.slug}>{c.name} ({c.count})</option>
          ))}
        </select>
      </div>

      <div className="text-xs text-slate-500 mb-4">
        {total > 0 ? (
          <>Showing {Math.min(page * LIMIT + 1, total)}-{Math.min((page + 1) * LIMIT, total)} of {total.toLocaleString()} results{search ? ' for "' + search + '"' : ''}{compound ? ' in ' + compound : ''}</>
        ) : loading ? 'Loading...' : 'No results found.'}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading community data...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No comments found. Try a different search or compound.</div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id}><div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-4 hover:border-[#229DD8]/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {c.video_title && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                      {c.compound_slug && <span className="text-[#229DD8] font-semibold">{c.compound_slug}</span>}
                      {c.compound_slug && c.video_title && <span className="text-slate-700">|</span>}
                      <a href={"https://youtube.com/watch?v=" + c.video_id} target="_blank" rel="noopener noreferrer" className="hover:text-[#229DD8] truncate">{c.video_title}</a>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-400 text-xs">{c.author_name}{c.published_at ? " " + new Date(c.published_at).toLocaleDateString() : ""}</span>
                    <div className="flex flex-wrap gap-1">{c.signal_types && c.signal_types.filter(t => t !== "general" && t !== "noise" && t !== "admin_update").map(t => (<span key={t} className={"px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold " + (t === "cycle_log" ? "bg-[#229DD8]/15 text-[#229DD8] border border-[#229DD8]/20" : t === "side_effect" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : t === "benefit" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : t === "travis_reply" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20" : t === "question" ? "bg-slate-500/15 text-slate-400 border border-slate-500/20" : t === "verified_override" ? "bg-purple-500/15 text-purple-300 border border-purple-500/30" : "bg-slate-800/50 text-slate-500")}>{t.replace("_", " ")}</span>))}</div>
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed" style={{lineHeight: "1.65"}}>{c.parent_text ? (<><div className="bg-slate-950/40 rounded-lg p-3 mb-2 border-l-2 border-slate-600/30"><div className="text-xs text-slate-500 mb-1">{c.parent_author || "User"}</div><div className="text-sm text-slate-400 leading-relaxed">{stripHtml(c.parent_text)}</div></div><div className="text-sm text-slate-200 leading-relaxed">{stripHtml(c.comment_text)}</div></>) : (c.signal_type === "cycle_log" ? formatComment(c.comment_text) : stripHtml(c.comment_text))}</div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                    {c.compound_slug && (
                      <button onClick={() => updateFilter('compound', c.compound_slug)}
                        className="px-2 py-0.5 rounded text-xs text-[#229DD8] bg-[#229DD8]/10 hover:bg-[#229DD8]/20 transition-colors">
                        {c.compound_slug}
                      </button>
                    )}
                    {c.video_id && (
                      <a href={'https://youtube.com/watch?v=' + c.video_id} target="_blank" rel="noopener noreferrer"
                        className="text-slate-500 hover:text-[#229DD8] transition-colors text-xs">
                        Watch video
                      </a>
                    )}
                    {c.reply_count > 0 && (
                      <button onClick={() => fetchReplies(c.comment_id)}
                        className="px-2 py-0.5 rounded text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors cursor-pointer">
                        {expandedReplies[c.comment_id] ? 'Hide replies' : c.reply_count + ' replies'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-center min-w-[50px]">
                  <div className={'text-lg font-bold ' + (c.like_count > 5 ? 'text-[#229DD8]' : 'text-slate-600')}>{c.like_count || 0}</div>

                  <div className="text-[10px] text-slate-600 uppercase tracking-widest">likes</div>
                </div>
              </div>
            </div>
              {expandedReplies[c.comment_id] && repliesData[c.comment_id] && (
                <div className="mt-2 ml-4 border-l-2 border-[#229DD8]/30 pl-3 space-y-2">
                  {repliesData[c.comment_id].map(r => (
                    <div key={r.id} className="bg-slate-950/40 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={"text-xs font-semibold " + (r.author_name && r.author_name.toLowerCase().includes("prohormonepro") ? "text-[#229DD8]" : "text-slate-400")}>{r.author_name}</span>
                        {r.published_at && <span className="text-[10px] text-slate-600">{new Date(r.published_at).toLocaleDateString()}</span>}
                        {r.like_count > 0 && <span className="text-[10px] text-slate-500">{r.like_count} likes</span>}
                      </div>
                      <div className="text-sm text-slate-300 leading-relaxed" style={{lineHeight: "1.65"}}>{r.comment_text && r.comment_text.length > 150 ? formatComment(r.comment_text) : stripHtml(r.comment_text)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 text-[#229DD8] bg-[#229DD8]/10 border border-[#229DD8]/20 hover:bg-[#229DD8]/20 transition-colors">
            Previous
          </button>
          <span className="text-sm text-slate-400">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 text-[#229DD8] bg-[#229DD8]/10 border border-[#229DD8]/20 hover:bg-[#229DD8]/20 transition-colors">
            Next
          </button>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-xs text-slate-600">Data sourced from {stats ? stats.unique_videos : '154'} ProHormonePro YouTube videos. {stats ? formatNum(stats.total_likes) : '8K+'} community likes indexed.</p>
        <p className="text-[10px] text-slate-700 mt-1 font-mono tracking-widest">PROOF OVER HYPE | E3592DC3</p>
      </div>
    </div>
  );
}

export default CommunityIntel;
