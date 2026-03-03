import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dumbbell, Activity, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../hooks/api';
import CycleLogForm from '../components/CycleLogForm';
import useAuthStore from '../stores/auth';

const STATUS_CONFIG = {
  active: { icon: Activity, color: 'text-prohp-400', bg: 'bg-prohp-500/10', label: 'Active' },
  completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
  abandoned: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Abandoned' },
};

export default function CyclesPage() {
  const [showForm, setShowForm] = useState(false);
  const userTier = useAuthStore((x) => x.user?.tier);
  const isInner = userTier === 'inner_circle' || userTier === 'admin';

  const { data, isLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => api.get('/api/cycles'),
    enabled: isInner,
  });

  if (!isInner) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Dumbbell className="w-6 h-6 text-[#229DD8]" />
          <h1 className="text-xl font-extrabold tracking-tight text-white">Cycle Logs</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Log your cycle. Share your data. Help the next guy.</p>
        <div className="rounded-2xl border border-[#229DD8]/30 bg-[#0f1117] p-8 shadow-[0_14px_40px_rgba(0,0,0,0.35)] text-center">
          <Dumbbell className="w-10 h-10 text-[#229DD8] mx-auto mb-4" />
          <div className="text-white text-lg font-bold mb-2">Cycle Logs are Inner Circle only</div>
          <p className="text-sm text-slate-400 mb-5">Real protocols. Real bloodwork. Real mistakes. Posted by dudes actually under the bar.</p>
          <a href="/compounds" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#229DD8] to-[#1b87bc] px-6 py-3 text-sm font-bold text-white hover:from-[#1b87bc] hover:to-[#166e9c] transition-all shadow-lg">
            Join Inner Circle
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Dumbbell className="w-6 h-6 text-[#229DD8]" />
        <h1 className="text-xl font-extrabold tracking-tight text-white">Cycle Logs</h1>
      </div>
      <p className="text-sm text-slate-400 mb-6">Log your cycle. Share your data. Help the next guy.</p>

      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="mb-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#229DD8] to-[#1b87bc] px-6 py-3 text-sm font-bold text-white hover:from-[#1b87bc] hover:to-[#166e9c] transition-all shadow-lg hover:shadow-[#229DD8]/20">
          + Log Your Cycle
        </button>
      )}

      {showForm && (
        <div className="mb-8 animate-fade-in">
          <CycleLogForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="prohp-card p-5 animate-pulse border border-white/5">
              <div className="h-4 bg-slate-800 rounded w-1/2 mb-3" />
              <div className="h-3 bg-slate-800 rounded w-3/4" />
            </div>
          ))
        ) : (data?.cycles?.length ?? 0) === 0 ? (
          <div className="prohp-card p-10 text-center border border-white/5">
            <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-base text-slate-400 font-medium">No cycle logs yet. Be the first to drop your protocol.</p>
          </div>
        ) : (
          data?.cycles?.map((cycle) => {
            const sc = STATUS_CONFIG[String(cycle.status || 'active').toLowerCase()] || STATUS_CONFIG.active;
            const Icon = sc.icon;
            return (
              <Link to={`/cycles/${cycle.id}`} key={cycle.id} className="block prohp-card px-5 py-4 hover:bg-slate-800/40 hover:border-[#229DD8]/20 transition-all border border-white/5 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${sc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-base font-bold text-slate-200 truncate">{cycle.title}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${sc.bg} ${sc.color} shrink-0`}>{sc.label}</span>
                      {cycle.is_featured && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md shrink-0">Featured</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="text-[#229DD8]">{cycle.username}</span>
                      {cycle.is_founding && <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">FM</span>}
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-slate-300">{cycle.compound_name}</span>
                      {cycle.dose && (<><span className="w-1 h-1 rounded-full bg-slate-600" /><span>{cycle.dose}</span></>)}
                      {cycle.duration_weeks && (<><span className="w-1 h-1 rounded-full bg-slate-600" /><span>{cycle.duration_weeks} wk</span></>)}
                      {cycle.update_count > 0 && (<><span className="w-1 h-1 rounded-full bg-slate-600" /><span>{cycle.update_count} updates</span></>)}
                    </div>
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
