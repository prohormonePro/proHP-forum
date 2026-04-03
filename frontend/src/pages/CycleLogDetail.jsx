import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Activity, CheckCircle, XCircle, Clock, MessageSquare, ArrowUp, ArrowDown, Reply, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '../hooks/api';
import useAuthStore from '../stores/auth';
import MarkdownRenderer from '../components/MarkdownRenderer';

const STATUS_MAP = {
  active: { icon: Activity, color: 'text-prohp-400', bg: 'bg-prohp-500/10', label: 'Active' },
  completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Verified' },
  abandoned: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Abandoned' },
};

function computeStatus(cycle) {
  if (cycle.status === 'abandoned') return 'abandoned';
  if (cycle.status === 'completed') return 'completed';
  if (!cycle.start_date || !cycle.duration_weeks) return cycle.status || 'active';
  const start = new Date(cycle.start_date);
  const end = new Date(start);
  end.setDate(end.getDate() + cycle.duration_weeks * 7);
  return new Date() > end ? 'completed' : 'active';
}

function computeWeekProgress(cycle) {
  if (!cycle.start_date || !cycle.duration_weeks) return null;
  const start = new Date(cycle.start_date);
  const now = new Date();
  const diffMs = now - start;
  const currentWeek = Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
  return { current: Math.min(currentWeek, cycle.duration_weeks), total: cycle.duration_weeks };
}

