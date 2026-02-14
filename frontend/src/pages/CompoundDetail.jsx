import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ExternalLink, MessageSquare, Dumbbell } from 'lucide-react';
import { api } from '../hooks/api';

export default function CompoundDetail() {
  const { slug } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['compound', slug],
    queryFn: () => api.get(`/api/compounds/${slug}`),
  });

  if (isLoading) return <div className="animate-pulse max-w-3xl mx-auto"><div className="h-8 bg-slate-800 rounded w-1/3 mb-4" /><div className="h-40 bg-slate-800 rounded" /></div>;
  if (error) return <div className="text-red-400 text-sm text-center py-12">{error.message}</div>;

  const { compound, related_threads, related_cycles } = data;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/compounds" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-prohp-400 transition-colors mb-4">
        <ChevronLeft className="w-3.5 h-3.5" /> Encyclopedia
      </Link>

      <div className="prohp-card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight mb-1">{compound.name}</h1>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded risk-${compound.risk_tier}`}>
                Risk: {compound.risk_tier}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                {compound.category}
              </span>
              <span className="text-[10px] font-semibold text-prohp-500/70 bg-prohp-500/10 px-2 py-0.5 rounded">
                {compound.trust_level}
              </span>
            </div>
          </div>
          {compound.youtube_url && (
            <a href={compound.youtube_url} target="_blank" rel="noopener noreferrer"
               className="prohp-btn-ghost text-xs flex items-center gap-1.5">
              Watch Review <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {compound.summary && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Overview</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{compound.summary}</p>
          </div>
        )}

        {compound.mechanism && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">How It Works</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{compound.mechanism}</p>
          </div>
        )}

        {compound.side_effects && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400/70 mb-2">What Can Go Wrong</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{compound.side_effects}</p>
          </div>
        )}

        {compound.dosing && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Dosing</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{compound.dosing}</p>
          </div>
        )}
      </div>

      {related_threads?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> Discussions
          </h2>
          <div className="space-y-1.5">
            {related_threads.map((t) => (
              <Link key={t.id} to={`/t/${t.id}`} className="prohp-card px-4 py-2.5 block hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold font-mono text-prohp-400 min-w-[24px]">{t.score}</span>
                  <span className="text-sm text-slate-300 flex-1 truncate">{t.title}</span>
                  <span className="text-[10px] text-slate-600">{t.reply_count} replies</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {related_cycles?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <Dumbbell className="w-3.5 h-3.5" /> Cycle Logs
          </h2>
          <div className="space-y-1.5">
            {related_cycles.map((c) => (
              <Link key={c.id} to={`/cycles/${c.id}`} className="prohp-card px-4 py-2.5 block hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 flex-1 truncate">{c.title}</span>
                  <span className="text-[10px] text-slate-600">{c.username} · {c.update_count} updates</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
