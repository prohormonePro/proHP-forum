import { useState, useRef, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, MessageSquare, CheckCircle, ChevronLeft, Award, Eye, Reply, Pencil, Trash2, Flag, Link2, Bookmark } from 'lucide-react';
import { api } from '../hooks/api';
import useAuthStore from '../stores/auth';
import MarkdownRenderer from '../components/MarkdownRenderer';
import BackButton from '../components/layout/BackButton';

const TIER_LABELS = { free: 'Free', inner_circle: 'Inner Circle', elite: 'Elite', admin: 'Admin' };
const timeAgo = (d) => { const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 60) return 'now'; if (s < 3600) return Math.floor(s/60) + 'm ago'; if (s < 86400) return Math.floor(s/3600) + 'h ago'; return new Date(d).toLocaleDateString(); };
const marginByDepth = ['ml-0', 'ml-5 sm:ml-8', 'ml-9 sm:ml-14', 'ml-9 sm:ml-14'];
const borderByDepth = ['border-l-transparent', 'border-l-[#229DD8]/50', 'border-l-[#229DD8]/35', 'border-l-[#229DD8]/20'];
const avatarSize = (d) => d === 0 ? 'w-8 h-8 text-sm' : d === 1 ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-[10px]';

export default function ThreadPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [commentImage, setCommentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef(null);
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('prohp_at');
    if (!token) throw new Error('Please log in');
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/posts/upload', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = file.type.startsWith('video/') ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) { setCommentError('File must be under ' + (file.type.startsWith('video/') ? '15MB' : '5MB')); return; }
    setCommentImage(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const isVideoFile = (url) => url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov'));
  const [collapsedThreads, setCollapsedThreads] = useState({});
  const toggleCollapse = (cid) => setCollapsedThreads(prev => ({...prev, [cid]: !prev[cid]}));
  const [sortMode, setSortMode] = useState('best');
  const [commentSearch, setCommentSearch] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState('');
  const [reportingPost, setReportingPost] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [copiedPost, setCopiedPost] = useState(null);
  const [showHud, setShowHud] = useState(false);
  const [commentBoxAbove, setCommentBoxAbove] = useState(false);
  const [scrollDir, setScrollDir] = useState('down');
  const lastScrollY = useRef(0);
  const hudLocked = useRef(false);
  const replyBoxRef = useRef(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#comment-')) {
      setTimeout(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.outline = '2px solid rgba(34,157,216,0.5)'; el.style.borderRadius = '12px'; setTimeout(() => { el.style.outline = 'none'; }, 3000); }
      }, 1000);
    }
  }, []);
  useEffect(() => {
    let fadeTimer = null;
    const onScroll = () => {
      const y = window.scrollY;
      if (hudLocked.current) { lastScrollY.current = y; return; }
      setScrollDir(y > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = y;
      const section = document.getElementById('feedback-section');
      setCommentBoxAbove(section ? section.getBoundingClientRect().top > window.innerHeight : true);
      if (y > 200) {
        setShowHud(true);
        if (fadeTimer) clearTimeout(fadeTimer);
        fadeTimer = setTimeout(() => setShowHud(false), 4000);
      } else {
        setShowHud(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (fadeTimer) clearTimeout(fadeTimer); };
  }, []);

  const copyLink = (pid) => { const url = window.location.origin + window.location.pathname + '#comment-' + pid; try { navigator.clipboard.writeText(url); } catch(e) { const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); } setCopiedPost(pid); setTimeout(() => setCopiedPost(null), 1500); };

  const { data, isLoading, error, refetch: refetchThread } = useQuery({
    queryKey: ['thread', id],
    queryFn: () => api.get(`/api/threads/${id}?limit=200`),
  });

  const voteThread = useMutation({
    mutationFn: ({ value }) => api.post(`/api/threads/${id}/vote`, { value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thread', id] }),
  });

  const votePost = useMutation({
    mutationFn: ({ postId, value }) => api.post(`/api/posts/${postId}/vote`, { value }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['thread', id] }); if (refetchThread) refetchThread(); },
  });

  const createReply = useMutation({
    mutationFn: (payload) => api.post('/api/posts', payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['thread', id] }); if (refetchThread) refetchThread(); setCommentText(''); setReplyTo(null); setCommentError(null); },
    onError: (err) => setCommentError(err.message),
  });

  const editPost = useMutation({
    mutationFn: ({ postId, body }) => api.patch('/api/posts/' + postId, { body }),
    onSuccess: () => { if (refetchThread) refetchThread(); setEditingPost(null); setEditText(''); },
  });

  const deletePost = useMutation({
    mutationFn: ({ postId }) => api.del('/api/posts/' + postId),
    onSuccess: () => { if (refetchThread) refetchThread(); },
  });

  const reportPost = useMutation({
    mutationFn: ({ postId, reason }) => api.post('/api/posts/' + postId + '/report', { reason }),
    onSuccess: () => { setReportingPost(null); setReportReason(''); },
  });

  const markVerdict = useMutation({
    mutationFn: ({ postId }) => api.post(`/api/posts/${postId}/best-answer`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thread', id] }),
  });

  const handleVote = (postId, value) => { if (!user) return; votePost.mutate({ postId, value }); };
  const handleReply = (postId) => { setReplyTo(postId); setTimeout(() => { replyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); };
  const postComment = async () => { if (!commentText.trim()) return; setPosting(true); setCommentError(null); try { let imgUrl = null; if (commentImage) { setUploading(true); try { imgUrl = await uploadImage(commentImage); } finally { setUploading(false); } } await createReply.mutateAsync({ thread_id: id, body: commentText.trim(), ...(replyTo ? { parent_id: replyTo } : {}), ...(imgUrl ? { image_url: imgUrl } : {}) }); setCommentImage(null); setImagePreview(null); if (imageInputRef.current) imageInputRef.current.value = ''; } finally { setPosting(false); } };

  if (isLoading) return (<div className="animate-pulse max-w-3xl mx-auto"><div className="h-4 bg-slate-800 rounded w-24 mb-4" /><div className="h-8 bg-slate-800 rounded w-2/3 mb-4" /><div className="h-32 bg-slate-800 rounded mb-4" /></div>);
  if (error) return (<div className="max-w-3xl mx-auto text-center py-12"><p className="text-red-400 text-sm mb-2">{error.message}</p><Link to="/" className="prohp-btn-ghost text-xs">Back to home</Link></div>);

  const { thread, posts, pagination } = data;

  // If this thread belongs to a cycle log, redirect to the Sovereign Dashboard
  if (thread?.cycle_log_id) {
    return <Navigate to={'/cycles/' + thread.cycle_log_id} replace />;
  }
  const isThreadAuthor = user && user.id === thread.author_id;
  const isAdmin = user && user.tier === 'admin';
  const canComment = user && !thread.is_locked;

  const filteredPosts = commentSearch.trim() ? posts.filter(p => p.body.toLowerCase().includes(commentSearch.toLowerCase()) || p.author_username?.toLowerCase().includes(commentSearch.toLowerCase())) : posts;

  const topLevel = filteredPosts.filter(p => !p.parent_id).sort((a, b) => {
    if (sortMode === 'best') {
      if (a.is_best_answer && !b.is_best_answer) return -1;
      if (!a.is_best_answer && b.is_best_answer) return 1;
      return (b.score || 0) - (a.score || 0);
    }
    if (sortMode === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortMode === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    return (b.score || 0) - (a.score || 0);
  });

  const repliesByParent = {};
  filteredPosts.filter(p => p.parent_id).forEach(p => { if (!repliesByParent[p.parent_id]) repliesByParent[p.parent_id] = []; repliesByParent[p.parent_id].push(p); });
  Object.values(repliesByParent).forEach(arr => arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));

  const renderComment = (p, depth) => {
    const children = repliesByParent[p.id] || [];
    const isCollapsed = collapsedThreads[p.id];
    const descendantCount = (pid) => { const kids = repliesByParent[pid] || []; return kids.length + kids.reduce((sum, k) => sum + descendantCount(k.id), 0); };
    const dCount = descendantCount(p.id);
    const margin = marginByDepth[Math.min(depth, 3)];
    const border = borderByDepth[Math.min(depth, 3)];

    return (
      <div key={p.id} className={`${margin}`} id={`comment-${p.id}`}>
        <div className={`prohp-card p-4 border border-white/5 border-l-[3px] ${border} ${p.is_best_answer ? 'bg-emerald-500/[0.03]' : ''}`}>
          <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              {children.length > 0 && (
                <button onClick={() => toggleCollapse(p.id)} className="text-[10px] text-slate-600 hover:text-[#229DD8] mb-1 font-mono">{isCollapsed ? '+' : '-'}</button>
              )}
              <div className={`${avatarSize(depth)} rounded-lg bg-gradient-to-br from-[#229DD8]/20 to-slate-800 flex items-center justify-center font-bold text-[#229DD8] shrink-0`}>
                {(p.author_username || '?').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {!isCollapsed && (<>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <Link to={`/u/${p.author_username}`} className="text-xs font-semibold text-slate-300 hover:text-[#229DD8] transition-colors truncate max-w-[120px] sm:max-w-[160px] inline-block align-bottom">{p.author_username}</Link>
                  {p.author_tier === 'admin' && <span className="text-[8px] font-bold text-[#229DD8] bg-[#229DD8]/10 px-1.5 py-0.5 rounded">ADM</span>}
                  {p.author_founding && <span className="text-[8px] font-bold text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">FM</span>}
                  <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0">{timeAgo(p.created_at)}</span>
                  {p.edit_count > 0 && <span className="text-[9px] text-amber-500/70 bg-amber-500/5 px-1.5 py-0.5 rounded font-medium">Edit #{p.edit_count}</span>}
                  {p.is_best_answer && <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold"><CheckCircle className="w-3 h-3" /> Verdict</span>}
                </div>
                {depth >= 1 && (() => { const parent = posts.find(x => x.id === p.parent_id); return parent ? (<div className="mb-1"><span className="text-[10px] font-medium"><span className="text-slate-600">replying to </span><span className="text-[#229DD8]/70">@{parent.author_username}</span></span></div>) : null; })()}
                <div className={`text-sm leading-relaxed mb-2 ${p.is_deleted ? 'text-slate-600 italic' : 'text-slate-300'}`}>
                  {p.is_deleted ? <span>[deleted]</span> : <MarkdownRenderer content={p.body} />}
                </div>
                {p.image_url && !p.is_deleted && (<div className="mb-2"><details open={true} className="rounded-lg overflow-hidden border border-white/10"><summary className="text-[10px] text-[#229DD8] cursor-pointer px-2 py-1.5 hover:bg-slate-800/30 flex items-center gap-1.5 select-none list-none [&::-webkit-details-marker]:hidden"><svg className="w-3 h-3 transition-transform [[open]>*>&]:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>{isVideoFile(p.image_url) ? "Video" : p.image_url.endsWith(".pdf") ? "PDF" : "Image"} - click to collapse</summary><div>{isVideoFile(p.image_url) ? (<video src={p.image_url} controls playsInline preload="metadata" className="w-full max-h-[400px] bg-black rounded-lg" />) : p.image_url.endsWith('.pdf') ? (<a href={p.image_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#229DD8] hover:text-white text-sm p-3">View PDF</a>) : (<img src={p.image_url} alt="" className="w-full max-h-[400px] object-contain rounded-lg" loading="lazy" />)}</div></details></div>)}
                <div className="flex items-center gap-1 flex-wrap">
                  {user && !p.is_deleted && (
                    <div className="flex items-center gap-0.5 mr-2">
                      <button onClick={() => handleVote(p.id, 1)} className={`p-1 rounded-md transition-all ${p.user_vote === 1 ? 'text-slate-500 bg-slate-700/20' : p.user_vote ? 'text-slate-700' : 'text-slate-600 hover:text-[#229DD8] hover:bg-[#229DD8]/5'}`} disabled={votePost.isPending || !!p.user_vote} style={p.user_vote ? {opacity: 0.3, cursor: 'not-allowed'} : {}}><ArrowUp className="w-3.5 h-3.5" /></button>
                      <span className={`text-xs font-semibold min-w-[20px] text-center ${(p.score || 0) > 0 ? 'text-[#229DD8]' : (p.score || 0) < 0 ? 'text-red-400' : 'text-slate-500'}`}>{p.score || 0}</span>
                      <button onClick={() => handleVote(p.id, -1)} className={`p-1 rounded-md transition-all ${p.user_vote === -1 ? 'text-slate-500 bg-slate-700/20' : p.user_vote ? 'text-slate-700' : 'text-slate-600 hover:text-red-400 hover:bg-red-500/5'}`} disabled={votePost.isPending || !!p.user_vote} style={p.user_vote ? {opacity: 0.3, cursor: 'not-allowed'} : {}}><ArrowDown className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  {canComment && !p.is_deleted && (<button onClick={() => handleReply(p.id)} className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-all ${replyTo === p.id ? 'text-[#229DD8] bg-[#229DD8]/10' : 'text-slate-500 hover:text-[#229DD8] hover:bg-[#229DD8]/5'}`}><Reply className="w-3 h-3" /> Reply</button>)}
                  {user && user.id === p.author_id && !p.is_deleted && (<button onClick={() => { setEditingPost(p.id); setEditText(p.body); }} className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-600 hover:text-[#229DD8] hover:bg-[#229DD8]/5 rounded-md transition-all"><Pencil className="w-3 h-3" /></button>)}
                  {user && ((user.id === p.author_id && (Date.now() - new Date(p.created_at).getTime()) < 600000) || user.tier === 'admin') && !p.is_deleted && (<button onClick={() => { if (confirm('Delete this comment? This cannot be undone.')) deletePost.mutate({ postId: p.id }); }} className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-all" title={user?.tier === 'admin' ? 'Delete comment' : 'Delete (within 10 min)'}><Trash2 className="w-3 h-3" /></button>)}
                  {user && user.id !== p.author_id && !p.is_deleted && (<button onClick={() => setReportingPost(p.id)} className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-600 hover:text-amber-400 hover:bg-amber-500/5 rounded-md transition-all"><Flag className="w-3 h-3" /></button>)}
                  {(isAdmin || isThreadAuthor) && !p.is_deleted && (<button onClick={() => markVerdict.mutate({ postId: p.id })} className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-all ${p.is_best_answer ? 'text-emerald-400' : 'text-slate-600 hover:text-emerald-400'}`}><Award className="w-3 h-3" /></button>)}
                  <button onClick={() => copyLink(p.id)} className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-all ${copiedPost === p.id ? 'text-emerald-400 bg-emerald-500/10 scale-95' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-700/30'}`} style={{transition: 'all 0.15s ease'}}>{copiedPost === p.id ? <><CheckCircle className="w-3 h-3" /><span className="text-[10px] font-medium">Copied!</span></> : <Link2 className="w-3 h-3" />}</button>
                </div>
                {replyTo === p.id && canComment && (
                  <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-[#229DD8]/20">
                    <div className="mb-2 pl-3 border-l-2 border-[#229DD8]/30 text-[10px] text-slate-500 italic line-clamp-2">{p.body.length > 120 ? p.body.substring(0, 120) + '...' : p.body}</div>
                    <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={`Reply to ${p.author_username}...`} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-950/50 py-2 px-3 text-white text-sm placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all resize-none mb-2" ref={replyBoxRef} />
                    {commentError && <p className="text-red-400 text-xs mb-2">{commentError}</p>}
                    <div className="flex items-center gap-2">
                      <button onClick={() => { if (!commentText.trim()) return; setPosting(true); setCommentError(null); (async () => { let iUrl = null; if (commentImage) { setUploading(true); try { iUrl = await uploadImage(commentImage); } finally { setUploading(false); } } return createReply.mutateAsync({ thread_id: id, body: commentText.trim(), parent_id: p.id, ...(iUrl ? { image_url: iUrl } : {}) }); })().then(() => { if (refetchThread) refetchThread(); setCommentText(''); setReplyTo(null); }).finally(() => setPosting(false)); }} disabled={!commentText.trim() || posting || uploading} className="bg-[#229DD8] hover:bg-[#1b87bc] disabled:opacity-50 text-white text-xs font-bold rounded-lg px-4 py-1.5 transition-all">{uploading ? '...' : posting ? '...' : 'Reply'}</button>
                      <button onClick={() => setReplyTo(null)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button><button type="button" onClick={() => imageInputRef.current?.click()} className="text-xs text-slate-500 hover:text-[#229DD8] transition-colors flex items-center gap-1 ml-2"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>Attach</button>
                    </div>
                  </div>
                )}
                {editingPost === p.id && (
                  <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-amber-500/20">
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-950/50 py-2 px-3 text-white text-sm placeholder-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none mb-2" />
                    <div className="flex items-center gap-2">
                      <button onClick={() => editPost.mutate({ postId: p.id, body: editText })} disabled={!editText.trim() || editPost.isPending} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg px-4 py-1.5 transition-all">{editPost.isPending ? '...' : 'Save Edit'}</button>
                      <button onClick={() => setEditingPost(null)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
                {reportingPost === p.id && (
                  <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-red-500/20">
                    <p className="text-[10px] text-slate-400 mb-2">Why are you reporting this?</p>
                    <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} rows={2} placeholder="Spam, harassment, misinformation..." className="w-full rounded-lg border border-slate-700 bg-slate-950/50 py-2 px-3 text-white text-sm placeholder-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none mb-2" />
                    <div className="flex items-center gap-2">
                      <button onClick={() => reportPost.mutate({ postId: p.id, reason: reportReason })} disabled={!reportReason.trim() || reportPost.isPending} className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg px-4 py-1.5 transition-all">{reportPost.isPending ? '...' : 'Submit Report'}</button>
                      <button onClick={() => setReportingPost(null)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </>)}
              {isCollapsed && <div className="text-[10px] text-slate-600">{dCount} more {dCount === 1 ? 'reply' : 'replies'} hidden</div>}
            </div>
          </div>
        </div>
        {!isCollapsed && children.map(child => renderComment(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <BackButton fallback="/" />
      <Link to={`/r/${thread.room_slug}`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#229DD8] transition-colors mb-4">
        <ChevronLeft className="w-3.5 h-3.5" /> {thread.room_name}
      </Link>

      <article className="prohp-card p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 pt-1">
            <button onClick={() => user && voteThread.mutate({ value: 1 })} className={`p-1 rounded transition-colors ${thread.user_vote === 1 ? 'text-slate-500 bg-slate-700/20' : thread.user_vote ? 'text-slate-700' : 'text-slate-500 hover:text-[#229DD8]'} ${!user ? 'opacity-40' : ''}`} disabled={!user}><ArrowUp className="w-5 h-5" /></button>
            <span className={`text-sm font-bold font-mono ${thread.score > 0 ? 'text-[#229DD8]' : thread.score < 0 ? 'text-red-400' : 'text-slate-400'}`}>{thread.score}</span>
            <button onClick={() => user && voteThread.mutate({ value: -1 })} className={`p-1 rounded transition-colors ${thread.user_vote === -1 ? 'text-slate-500 bg-slate-700/20' : thread.user_vote ? 'text-slate-700' : 'text-slate-500 hover:text-red-400'} ${!user ? 'opacity-40' : ''}`} disabled={!user}><ArrowDown className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-slate-100 mb-2 leading-snug">{thread.title}</h1>
            {thread.compound_name && (<Link to={`/compounds/${thread.compound_slug}`} className="inline-flex text-[10px] font-semibold text-[#229DD8]/80 bg-[#229DD8]/10 px-2 py-0.5 rounded mb-3 hover:bg-[#229DD8]/20 transition-colors">{thread.compound_name}</Link>)}
            <MarkdownRenderer content={thread.body} className="text-sm text-slate-300 leading-relaxed mb-4" />
            <div className="flex items-center gap-3 text-[11px] text-slate-500 border-t border-white/[0.04] pt-3">
              <Link to={`/u/${thread.author_username}`} className="font-medium text-slate-400 hover:text-[#229DD8] transition-colors truncate max-w-[150px] sm:max-w-[200px] inline-block align-bottom">{thread.author_username}</Link>
              {thread.author_founding && <span className="text-[8px] font-bold text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">FM</span>}
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {thread.view_count}</span>
              <span className="ml-auto">{new Date(thread.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </article>

      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
        <div id="feedback-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#229DD8]" />
              <h2 className="text-base font-bold text-white">Replies</h2>
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">{posts.length} {posts.length === 1 ? 'reply' : 'replies'}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input type="text" value={commentSearch} onChange={(e) => setCommentSearch(e.target.value)} placeholder="Search..." className="text-[10px] bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-md px-2 py-1.5 flex-1 min-w-0 sm:max-w-[120px] focus:outline-none focus:border-[#229DD8]/30 placeholder-slate-600" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="text-[10px] bg-slate-800 border border-slate-700/50 text-slate-300 rounded-md px-2 py-1.5 shrink-0 focus:outline-none focus:border-[#229DD8]/30" style={{colorScheme: 'dark'}}>
              <option value="best">Best</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {topLevel.map(p => renderComment(p, 0))}
          {posts.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No replies yet. Be the first to weigh in.</p>
            </div>
          )}
        </div>

        {canComment && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} id="main-comment-box" placeholder={replyTo ? "You are replying to a comment above..." : "Drop your experience, ask your question..."} disabled={!!replyTo} rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950/50 py-3 px-4 text-white text-sm placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all resize-none mb-3" />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-600">Proof over hype.</p><button type="button" onClick={() => imageInputRef.current?.click()} className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-[#229DD8] transition-colors px-2 py-1 rounded-md hover:bg-[#229DD8]/5 border border-transparent hover:border-[#229DD8]/20"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>Attach</button>
              <button onClick={postComment} disabled={!commentText.trim() || posting} className="bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] disabled:opacity-50 text-white font-semibold rounded-xl px-6 py-2.5 transition-all">{uploading ? 'Uploading...' : posting ? 'Posting...' : 'Post Reply'}</button>
            </div>
          </div>
        )}

                {imagePreview && (<div className="flex items-center gap-3 p-3 mt-3 rounded-lg bg-slate-800/30 border border-white/5">{commentImage?.type?.startsWith('video/') ? <video src={imagePreview} className="max-h-20 rounded-lg border border-white/10" muted /> : <img src={imagePreview} alt="Preview" className="max-h-20 rounded-lg border border-white/10" />}<div className="flex-1"><p className="text-[11px] text-slate-400">{commentImage?.name}</p><p className="text-[9px] text-slate-600">{commentImage ? (commentImage.size / 1024 / 1024).toFixed(1) + ' MB' : ''}</p></div><button onClick={() => { setCommentImage(null); setImagePreview(null); if (imageInputRef.current) imageInputRef.current.value = ''; }} className="text-red-400 hover:text-red-300 text-xs font-medium">Remove</button></div>)}
        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,video/mp4,video/webm,video/quicktime" ref={imageInputRef} onChange={handleImageSelect} className="hidden" />

        {thread.is_locked && (<div className="mt-4 text-center"><p className="text-xs text-slate-500">This thread is locked. No new replies.</p></div>)}
        {!user && !thread.is_locked && (<div className="mt-6 pt-4 border-t border-white/5 text-center"><p className="text-sm text-slate-400 mb-3">Log in to join the conversation.</p><Link to="/login" state={{ from: window.location.pathname }} className="prohp-btn-primary text-xs">Log in</Link></div>)}
      </div>

      {/* Context-Aware HUD */}
      {showHud && (scrollDir === 'up' ? (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6" style={{zIndex: 9999}}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl text-[11px] sm:text-xs text-slate-300 font-medium rounded-full px-3 py-2 sm:px-4 sm:py-2.5 border border-white/10 shadow-lg hover:border-[#229DD8]/30 transition-all">
            <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Top
          </button>
        </div>
      ) : commentBoxAbove ? (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6" style={{zIndex: 9999}}>
          <button onClick={() => { hudLocked.current = true; setShowHud(false); const box = document.getElementById('main-comment-box'); if (box) { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => { box.focus(); hudLocked.current = false; }, 1500); } }} className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl text-[11px] sm:text-xs text-slate-300 font-medium rounded-full px-3 py-2 sm:px-4 sm:py-2.5 border border-white/10 shadow-lg hover:border-[#229DD8]/30 transition-all">
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Reply
          </button>
        </div>
      ) : null)}
    </div>
  );
}
