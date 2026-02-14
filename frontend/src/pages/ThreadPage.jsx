import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, MessageSquare, CheckCircle, ChevronLeft, Award, CornerDownRight, Eye } from 'lucide-react';
import { api } from '../hooks/api';
import useAuthStore from '../stores/auth';
import MarkdownRenderer from '../components/MarkdownRenderer';

const TIER_LABELS = {
  lab_rat: 'Lab Rat',
  premium: 'Brother-in-Arms',
  elite: 'Elite',
  admin: 'Admin',
};

export default function ThreadPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [replyBody, setReplyBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyError, setReplyError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['thread', id],
    queryFn: () => api.get(`/api/threads/${id}`),
  });

  const voteThread = useMutation({
    mutationFn: ({ value }) => api.post(`/api/threads/${id}/vote`, { value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thread', id] }),
  });

  const votePost = useMutation({
    mutationFn: ({ postId, value }) => api.post(`/api/posts/${postId}/vote`, { value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thread', id] }),
  });

  const createReply = useMutation({
    mutationFn: (payload) => api.post('/api/posts', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', id] });
      setReplyBody('');
      setReplyTo(null);
      setReplyError('');
    },
    onError: (err) => setReplyError(err.message),
  });

  const markVerdict = useMutation({
    mutationFn: ({ postId }) => api.post(`/api/posts/${postId}/best-answer`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thread', id] }),
  });

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return setReplyError('Say something.');
    setReplyError('');
    createReply.mutate({
      thread_id: parseInt(id),
      body: replyBody.trim(),
      parent_id: replyTo || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse max-w-3xl mx-auto">
        <div className="h-4 bg-slate-800 rounded w-24 mb-4" />
        <div className="h-8 bg-slate-800 rounded w-2/3 mb-4" />
        <div className="h-32 bg-slate-800 rounded mb-4" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-red-400 text-sm mb-2">{error.message}</p>
        <Link to="/" className="prohp-btn-ghost text-xs">Back to home</Link>
      </div>
    );
  }

  const { thread, posts, pagination } = data;
  const isThreadAuthor = user && user.id === thread.author_id;
  const isAdmin = user && user.tier === 'admin';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to={`/r/${thread.room_slug}`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-prohp-400 transition-colors mb-4">
        <ChevronLeft className="w-3.5 h-3.5" />
        {thread.room_name}
      </Link>

      <article className="prohp-card p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 pt-1">
            <button
              onClick={() => user && voteThread.mutate({ value: 1 })}
              className={`p-1 rounded transition-colors ${thread.user_vote === 1 ? 'text-prohp-400 bg-prohp-500/10' : 'text-slate-500 hover:text-prohp-400 hover:bg-prohp-500/10'} ${!user ? 'opacity-40 cursor-default' : 'cursor-pointer'}`}
              disabled={!user}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <span className={`text-sm font-bold font-mono ${thread.score > 0 ? 'text-prohp-400' : thread.score < 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {thread.score}
            </span>
            <button
              onClick={() => user && voteThread.mutate({ value: -1 })}
              className={`p-1 rounded transition-colors ${thread.user_vote === -1 ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'} ${!user ? 'opacity-40 cursor-default' : 'cursor-pointer'}`}
              disabled={!user}
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-slate-100 mb-2 leading-snug">{thread.title}</h1>
            {thread.compound_name && (
              <Link to={`/compounds/${thread.compound_slug}`} className="inline-flex text-[10px] font-semibold text-prohp-500/80 bg-prohp-500/10 px-2 py-0.5 rounded mb-3 hover:bg-prohp-500/20 transition-colors">
                {thread.compound_name}
              </Link>
            )}
            <MarkdownRenderer content={thread.body} className="text-sm text-slate-300 leading-relaxed mb-4" />
            <div className="flex items-center gap-3 text-[11px] text-slate-500 border-t border-white/[0.04] pt-3">
              <span className="font-medium text-slate-400">{thread.author_username}</span>
              {thread.author_founding && <span className="tier-badge tier-founding text-[8px] py-0">Founding Member</span>}
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {thread.view_count}</span>
              <span className="ml-auto">{new Date(thread.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </article>

      <div className="mb-2">
        <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500 mb-3">
          {posts.length === 0 ? 'No replies yet' : `${pagination.total} ${pagination.total === 1 ? 'reply' : 'replies'}`}
        </h2>
      </div>

      <div className="flex flex-col gap-1.5 mb-6">
        {posts.map((post) => (
          <div key={post.id} className={`prohp-card px-4 py-3 ${post.is_best_answer ? 'border-l-2 border-l-emerald-500/50 bg-emerald-500/[0.03]' : ''} ${post.parent_id ? 'ml-8 border-l-2 border-l-slate-800/50' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-0.5 min-w-[28px]">
                <button
                  onClick={() => user && votePost.mutate({ postId: post.id, value: 1 })}
                  className={`p-0.5 transition-colors ${!user ? 'opacity-40 cursor-default' : 'cursor-pointer'} ${post.user_vote === 1 ? 'text-prohp-400' : 'text-slate-600 hover:text-prohp-400'}`}
                  disabled={!user}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <span className={`text-[11px] font-bold font-mono ${post.score > 0 ? 'text-prohp-400' : post.score < 0 ? 'text-red-400' : 'text-slate-500'}`}>{post.score}</span>
                <button
                  onClick={() => user && votePost.mutate({ postId: post.id, value: -1 })}
                  className={`p-0.5 transition-colors ${!user ? 'opacity-40 cursor-default' : 'cursor-pointer'} ${post.user_vote === -1 ? 'text-red-400' : 'text-slate-600 hover:text-red-400'}`}
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
                  <span className="font-medium text-slate-400">{post.author_username}</span>
                  {post.author_founding && <span className="tier-badge tier-founding text-[8px] py-0">FM</span>}
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  {user && !thread.is_locked && (
                    <button onClick={() => { setReplyTo(post.id); document.getElementById('reply-box')?.focus(); }} className="flex items-center gap-1 text-slate-500 hover:text-prohp-400 transition-colors ml-auto">
                      <CornerDownRight className="w-3 h-3" /> Reply
                    </button>
                  )}
                  {(isThreadAuthor || isAdmin) && !post.is_best_answer && (
                    <button onClick={() => markVerdict.mutate({ postId: post.id })} className="flex items-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors" title="Mark as Verdict">
                      <Award className="w-3 h-3" /> Mark Verdict
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="prohp-card p-6 text-center">
            <MessageSquare className="w-6 h-6 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No replies yet. Be the first to weigh in.</p>
          </div>
        )}
      </div>

      {user && !thread.is_locked && (
        <form onSubmit={handleReply} className="prohp-card p-4">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
              <CornerDownRight className="w-3 h-3" />
              <span>Replying to a post</span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-slate-300 ml-1">cancel</button>
            </div>
          )}
          <textarea id="reply-box" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Drop your experience, ask your question..." className="prohp-input min-h-[80px] resize-y mb-3 text-sm" rows={3} />
          {replyError && <div className="text-xs text-red-400 mb-2">{replyError}</div>}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-600">Receipts appreciated. Proof over hype.</p>
            <button type="submit" disabled={createReply.isPending} className="prohp-btn-primary text-xs">
              {createReply.isPending ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      )}

      {thread.is_locked && (
        <div className="prohp-card p-4 text-center">
          <p className="text-xs text-slate-500">This thread is locked. No new replies.</p>
        </div>
      )}

      {!user && !thread.is_locked && (
        <div className="prohp-card p-5 text-center">
          <p className="text-sm text-slate-400 mb-3">Log in to join the conversation.</p>
          <Link to="/login" className="prohp-btn-primary text-xs">Log in</Link>
        </div>
      )}
    </div>
  );
}
