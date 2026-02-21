import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, TrendingUp, Eye, MessageSquare, ChevronRight, Search, Beaker, Zap, Calendar, Tag } from 'lucide-react';
import useAuthStore from '../stores/auth';
import GrepGateCTA from '../components/GrepGateCTA';

export default function CompoundDetail() {
  const { id } = useParams();
  const [compound, setCompound] = useState(null);
  const [threads, setThreads] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthStore();

  useEffect(() => {
    const fetchCompound = async () => {
      try {
        const response = await fetch(`/api/compounds/${id}`);
        if (!response.ok) throw new Error('Compound not found');
        const data = await response.json();
        setCompound(data);

        if (data?.name) {
          await fetchSearchResults(data.name);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedData = async () => {
      try {
        const [threadsRes, cyclesRes] = await Promise.all([
          fetch(`/api/compounds/${id}/threads`),
          fetch(`/api/compounds/${id}/cycles`)
        ]);

        if (threadsRes.ok) {
          const threadsData = await threadsRes.json();
          setThreads(threadsData);
        }

        if (cyclesRes.ok) {
          const cyclesData = await cyclesRes.json();
          setCycles(cyclesData);
        }
      } catch (err) {
        console.error('Error fetching related data:', err);
      }
    };

    fetchCompound();
    fetchRelatedData();
  }, [id]);

  const fetchSearchResults = async (query) => {
    if (!query) return;

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/threads/search/query?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!compound) return null;

  const visibleResults = searchResults.slice(0, 3);
  const hiddenResults = searchResults.slice(3);
  const shouldShowBlur = user?.tier === 'lab_rat' && hiddenResults.length > 0;
  const canSeeAll = user?.tier && ['premium', 'elite', 'admin'].includes(user.tier);

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-zinc-800 rounded-lg p-8 mb-8 border border-zinc-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{compound.name}</h1>
              {compound.common_name && (
                <p className="text-xl text-zinc-400 mb-4">{compound.common_name}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {compound.category && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {compound.category}
                  </span>
                )}
                {compound.legal_status && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    {compound.legal_status}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4 text-zinc-400">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{threads.length} threads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Beaker className="h-4 w-4" />
                  <span>{cycles.length} cycles</span>
                </div>
              </div>
            </div>
          </div>

          {compound.description && (
            <p className="text-zinc-300 text-lg leading-relaxed">{compound.description}</p>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="bg-zinc-800 rounded-lg p-6 mb-8 border border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-semibold">Community Discussion</h2>
              <span className="text-zinc-500">({searchResults.length} results)</span>
            </div>

            <div className="space-y-4">
              {visibleResults.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/threads/${thread.id}`}
                  className="block p-4 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white group-hover:text-green-400">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {thread.view_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {thread.reply_count || 0}
                      </span>
                    </div>
                  </div>
                  {thread.preview && (
                    <p className="text-zinc-400 text-sm line-clamp-2">{thread.preview}</p>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(thread.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {thread.author_username || 'Anonymous'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {hiddenResults.length > 0 && (
              <div className="relative mt-4 pt-4 border-t border-zinc-700">
                {shouldShowBlur && (
                  <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-md flex items-center justify-center rounded-lg z-10">
                    <GrepGateCTA />
                  </div>
                )}
                <div className={`space-y-4 ${shouldShowBlur ? 'filter blur-md pointer-events-none select-none' : ''}`}>
                  {hiddenResults.map((thread) => (
                    <Link
                      key={thread.id}
                      to={`/threads/${thread.id}`}
                      className="block p-4 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-600"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-white group-hover:text-green-400">
                          {thread.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {thread.view_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {thread.reply_count || 0}
                          </span>
                        </div>
                      </div>
                      {thread.preview && (
                        <p className="text-zinc-400 text-sm line-clamp-2">{thread.preview}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(thread.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {thread.author_username || 'Anonymous'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-zinc-800 rounded-lg p-6 mb-8 border border-zinc-700">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-green-400" />
            <h2 className="text-xl font-semibold">Related Threads</h2>
          </div>
          {threads.length > 0 ? (
            <div className="space-y-4">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/threads/${thread.id}`}
                  className="block p-4 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-600"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-white group-hover:text-green-400">
                      {thread.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {thread.view_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {thread.reply_count || 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400">No related threads found.</p>
          )}
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-8 border border-zinc-700">
          <div className="flex items-center gap-2 mb-4">
            <Beaker className="h-5 w-5 text-green-400" />
            <h2 className="text-xl font-semibold">Related Cycles</h2>
          </div>
          {cycles.length > 0 ? (
            <div className="space-y-4">
              {cycles.map((cycle) => (
                <Link
                  key={cycle.id}
                  to={`/cycles/${cycle.id}`}
                  className="block p-4 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-600"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-white group-hover:text-green-400">
                      {cycle.title}
                    </h3>
                  </div>
                  <div className="text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(cycle.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400">No related cycles found.</p>
          )}
        </div>
      </div>
    </div>
  );
}