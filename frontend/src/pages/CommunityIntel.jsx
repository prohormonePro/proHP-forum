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
  const [compounds, setCompounds] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const compound = searchParams.get('compound') || '';
  const sideEffect = searchParams.get('side_effect') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'likes';

  const LIMIT = 25;

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (compound) params.set('compound', compound);
      if (sideEffect) params.set('side_effect', sideEffect);
      if (search) params.set('search', search);
      params.set('sort', sort);
      params.set('limit', LIMIT);
      params.set('offset', page * LIMIT);
      const res = await fetch(`${API}/api/community-comments?${params}`);
      const data = await res.json();
      setComments(data.comments || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [compound, sideEffect, search, sort, page]);

  const fetchStats = useCallback(async () => {
    try {
      const params = compound ? `?compound=${encodeURIComponent(compound)}` : '';
      const res = await fetch(`${API}/api/community-comments/stats${params}`);
      setStats(await res.json());
    } catch (e) { console.error(e); }
  }, [compound]);

  const fetchCompounds = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/community-comments/compounds`);
      const data = await res.json();
      setCompounds(data.compounds || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchComments(); fetchStats(); }, [fetchComments, fetchStats]);
  useEffect(() => { fetchCompounds(); }, [fetchCompounds]);

  const updateFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setPage(0);
    setSearchParams(p);
  };

  const SIDE_EFFECTS = [
    'hair loss','acne','libido','blood pressure','water retention','bloat',
    'joint pain','gyno','suppression','hdl','cholesterol','liver',
    'lethargy','insomnia','aggression','vision','night sweats','appetite',
    'mood','anxiety','depression','headache','nausea','testosterone'
  ];

  const totalPages = Math.ceil(total / LIMIT);

  if (!isIC) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-6">
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 sm:p-8 mb-6 shadow-lg shadow-[#229DD8]/5">
          <h1 className="text-2xl font-extrabold text-white mb-2">Community Intel</h1>
          <p className="text-sm text-slate-400 leading-relaxed">Real user reports on 105+ compounds. Side effects, bloodwork markers, cycle outcomes, and stacking data — sourced from verified cycle logs and YouTube discussions across the ProHP community.</p>
          {stats && (
            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="text-center bg-slate-950/50 rounded-lg py-2.5 border border-white/5">
                <div className="text-lg font-extrabold text-white">{stats.total_comments || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Reports</div>
              </div>
              <div className="text-center bg-slate-950/50 rounded-lg py-2.5 border border-white/5">
                <div className="text-lg font-extrabold text-white">{compounds.length}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Compounds</div>
              </div>
              <div className="text-center bg-slate-950/50 rounded-lg py-2.5 border border-white/5">
                <div className="text-lg font-extrabold text-white">{stats.total_likes || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Upvotes</div>
              </div>
            </div>
          )}
        </div>

        {/* Compound Pills Preview */}
        {compounds.length > 0 && (
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
            <h2 className="text-xl font-bold text-white mb-3">Tracked Compounds</h2>
            <div className="flex flex-wrap gap-2">
              {compounds.slice(0, 15).map((comp, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-slate-950/50 border border-[#229DD8]/10 text-[#229DD8] font-medium">{comp.compound_name || comp.name || comp}</span>
              ))}
              {compounds.length > 15 && (
                <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-950/50 border border-white/5 text-slate-500">+{compounds.length - 15} more</span>
              )}
            </div>
          </div>
        )}

        {/* Blurred Preview */}
        <div className="relative mb-6">
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 space-y-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800" />
                  <div className="h-3 w-24 bg-slate-800 rounded" />
                  <div className="h-3 w-16 bg-slate-800 rounded ml-auto" />
                </div>
                <div className="h-3 w-full bg-slate-800/50 rounded mb-1.5" />
                <div className="h-3 w-3/4 bg-slate-800/50 rounded mb-1.5" />
                <div className="h-3 w-1/2 bg-slate-800/50 rounded" />
                <div className="flex gap-2 mt-3">
                  <div className="h-5 w-16 bg-slate-800/30 rounded" />
                  <div className="h-5 w-20 bg-slate-800/30 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* CTA Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-6 sm:p-8 text-center max-w-sm shadow-2xl shadow-black/50">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">Inner Circle Access</h3>
              <p className="text-sm text-slate-400 mb-5">Unlock {stats?.total_comments || 'hundreds of'} real user reports across {compounds.length || '100+'} compounds. Side effects, bloodwork, outcomes, and stacking data from verified community members.</p>
              <Link to="/register" className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-amber-500/20">
                Join Inner Circle | $19/mo
              </Link>
              <p className="text-xs text-slate-600 mt-3">Cancel anytime. Instant access.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 text-center mb-8">Skepticism without data is fear. Skepticism with data is power.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4"><button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Back</button></div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{color:'#229DD8'}}>
          Community Intelligence
        </h1>
        <p className="text-gray-400">
          {total.toLocaleString()} real discussions from {compounds.length} compounds.
          Extracted from YouTube community data. Searchable by compound, side effect, dosage, and more.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Comments', value: stats.total?.toLocaleString() },
            { label: 'Side Effects', value: stats.with_side_effects?.toLocaleString() },
            { label: 'Dosage Mentions', value: stats.with_dosage?.toLocaleString() },
            { label: 'Cycle Reports', value: stats.with_cycle?.toLocaleString() },
            { label: 'Bloodwork', value: stats.with_bloodwork?.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-3 text-center"
              style={{background:'rgba(34,157,216,0.08)', border:'1px solid rgba(34,157,216,0.2)'}}>
              <div className="text-2xl font-bold" style={{color:'#229DD8'}}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {stats?.top_side_effects?.length > 0 && (
        <div className="mb-6 p-4 rounded-lg" style={{background:'rgba(34,157,216,0.04)', border:'1px solid rgba(34,157,216,0.1)'}}>
          <div className="text-sm font-semibold text-gray-300 mb-2">Top Side Effects Mentioned</div>
          <div className="flex flex-wrap gap-2">
            {stats.top_side_effects.slice(0, 8).map(se => (
              <button key={se.effect} onClick={() => updateFilter('side_effect', se.effect)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${sideEffect === se.effect ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                style={{background: sideEffect === se.effect ? '#229DD8' : 'rgba(34,157,216,0.15)',
                  border: '1px solid rgba(34,157,216,0.3)'}}>
                {se.effect} ({se.count})
              </button>
            ))}
            {sideEffect && (
              <button onClick={() => updateFilter('side_effect', '')}
                className="px-3 py-1 rounded-full text-sm text-red-400 hover:text-red-300"
                style={{background:'rgba(255,100,100,0.1)', border:'1px solid rgba(255,100,100,0.2)'}}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <select value={compound} onChange={e => updateFilter('compound', e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 flex-1">
          <option value="">All Compounds</option>
          {compounds.map(c => (
            <option key={c.compound_name} value={c.compound_name}>
              {c.compound_name} ({c.comment_count})
            </option>
          ))}
        </select>

        <select value={sideEffect} onChange={e => updateFilter('side_effect', e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 flex-1">
          <option value="">All Side Effects</option>
          {SIDE_EFFECTS.map(se => <option key={se} value={se}>{se}</option>)}
        </select>

        <select value={sort} onChange={e => updateFilter('sort', e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700">
          <option value="likes">Most Liked</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="mb-6">
        <input type="text" placeholder="Search comments... (e.g. 'suppression' 'hair loss' '10mg 8 weeks')"
          defaultValue={search}
          onKeyDown={e => { if (e.key === 'Enter') updateFilter('search', e.target.value); }}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
          style={{'--tw-ring-color':'#229DD8'}} />
      </div>

      <div className="text-sm text-gray-400 mb-4">
        Showing {Math.min(page * LIMIT + 1, total)}-{Math.min((page + 1) * LIMIT, total)} of {total.toLocaleString()} results
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading community data...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No comments found matching your filters.</div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.yt_comment_id} className="rounded-lg p-4 transition-colors hover:border-blue-500/30"
              style={{background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)'}}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{c.content}</div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-400">{c.author_name}</span>
                    {c.compound_name && (
                      <button onClick={() => updateFilter('compound', c.compound_name)}
                        className="px-2 py-0.5 rounded text-xs" style={{color:'#229DD8', background:'rgba(34,157,216,0.1)'}}>
                        {c.compound_name}
                      </button>
                    )}
                    {c.video_title && (
                      <a href={`https://youtube.com/watch?v=${c.video_id}`} target="_blank" rel="noopener noreferrer"
                        className="hover:text-blue-400 truncate max-w-[200px]">
                        {c.video_title}
                      </a>
                    )}
                    {c.published_at && <span>{new Date(c.published_at).toLocaleDateString()}</span>}
                  </div>
                  {c.side_effects?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.side_effects.map(se => (
                        <span key={se} className="px-2 py-0.5 rounded text-xs"
                          style={{background:'rgba(255,180,50,0.1)', color:'#FFB432', border:'1px solid rgba(255,180,50,0.2)'}}>
                          {se}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-1">
                    {c.mentions_dosage && <span className="text-xs px-1.5 py-0.5 rounded" style={{background:'rgba(100,200,100,0.1)', color:'#6c6'}}>dosage</span>}
                    {c.mentions_cycle && <span className="text-xs px-1.5 py-0.5 rounded" style={{background:'rgba(100,150,255,0.1)', color:'#88f'}}>cycle</span>}
                    {c.mentions_bloodwork && <span className="text-xs px-1.5 py-0.5 rounded" style={{background:'rgba(255,100,100,0.1)', color:'#f88'}}>bloodwork</span>}
                    {c.mentions_stack && <span className="text-xs px-1.5 py-0.5 rounded" style={{background:'rgba(200,100,255,0.1)', color:'#c8f'}}>stack</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-center min-w-[50px]">
                  <div className="text-lg font-bold" style={{color: c.likes > 10 ? '#229DD8' : '#666'}}>{c.likes}</div>
                  <div className="text-xs text-gray-600">likes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-4 py-2 rounded-lg text-sm disabled:opacity-30"
            style={{background:'rgba(34,157,216,0.15)', color:'#229DD8', border:'1px solid rgba(34,157,216,0.3)'}}>
            Previous
          </button>
          <span className="text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg text-sm disabled:opacity-30"
            style={{background:'rgba(34,157,216,0.15)', color:'#229DD8', border:'1px solid rgba(34,157,216,0.3)'}}>
            Next
          </button>
        </div>
      )}

      <div className="mt-12 text-center text-xs text-gray-600">
        Data sourced from {compounds.length} compound discussions across ProHormonePro YouTube.
        <br/>Proof over hype. E3592DC3.
      </div>
    </div>
  );
}

export default CommunityIntel;
