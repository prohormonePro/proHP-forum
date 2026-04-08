import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dumbbell, Activity, CheckCircle, XCircle, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { api } from '../hooks/api';
import CycleLogForm from '../components/CycleLogForm';
import useAuthStore from '../stores/auth';

const STATUS_CONFIG = { active: { icon: Activity, color: 'text-prohp-400', bg: 'bg-prohp-500/10', label: 'Active' },
  completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
  abandoned: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Abandoned' },
};

function ratingColor(r) { if (r == null) return 'text-slate-500';
  if (r > 7) return 'text-emerald-400';
  if (r >= 5) return 'text-amber-400';
  return 'text-red-400';
}

function ratingBg(r) { if (r == null) return 'bg-slate-500/10';
  if (r > 7) return 'bg-emerald-500/10';
  if (r >= 5) return 'bg-amber-500/10';
  return 'bg-red-500/10';
}

export default function CyclesPage() { const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(searchParams.get('new') === '1');
  const userTier = useAuthStore((x) => x.user?.tier);
  const isInner = userTier === 'inner_circle' || userTier === 'admin';

  const { data, isLoading } = useQuery({ queryKey: ['cycles'],
    queryFn: () => api.get('/api/cycles'),
    enabled: isInner,
  });

  if (!isInner) { return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-4"><button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Back</button></div>

                <div className="flex items-center gap-3 mb-2">
          <Dumbbell className="w-6 h-6 text-[#229DD8]" />
          <h1 className="text-xl font-extrabold tracking-tight text-white">Cycle Logs</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Log your cycle. Share your data. Help the next guy.</p>
        <div className="rounded-2xl border border-[#229DD8]/30 bg-[#0f1117] p-8 shadow-[0_14px_40px_rgba(0,0,0,0.35)] text-center">
          <Dumbbell className="w-10 h-10 text-[#229DD8] mx-auto mb-4" />
          <div className="text-white text-lg font-bold mb-2">Cycle Logs are Inner Circle only</div>
          <p className="text-sm text-slate-400 mb-5">Real protocols. Real bloodwork. Real mistakes. Posted by dudes actually under the bar.</p>
          <a href="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#229DD8] to-[#1b87bc] px-6 py-3 text-sm font-bold text-white hover:from-[#1b87bc] hover:to-[#166e9c] transition-all shadow-lg">
            Join Inner Circle
          </a>
        </div>
      </div>
    );
  }

  const sortedCycles = [...(data?.cycles || [])].sort((a, b) => { const ra = a.rating != null ? a.rating : -1;
    const rb = b.rating != null ? b.rating : -1;
    return rb - ra;
  });

  return ( <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-4"><button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Back</button></div>
      <div className="flex items-center gap-3 mb-2">
        <Dumbbell className="w-6 h-6 text-[#229DD8]" />
        <h1 className="text-xl font-extrabold tracking-tight text-white">Cycle Logs</h1>
      </div>
      <p className="text-sm text-slate-400 mb-6">Log your cycle. Share your data. Help the next guy.</p>

      {!showForm && ( <button onClick={() => setShowForm(true)}
          className="mb-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#229DD8] to-[#1b87bc] px-6 py-3 text-sm font-bold text-white hover:from-[#1b87bc] hover:to-[#166e9c] transition-all shadow-lg hover:shadow-[#229DD8]/20">
          + Log Your Cycle
        </button>
      )}

      {showForm && ( <div className="mb-8 animate-fade-in">
          <CycleLogForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? ( Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-slate-900/80 p-6 animate-pulse">
              <div className="h-5 bg-slate-800 rounded w-1/2 mb-3" />
              <div className="h-3 bg-slate-800 rounded w-3/4" />
            </div>
          ))
        ) : sortedCycles.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-slate-900/80 p-10 text-center">
            <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-base text-slate-400 font-medium">No cycle logs yet. Be the first to drop your protocol.</p>
          </div>
        ) : (
          sortedCycles.map((cycle) => { const sc = STATUS_CONFIG[String(cycle.status || 'active').toLowerCase()] || STATUS_CONFIG.active;
            const Icon = sc.icon;
            return ( <Link to={`/cycles/${cycle.id}`} key={cycle.id}
                className="block rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-md hover:border-[#229DD8]/20 hover:bg-slate-800/60 transition-all cursor-pointer overflow-visible">
                <div className="flex">
                  {/* Main content */}
                  <div className="flex-1 p-5 min-w-0">
                    {/* Compound headline */}
                    <h3 className="text-lg font-extrabold text-white truncate mb-1">{cycle.compound_name}</h3>
                  {cycle.comment_count > 0 && <span className="flex items-center gap-1 text-[10px] text-slate-500 ml-2"><MessageSquare className="w-3 h-3" />{cycle.comment_count}</span>}
                    {/* Title */}
                    <p className="text-sm text-slate-300 font-medium truncate mb-2">{cycle.title}</p>
                    {/* Dose + Duration inline */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                      {cycle.dose && <span className="text-slate-300">{cycle.dose}</span>}
                      {cycle.dose && cycle.duration_weeks && <span className="w-1 h-1 rounded-full bg-slate-600" />}
                      {cycle.duration_weeks && <span className="text-slate-300">{cycle.duration_weeks} weeks</span>}
                    </div>
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="text-[#229DD8]">{cycle.username}</span>
                      {cycle.is_founding && <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">FM</span>}
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${sc.bg}`}>
                        <Icon className={`w-3 h-3 ${sc.color}`} />
                        <span className={`text-[10px] font-bold uppercase ${sc.color}`}>{sc.label}</span>
                      </div>
                      {cycle.is_featured && ( <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">Featured</span>
                      )}
                      {cycle.update_count > 0 && ( <><span className="w-1 h-1 rounded-full bg-slate-600" /><span>{cycle.update_count} updates</span></>
                      )}
                      {/* Would run again badge */}
                      {cycle.would_run_again != null && ( <>
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${cycle.would_run_again ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                            {cycle.would_run_again ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                            {cycle.would_run_again ? 'Again' : 'No'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Rating column */}
                  <div className={`flex flex-col items-center justify-center w-20 shrink-0 ${ratingBg(cycle.rating)} border-l border-white/5`}>
                    {cycle.rating != null ? ( <>
                        <span className={`text-3xl font-black leading-none ${ratingColor(cycle.rating)}`}>{cycle.rating}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 mt-1">/10</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-600 font-medium">N/R</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
