import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, ArrowUp, ArrowDown, Pin, Lock, Plus, Eye, X, ChevronLeft } from 'lucide-react';
import { api } from '../hooks/api';
import useAuthStore from '../stores/auth';

export default function RoomPage() {
  const { slug } = useParams();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [compoundSlug, setCompoundSlug] = useState('');
  const [createError, setCreateError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['room', slug],
    queryFn: () => api.get(`/api/rooms/${slug}`),
  });

  const { data: compoundsData } = useQuery({
    queryKey: ['compounds-list'],
    queryFn: () => api.get('/api/compounds?limit=100'),
    enabled: showCreate,
  });

  const createThread = useMutation({
    mutationFn: (payload) => api.post('/api/threads', payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['room', slug] });
      setShowCreate(false);
      setTitle('');
      setBody('');
      setCompoundSlug('');
      setCreateError('');
      window.location.href = `/t/${result.thread.id}`;
    },
    onError: (err) => setCreateError(err.message),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return setCreateError('Give it a title.');
    if (!body.trim()) return setCreateError('Say something. Drop your experience, ask your question.');
    setCreateError('');
    createThread.mutate({
      room_slug: slug,
      title: title.trim(),
      body: body.trim(),
      compound_slug: compoundSlug || undefined,
    });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  const { room, threads, pagination } = data;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-prohp-400 transition-colors mb-4">
        <ChevronLeft className="w-3.5 h-3.5" /> Home
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-extrabold tracking-tight">{room.name}</h1>
          {!room.can_write && (
            <span className="tier-badge tier-inner_circle text-[9px]">Inner Circle to post</span>
          )}
        </div>
        <p className="text-sm text-slate-400">{room.description}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span>{room.thread_count} threads</span>
          <span>{room.post_count} posts</span>
        </div>
      </div>

      {room.can_write && user && (
        <button onClick={() => setShowCreate(true)} className="prohp-btn-primary text-xs mb-5 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Start a Thread
        </button>
      )}

      {!user && (
        <div className="prohp-card p-4 mb-5 border-l-2 border-l-prohp-500/30">
          <p className="text-xs text-slate-400">
            <Link to="/register" className="text-prohp-400 hover:text-prohp-300 font-medium">Start here</Link>
            {' '}to join the conversation.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {threads.length === 0 ? (
          <div className="prohp-card p-8 text-center">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-1">No threads yet.</p>
            <p className="text-xs text-slate-500">Be the first. Drop your experience or ask your question.</p>
          </div>
        ) : (
          threads.map((t) => (
            <Link key={t.id} to={`/t/${t.id}`} className="prohp-card px-4 py-3 hover:bg-slate-800/40 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-0.5 pt-0.5 min-w-[36px]">
                  <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                  <span className={`text-xs font-bold font-mono ${t.score > 0 ? 'text-prohp-400' : t.score < 0 ? 'text-red-400' : 'text-slate-500'}`}>{t.score}</span>
                  <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {t.is_pinned && <Pin className="w-3 h-3 text-prohp-400 flex-shrink-0" />}
                    {t.is_locked && <Lock className="w-3 h-3 text-slate-500 flex-shrink-0" />}
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-prohp-400 transition-colors truncate">{t.title}</span>
                    {t.compound_name && (
                      <span className="text-[10px] font-semibold text-prohp-500/80 bg-prohp-500/10 px-1.5 py-0.5 rounded flex-shrink-0">{t.compound_name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{t.author_username}</span>
                    {t.author_founding && <span className="tier-badge tier-founding text-[8px] py-0">FM</span>}
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {t.reply_count}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {t.view_count}</span>
                    <span className="ml-auto">{new Date(t.last_reply_at || t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => (
            <button key={i} className={`w-8 h-8 rounded text-xs font-bold ${pagination.page === i + 1 ? 'bg-prohp-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>{i + 1}</button>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="prohp-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
              <h2 className="text-sm font-bold text-slate-100">Start a Thread</h2>
              <button onClick={() => { setShowCreate(false); setCreateError(''); }} className="text-slate-500 hover:text-slate-300 p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div className="text-xs text-slate-500">Posting in <span className="text-prohp-400 font-medium">{room.name}</span></div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind?" className="prohp-input text-sm" maxLength={200} autoFocus />
                <div className="text-[10px] text-slate-600 mt-1 text-right">{title.length}/200</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Your post</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Drop your experience, ask your question, share what you know. Receipts appreciated." className="prohp-input text-sm min-h-[140px] resize-y" rows={6} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tag a compound <span className="text-slate-600">(optional)</span></label>
                <select value={compoundSlug} onChange={(e) => setCompoundSlug(e.target.value)} className="prohp-input text-sm">
                  <option value="">None</option>
                  {compoundsData?.compounds?.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-600 mt-1">Links your thread to the encyclopedia entry.</p>
              </div>
              {createError && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{createError}</div>}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setCreateError(''); }} className="prohp-btn-ghost text-xs">Cancel</button>
                <button type="submit" disabled={createThread.isPending} className="prohp-btn-primary text-xs flex items-center gap-1.5">
                  {createThread.isPending ? 'Posting...' : 'Post Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-6 bg-slate-800 rounded w-1/3 mb-3" />
      <div className="h-4 bg-slate-800 rounded w-2/3 mb-6" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="prohp-card p-4 mb-2"><div className="h-4 bg-slate-800 rounded w-3/4 mb-2" /><div className="h-3 bg-slate-800 rounded w-1/2" /></div>
      ))}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="max-w-3xl mx-auto text-center py-12">
      <p className="text-red-400 text-sm mb-2">{message}</p>
      <Link to="/" className="prohp-btn-ghost text-xs">Back to home</Link>
    </div>
  );
}
