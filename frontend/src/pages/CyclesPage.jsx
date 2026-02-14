import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dumbbell, Activity, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../hooks/api';

const STATUS_CONFIG = {
  active: { icon: Activity, color: 'text-prohp-400', bg: 'bg-prohp-500/10', label: 'Active' },
  completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
  abandoned: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Abandoned' },
};

export default function CyclesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => api.get('/api/cycles'),
  });

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Dumbbell className="w-6 h-6 text-prohp-400" />
        <h1 className="text-xl font-extrabold tracking-tight">Cycle Logs</h1>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Real cycles. Real bloodwork. Real results. Drop your experience — that's how we learn.
      </p>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="prohp-card p-4 animate-pulse"><div className="h-4 bg-slate-800 rounded w-1/2 mb-2" /><div className="h-3 bg-slate-800 rounded w-3/4" /></div>
          ))
        ) : data?.cycles?.length === 0 ? (
          <div className="prohp-card p-8 text-center">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No cycle logs yet. Be the first to document your protocol.</p>
          </div>
        ) : (
          data?.cycles?.map((cycle) => {
            const sc = STATUS_CONFIG[cycle.status] || STATUS_CONFIG.active;
            const Icon = sc.icon;
            return (
              <div key={cycle.id} className="prohp-card px-4 py-3 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${sc.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${sc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-slate-200">{cycle.title}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      {cycle.is_featured && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Featured</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{cycle.username}</span>
                      {cycle.is_founding && <span className="tier-badge tier-founding text-[8px] py-0">FM</span>}
                      <span>{cycle.compound_name}</span>
                      {cycle.dose && <span>{cycle.dose}</span>}
                      {cycle.duration_weeks && <span>{cycle.duration_weeks}wk</span>}
                      <span>{cycle.update_count} updates</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