function parseMediaLinks(description) {
  if (!description) return { text: '', bloodwork: null, before: null, after: null };
  const lines = description.split('\n');
  const divider = lines.findIndex((l) => l.trim() === '---');
  if (divider === -1) return { text: description, bloodwork: null, before: null, after: null };
  const textPart = lines.slice(0, divider).join('\n').trim();
  const mediaPart = lines.slice(divider + 1).join('\n');
  let bloodwork = null, before = null, after = null;
  const bld = mediaPart.match(/Bloodwork[^:]*:\s*(https?:\/\/\S+)/i);
  const bfr = mediaPart.match(/Before[^:]*:\s*(https?:\/\/\S+)/i);
  const aft = mediaPart.match(/After[^:]*:\s*(https?:\/\/\S+)/i);
  if (bld) bloodwork = bld[1];
  if (bfr) before = bfr[1];
  if (aft) after = aft[1];
  return { text: textPart, bloodwork, before, after };
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) return diffMinutes <= 1 ? 'now' : `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const SEVERITY_LABELS = { 1: 'Minimal', 2: 'Mild', 3: 'Moderate', 4: 'Significant', 5: 'Severe' };

function ratingColor(r) {
  if (r == null) return 'text-slate-500';
  if (r > 7) return 'text-emerald-400';
  if (r >= 5) return 'text-amber-400';
  return 'text-red-400';
}

function ratingBg(r) {
  if (r == null) return 'bg-slate-500/10';
  if (r > 7) return 'bg-emerald-500/10';
  if (r >= 5) return 'bg-amber-500/10';
  return 'bg-red-500/10';
}

function WeeklyUpdateForm({ cycleId, existingWeeks, onSuccess }) {
  const nextWeek = existingWeeks.length > 0 ? Math.max(...existingWeeks) + 1 : 1;
  const [formData, setFormData] = useState({
    week_number: nextWeek, weight_lbs: '', body_fat_pct: '',
    strength_notes: '', side_effects: '', side_effect_severity: '',
    mood_notes: '', general_notes: '',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => api.post(`/api/cycles/${cycleId}/updates`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle', cycleId] });
      setFormData((prev) => ({ ...prev, week_number: prev.week_number + 1,
        weight_lbs: '', body_fat_pct: '', strength_notes: '',
        side_effects: '', side_effect_severity: '', mood_notes: '', general_notes: '' }));
      setError('');
      onSuccess?.();
    },
    onError: (err) => setError(err?.message || 'Failed to post update'),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const wk = parseInt(formData.week_number, 10);
    if (!wk || wk < 1) { setError('Week number required'); return; }
    if (existingWeeks.includes(wk)) { setError(`Week ${wk} already posted.`); return; }
    mutation.mutate({
      week_number: wk,
      weight_lbs: formData.weight_lbs ? parseFloat(formData.weight_lbs) : null,
      body_fat_pct: formData.body_fat_pct ? parseFloat(formData.body_fat_pct) : null,
      strength_notes: formData.strength_notes || '',
      side_effects: formData.side_effects || '',
      side_effect_severity: formData.side_effect_severity ? parseInt(formData.side_effect_severity, 10) : null,
      mood_notes: formData.mood_notes || '',
      general_notes: formData.general_notes || '',
    });
  };

  const ic = "w-full rounded-xl border border-slate-700 bg-slate-950/50 py-2.5 px-4 text-white text-sm placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all";

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-[#229DD8]/25 p-6">
      <h3 className="text-lg font-bold text-white mb-1">Post Weekly Update</h3>
      <p className="text-xs text-slate-500 mb-5">Drop the data. That is how we learn.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><label className="block text-xs font-medium text-slate-300 mb-1">Week #</label>
            <input type="number" name="week_number" value={formData.week_number} onChange={handleChange} min="1" max="52" required className={ic} /></div>
          <div><label className="block text-xs font-medium text-slate-300 mb-1">Weight (lbs)</label>
            <input type="number" name="weight_lbs" value={formData.weight_lbs} onChange={handleChange} step="0.1" placeholder="185" className={ic} /></div>
          <div><label className="block text-xs font-medium text-slate-300 mb-1">Body Fat %</label>
            <input type="number" name="body_fat_pct" value={formData.body_fat_pct} onChange={handleChange} step="0.1" placeholder="14" className={ic} /></div>
        </div>
        <div><label className="block text-xs font-medium text-slate-300 mb-1">Strength Notes</label>
          <input type="text" name="strength_notes" value={formData.strength_notes} onChange={handleChange} placeholder="Bench up 10lbs, squat same" className={ic} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-slate-300 mb-1">Side Effects</label>
            <input type="text" name="side_effects" value={formData.side_effects} onChange={handleChange} placeholder="Mild suppression, no hair issues" className={ic} /></div>
          <div><label className="block text-xs font-medium text-slate-300 mb-1">Severity (1-5)</label>
            <select name="side_effect_severity" value={formData.side_effect_severity} onChange={handleChange} className={ic}>
              <option value="">None</option>
              <option value="1">1 — Minimal</option><option value="2">2 — Mild</option>
              <option value="3">3 — Moderate</option><option value="4">4 — Significant</option>
              <option value="5">5 — Severe</option>
            </select></div>
        </div>
        <div><label className="block text-xs font-medium text-slate-300 mb-1">Mood / Energy</label>
          <input type="text" name="mood_notes" value={formData.mood_notes} onChange={handleChange} placeholder="Energy stable, sleep slightly off" className={ic} /></div>
        <div><label className="block text-xs font-medium text-slate-300 mb-1">General Notes</label>
          <textarea name="general_notes" value={formData.general_notes} onChange={handleChange} rows={3} placeholder="Anything else worth documenting..." className={ic + " resize-vertical"} /></div>
        {error && (<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm">{error}</p></div>)}
        <button type="submit" disabled={mutation.isPending} className="w-full bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] disabled:opacity-50 text-white font-bold rounded-xl py-3 px-6 transition-all shadow-lg hover:shadow-[#229DD8]/20">
          {mutation.isPending ? 'Posting...' : `Post Week ${formData.week_number} Update`}
        </button>
      </form>
    </div>
  );
}

export default function CycleLogDetail() {
  const { id } = useParams();
  const user = useAuthStore((x) => x.user);
  const queryClient = useQueryClient();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [collapsedThreads, setCollapsedThreads] = useState({});
  const toggleCollapse = (id) => setCollapsedThreads(prev => ({...prev, [id]: !prev[id]}));
  const [showHud, setShowHud] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({ 0: true });
  const toggleWeek = (i) => setExpandedWeeks(prev => ({...prev, [i]: !prev[i]}));
  const toggleAllWeeks = (open) => { const o = {}; (updates || []).forEach((_, i) => { o[i] = open; }); setExpandedWeeks(o); };
  const [scrollDir, setScrollDir] = useState('down');
  const lastScrollY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollDir(y > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = y;
      const atBottom = (window.innerHeight + y) >= (document.body.scrollHeight - 200);
      setShowHud(y > 200 && !atBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeRating, setCompleteRating] = useState('');
  const [completeWouldRunAgain, setCompleteWouldRunAgain] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const replyBoxRef = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['cycle', id],
    queryFn: () => api.get(`/api/cycles/${id}`),
  });

  const { data: threadData, isLoading: threadLoading, refetch: refetchThread } = useQuery({
    queryKey: ['thread', data?.cycle?.thread_id],
    queryFn: () => api.get(`/api/threads/${data.cycle.thread_id}?limit=200`).then(r => r?.data ?? r),
    enabled: !!data?.cycle?.thread_id,
  });

  const votePost = useMutation({
    mutationFn: ({ postId, value }) => api.post(`/api/posts/${postId}/vote`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', data.cycle.thread_id] });
    },
  });

  const [commentError, setCommentError] = useState(null);

  const completeCycle = useMutation({
    mutationFn: (payload) => api.patch('/api/cycles/' + id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle', id] });
      setShowCompleteForm(false);
    },
  });

  const createPost = useMutation({
    mutationFn: (postData) => api.post('/api/posts', postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', data.cycle.thread_id] });
      if (refetchThread) refetchThread();
      setCommentText('');
      setReplyTo(null);
      setCommentError(null);
      setTimeout(() => { const els = document.querySelectorAll('[id^=comment-]'); if (els.length) els[els.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 500);
    },
    onError: (err) => {
      setCommentError(err?.message || 'Failed to post. Please try again.');
    },
  });

  const postComment = async () => {
    if (!commentText.trim() || !data?.cycle?.thread_id) return;
    setCommentError(null);
    setPosting(true);
    try {
      await createPost.mutateAsync({
        thread_id: data.cycle.thread_id,
        body: commentText.trim(),
        ...(replyTo ? { parent_id: replyTo } : {}),
      });
    } finally {
      setPosting(false);
    }
  };

  const handleReply = (postId, authorUsername) => {
    setReplyTo(postId);
    setTimeout(() => {
      replyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      replyBoxRef.current?.focus();
    }, 100);
  };

  const handleVote = (postId, value) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (post && post.user_vote && post.user_vote !== value) {
      votePost.mutate({ postId, value: post.user_vote });
      return;
    }
    votePost.mutate({ postId, value });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
          <div className="h-4 bg-slate-800 rounded w-2/3" />
          <div className="h-40 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data?.cycle) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Link to="/cycles" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Cycle Logs
        </Link>
        <div className="prohp-card p-10 text-center border border-white/5">
          <p className="text-red-400">Cycle log not found or access denied.</p>
        </div>
      </div>
    );
  }

  const { cycle, updates } = data;
  const status = computeStatus(cycle);
  const sc = STATUS_MAP[status] || STATUS_MAP.active;
  const Icon = sc.icon;
  const weekProgress = computeWeekProgress(cycle);
  const media = parseMediaLinks(cycle.description);
  const isOwner = user?.id === cycle.user_id;
  const existingWeeks = (updates || []).map((u) => u.week_number);
  const latestUpdate = (updates || []).length > 0 ? [...updates].sort((a, b) => b.week_number - a.week_number)[0] : null;
  const latestWeight = latestUpdate?.weight_lbs || null;
  const posts = threadData?.posts || [];
  const canComment = user && (user.tier === 'inner_circle' || user.tier === 'admin');

  const replyToPost = replyTo ? posts.find(p => p.id === replyTo) : null;
  const topLevel = posts
    .filter(p => !p.parent_id)
    .sort((a, b) => (b.score || 0) - (a.score || 0) || new Date(a.created_at) - new Date(b.created_at));
  const repliesByParent = {};
  posts
    .filter(p => p.parent_id)
    .sort((a, b) => (b.score || 0) - (a.score || 0) || new Date(a.created_at) - new Date(b.created_at))
    .forEach(p => {
      if (!repliesByParent[p.parent_id]) repliesByParent[p.parent_id] = [];
      repliesByParent[p.parent_id].push(p);
    });

  return (
    <div className="max-w-3xl mx-auto animate-fade-in p-6">
      <Link to="/cycles" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Cycle Logs
      </Link>

      {/* Protocol Header */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-white mb-1 truncate">{cycle.compound_name}</h1>
            <p className="text-sm text-slate-300 font-medium mb-2">{cycle.title}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-[#229DD8] font-semibold">{cycle.username}</span>
              {cycle.is_founding && <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">FM</span>}
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-slate-400">{new Date(cycle.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start shrink-0">
            {cycle.would_run_again != null && (
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${cycle.would_run_again ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {cycle.would_run_again ? <ThumbsUp className="w-5 h-5 text-emerald-400" /> : <ThumbsDown className="w-5 h-5 text-red-400" />}
                <span className={`text-xs font-bold ${cycle.would_run_again ? 'text-emerald-400' : 'text-red-400'}`}>{cycle.would_run_again ? 'Again' : 'No'}</span>
              </div>
            )}
            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl ${ratingBg(cycle.rating)} border border-white/5`}>
              {cycle.rating != null ? (<><span className={`text-3xl font-black leading-none ${ratingColor(cycle.rating)}`}>{cycle.rating}</span><span className="text-[9px] uppercase font-bold text-slate-500 mt-1">/10</span></>) : (<span className="text-xs text-slate-600 font-medium">N/R</span>)}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">

          {cycle.dose && (
            <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Dose</p>
              <p className="text-sm font-bold text-white">{cycle.dose}</p>
            </div>
          )}
          {cycle.duration_weeks && (
            <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Duration</p>
              <p className="text-sm font-bold text-white">{cycle.duration_weeks} weeks</p>
            </div>
          )}
          {weekProgress && (
            <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Progress</p>
              <p className="text-sm font-bold text-[#229DD8]">Week {weekProgress.current} / {weekProgress.total}</p>
            </div>
          )}
          {latestWeight && (
            <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Latest Weight</p>
              <p className="text-sm font-bold text-white">{latestWeight} lbs</p>
            </div>
          )}
        </div>

        {/* Description */}
        {media.text && (
          <div className="mb-6">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{media.text}</p>
          </div>
        )}

        {/* Media Links */}
        {(media.bloodwork || media.before || media.after) && (
          <div className="flex flex-wrap gap-3">
            {media.bloodwork && (
              <a href={media.bloodwork} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-[#229DD8] hover:bg-[#229DD8]/10 transition">Bloodwork PDF</a>
            )}
            {media.before && (
              <a href={media.before} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-[#229DD8] hover:bg-[#229DD8]/10 transition">Before Pic</a>
            )}
            {media.after && (
              <a href={media.after} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-[#229DD8] hover:bg-[#229DD8]/10 transition">After Pic</a>
            )}
          </div>
        )}
      </div>

      {/* Weekly Updates Timeline */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Weekly Updates</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{(updates || []).length} update{(updates || []).length !== 1 ? 's' : ''}</span>
            {(updates || []).length > 2 && (
              <button onClick={() => toggleAllWeeks(!Object.values(expandedWeeks).some(v => v))} className="text-[10px] text-slate-500 hover:text-[#229DD8] transition-colors">{Object.values(expandedWeeks).some(v => v) ? 'Collapse All' : 'Expand All'}</button>
            )}
          </div>
        </div>

        {(updates || []).length === 0 ? (
          <div className="prohp-card p-8 text-center border border-white/5">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              {isOwner ? 'No updates yet. Drop your first weekly check-in below.' : 'No weekly updates posted yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((update, idx) => (
              <div key={update.id} className="prohp-card border border-white/5 overflow-hidden">
                <button onClick={() => toggleWeek(idx)} className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors text-left">
                  <span className="text-sm font-bold text-[#229DD8]">Week {update.week_number}</span>
                  <div className="flex items-center gap-3">
                    {update.weight_lbs && <span className="text-[10px] text-slate-400">{update.weight_lbs} lbs</span>}
                    <span className="text-[10px] text-slate-500">{new Date(update.created_at).toLocaleDateString()}</span>
                    <span className="text-[10px] text-slate-600">{expandedWeeks[idx] ? '-' : '+'}</span>
                  </div>
                </button>
                {expandedWeeks[idx] && <div className="px-5 pb-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {update.weight_lbs && (<div><p className="text-[10px] uppercase text-slate-500 font-semibold">Weight</p><p className="text-sm text-white">{update.weight_lbs} lbs</p></div>)}
                  {update.body_fat_pct && (<div><p className="text-[10px] uppercase text-slate-500 font-semibold">Body Fat</p><p className="text-sm text-white">{update.body_fat_pct}%</p></div>)}
                  {update.side_effect_severity && (<div><p className="text-[10px] uppercase text-slate-500 font-semibold">Side Effects</p><p className="text-sm text-white">{SEVERITY_LABELS[update.side_effect_severity] || update.side_effect_severity}/5</p></div>)}
                </div>
                {update.strength_notes && <p className="text-sm text-slate-300 mb-1"><span className="text-slate-500">Strength:</span> {update.strength_notes}</p>}
                {update.side_effects && <p className="text-sm text-slate-300 mb-1"><span className="text-slate-500">Sides:</span> {update.side_effects}</p>}
                {update.mood_notes && <p className="text-sm text-slate-300 mb-1"><span className="text-slate-500">Mood:</span> {update.mood_notes}</p>}
                {update.general_notes && <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">{update.general_notes}</p>}
                </div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Cycle */}
      {isOwner && status === 'active' && (
        <div className="mb-6">
          {!showCompleteForm ? (
            <button onClick={() => setShowCompleteForm(true)} className="w-full border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-semibold rounded-xl py-3 px-6 transition-all">Complete Cycle</button>
          ) : (
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-emerald-500/25 p-6">
              <h3 className="text-lg font-bold text-white mb-1">Complete Cycle</h3>
              <p className="text-xs text-slate-500 mb-5">Final verdict. Rate the compound and lock it in.</p>
              <div className="space-y-4">
                <div><label className="block text-xs font-medium text-slate-300 mb-1">Rating (1-10)</label><select value={completeRating} onChange={(e) => setCompleteRating(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950/50 py-2.5 px-4 text-white text-sm focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all"><option value="">Select rating</option>{[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={completeWouldRunAgain} onChange={(e) => setCompleteWouldRunAgain(e.target.checked)} className="w-4 h-4 rounded border-slate-600 bg-slate-950 text-[#229DD8] focus:ring-[#229DD8]" /><span className="text-sm text-slate-300">Would run again</span></label>
                {completeCycle.isError && (<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm">{completeCycle.error?.message || 'Failed'}</p></div>)}
                <div className="flex gap-3"><button onClick={() => { if (!completeRating) return; completeCycle.mutate({ rating: parseInt(completeRating, 10), would_run_again: completeWouldRunAgain, status: 'completed' }); }} disabled={!completeRating || completeCycle.isPending} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl py-3 px-6 transition-all shadow-lg">{completeCycle.isPending ? 'Submitting...' : 'Submit & Complete'}</button><button onClick={() => setShowCompleteForm(false)} className="px-4 py-3 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Author Update Form */}
      {isOwner && status === 'active' && (
        <div className="mb-6">
          {!showUpdateForm ? (
            <button onClick={() => setShowUpdateForm(true)}
              className="w-full border border-[#229DD8]/30 bg-[#229DD8]/5 hover:bg-[#229DD8]/10 text-[#229DD8] font-semibold rounded-xl py-3 px-6 transition-all">
              + Post Weekly Update
            </button>
          ) : (
            <WeeklyUpdateForm cycleId={id} existingWeeks={existingWeeks} onSuccess={() => setShowUpdateForm(false)} />
          )}
        </div>
      )}

      {/* Community Feedback Section */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#229DD8]" />
            <h3 className="text-lg font-bold text-white">Community Feedback</h3>
          </div>
          <span className="text-xs text-slate-500">{posts.length} comment{posts.length !== 1 ? 's' : ''}</span>
        </div>

        {!cycle.thread_id ? (
          <div className="text-center p-8"><p className="text-sm text-slate-400">Comments not available for this log.</p></div>
        ) : (
          <>
            {posts.length === 0 ? (
              <div className="text-center p-8"><p className="text-sm text-slate-400">No comments yet. Be the first to share your thoughts.</p></div>
            ) : (
              <div className="space-y-3 mb-6">
                {(() => {
                  const marginByDepth = ['ml-0', 'ml-8', 'ml-14', 'ml-14'];
                  const borderByDepth = ['border-l-transparent', 'border-l-[#229DD8]/30', 'border-l-[#229DD8]/15', 'border-l-slate-600/20'];
                  const avatarSize = (d) => d < 2 ? 'w-8 h-8 text-sm' : 'w-7 h-7 text-xs';
                  const avatarBg = (d) => d === 0 ? 'bg-[#229DD8]' : d === 1 ? 'bg-[#1b87bc]' : 'bg-slate-700';

                  function renderComment(p, depth) {
                    const d = Math.min(depth, 3);
                    const parentPost = depth >= 3 ? posts.find(x => x.id === p.parent_id) : null;
                    const children = repliesByParent[p.id] || [];
                    const isCollapsed = collapsedThreads[p.id];
                    const descendantCount = children.reduce(function cc(s, k) { return s + 1 + (repliesByParent[k.id] || []).reduce(cc, 0); }, 0);
                    return (
                      <div key={p.id} className={depth > 0 ? 'mt-2' : ''} id={'comment-' + p.id}>
                        <div className={`${marginByDepth[d]} bg-slate-950/50 rounded-xl p-4 border border-white/5 border-l-2 ${borderByDepth[d]} transition-all hover:border-l-[#229DD8]/40`}>
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`${avatarSize(d)} rounded-lg ${avatarBg(d)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                {p.author_username?.charAt(0).toUpperCase() || 'A'}
                              </div>
                              {children.length > 0 && (
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCollapse(p.id); }} className="text-[10px] text-slate-600 hover:text-[#229DD8] font-mono transition-colors w-5 h-5 flex items-center justify-center rounded hover:bg-[#229DD8]/5" title={isCollapsed ? 'Expand' : 'Collapse'}>
                                  {isCollapsed ? '+' : '-'}
                                </button>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-sm font-semibold text-[#229DD8]">{p.author_username}</span>
                                {(p.author_tier === 'inner_circle' || p.author_tier === 'admin') && (
                                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{p.author_tier === 'admin' ? 'ADM' : 'IC'}</span>
                                )}
                                <span className="text-[11px] text-slate-500">{timeAgo(p.created_at)}</span>
                                {isCollapsed && descendantCount > 0 && (
                                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCollapse(p.id); }} className="text-[10px] text-slate-500 hover:text-[#229DD8] bg-slate-800/50 px-2 py-0.5 rounded-md transition-colors">+{descendantCount} more</button>
                                )}
                              </div>
                              {parentPost && depth >= 3 && (
                                <div className="mb-1.5"><span className="text-[11px] text-[#229DD8]/60 font-medium">@{parentPost.author_username}</span></div>
                              )}
                              {!isCollapsed && (<>
                              <div className="text-sm text-slate-300 leading-relaxed mb-2">
                                <MarkdownRenderer content={p.body} />
                              </div>
                              <div className="flex items-center gap-1">
                                {user && (
                                  <div className="flex items-center gap-0.5 mr-3">
                                    <button onClick={() => handleVote(p.id, 1)} className={`p-1 rounded-md transition-all ${p.user_vote === 1 ? 'text-[#229DD8] bg-[#229DD8]/10' : 'text-slate-600 hover:text-[#229DD8] hover:bg-[#229DD8]/5'}`} disabled={votePost.isPending}><ArrowUp className="w-3.5 h-3.5" /></button>
                                    <span className={`text-xs font-semibold min-w-[20px] text-center ${(p.score || 0) > 0 ? 'text-[#229DD8]' : (p.score || 0) < 0 ? 'text-red-400' : 'text-slate-500'}`}>{p.score || 0}</span>
                                    <button onClick={() => handleVote(p.id, -1)} className={`p-1 rounded-md transition-all ${p.user_vote === -1 ? 'text-red-400 bg-red-500/10' : 'text-slate-600 hover:text-red-400 hover:bg-red-500/5'}`} disabled={votePost.isPending}><ArrowDown className="w-3.5 h-3.5" /></button>
                                  </div>
                                )}
                                {canComment && (
                                  <button onClick={() => handleReply(p.id, p.author_username)} className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-all ${replyTo === p.id ? 'text-[#229DD8] bg-[#229DD8]/10' : 'text-slate-500 hover:text-[#229DD8] hover:bg-[#229DD8]/5'}`}><Reply className="w-3 h-3" /> Reply</button>
                                )}
                              </div>
                              {replyTo === p.id && canComment && (
                                <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-[#229DD8]/20">
                                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={`Reply to ${p.author_username}...`} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-950/50 py-2 px-3 text-white text-sm placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all resize-none mb-2" ref={replyBoxRef} />
                                  {commentError && <p className="text-red-400 text-xs mb-2">{commentError}</p>}
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => { if (!commentText.trim() || !data?.cycle?.thread_id) return; setPosting(true); setCommentError(null); createPost.mutateAsync({ thread_id: data.cycle.thread_id, body: commentText.trim(), parent_id: p.id }).then(() => { if (refetchThread) refetchThread(); setCommentText(''); setReplyTo(null); }).finally(() => setPosting(false)); }} disabled={!commentText.trim() || posting} className="bg-[#229DD8] hover:bg-[#1b87bc] disabled:opacity-50 text-white text-xs font-bold rounded-lg px-4 py-1.5 transition-all">{posting ? '...' : 'Reply'}</button>
                                    <button onClick={() => setReplyTo(null)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
                                  </div>
                                </div>
                              )}
                              </>)}
                            </div>
                          </div>
                        </div>
                        {!isCollapsed && children.map(child => renderComment(child, depth + 1))}
                      </div>
                    );
                  }
                  return topLevel.map(p => renderComment(p, 0));
                })()}
              </div>
            )}



            {/* New Top-Level Comment */}
            {canComment && !replyTo ? (
              <div className="mt-4 pt-4 border-t border-white/5">
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Share your thoughts, advice, or questions..." rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950/50 py-2.5 px-4 text-white text-sm placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all resize-vertical mb-3" ref={replyBoxRef} />
                {commentError && <p className="text-red-400 text-sm mb-2">{commentError}</p>}
                <button onClick={postComment} disabled={!commentText.trim() || posting} className="bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] disabled:opacity-50 text-white font-semibold rounded-xl px-6 py-2.5 transition-all">{posting ? 'Posting...' : 'Post Comment'}</button>
              </div>
            ) : !canComment && user ? (
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400 mb-3">Join Inner Circle to comment and engage with the community.</p>
                <Link to="/compounds" className="inline-block bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] text-white font-semibold rounded-xl px-6 py-2.5 transition-all">Upgrade to Inner Circle</Link>
              </div>
            ) : !user ? (
              <div className="mt-6 text-center"><p className="text-sm text-slate-400">Sign in to join the discussion.</p></div>
            ) : null}
          </>
        )}
      </div>
      {/* Context-Aware Thread HUD */}
      {showHud && (
        <div className="fixed bottom-6 right-6" style={{zIndex: 9999}}>
          {scrollDir === 'up' ? (
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl border border-[#229DD8]/20 text-[#229DD8] hover:border-[#229DD8]/50 hover:shadow-[0_0_20px_rgba(34,157,216,0.15)] rounded-full px-4 py-2.5 text-xs font-bold transition-all shadow-xl">
              <ArrowUp className="w-3.5 h-3.5" /> Back to Top
            </button>
          ) : (
            <button onClick={() => { const box = document.querySelector('textarea'); if (box) { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => box.focus(), 400); } }} className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl border border-[#229DD8]/20 text-[#229DD8] hover:border-[#229DD8]/50 hover:shadow-[0_0_20px_rgba(34,157,216,0.15)] rounded-full px-4 py-2.5 text-xs font-bold transition-all shadow-xl">
              <MessageSquare className="w-3.5 h-3.5" /> Drop a Comment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
