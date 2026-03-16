import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

function CommunityIntel() {
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
