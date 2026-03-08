import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MessageSquare, ArrowUp } from 'lucide-react';
import { api } from '../hooks/api';
import BackButton from '../components/layout/BackButton';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [input, setInput] = useState(q);
  useEffect(() => { setInput(q); }, [q]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get(`/api/threads/search/query?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
  });
  const results = data?.threads || data?.results || (Array.isArray(data) ? data : []);
  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <BackButton fallback="/" />
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-100 mb-4">Search</h1>
        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Search compounds, threads, discussions..."
            className="w-full bg-slate-900/60 border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#229DD8]/40 transition-colors"
            autoFocus />
        </form>
        {q && <p className="text-xs text-slate-500">{isLoading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`}</p>}
      </div>
      {!q && (
        <div className="text-center py-12">
          <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Enter a search term to find threads and discussions.</p>
        </div>
      )}
      {q && isLoading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-slate-900/50 rounded-xl p-4 border border-white/5">
              <div className="h-4 bg-slate-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}
      {q && !isLoading && error && (
        <div className="text-center py-8"><p className="text-sm text-red-400">Search failed: {error.message}</p></div>
      )}
      {q && !isLoading && !error && results.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No results found for "{q}"</p>
          <p className="text-xs text-slate-600 mt-1">Try different keywords or check your spelling.</p>
        </div>
      )}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((t) => (
            <Link key={t.id} to={`/t/${t.id}`} className="block bg-slate-900/50 hover:bg-slate-900/80 rounded-xl p-4 border border-white/5 hover:border-[#229DD8]/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center min-w-[28px] pt-0.5">
                  <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[11px] font-bold text-slate-500">{t.score || 0}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-200 mb-1 leading-snug">{t.title}</h3>
                  {t.body && <p className="text-xs text-slate-400 line-clamp-2 mb-2">{t.body.substring(0, 150)}{t.body.length > 150 ? '...' : ''}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="font-medium text-slate-400">{t.author_username || 'Unknown'}</span>
                    {t.room_name && <span className="text-[#229DD8]/60">{t.room_name}</span>}
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                    {t.post_count > 0 && <span>{t.post_count} replies</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
