import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FlaskConical, Search, ArrowRight } from 'lucide-react';
import { api } from '../hooks/api';

const CATEGORY_LABELS = {
  sarm: 'SARMs', prohormone: 'Prohormones', peptide: 'Peptides', serm: 'SERMs / PCT',
  ai: 'Aromatase Inhibitors', natural: 'Naturals', ancillary: 'Ancillaries', other: 'Other',
};

export default function CompoundsPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const { data: catData } = useQuery({
    queryKey: ['compound-categories'],
    queryFn: () => api.get('/api/compounds/categories'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['compounds', category, search],
    queryFn: () => api.get(`/api/compounds?${category ? `category=${category}&` : ''}${search ? `search=${search}` : ''}`),
  });

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="w-6 h-6 text-prohp-400" />
          <h1 className="text-xl font-extrabold tracking-tight">Compound Encyclopedia</h1>
        </div>
        <p className="text-sm text-slate-400">52+ compounds. Every one reviewed. Proof over hype.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search compounds..." className="prohp-input pl-9 text-xs" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCategory('')} className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-colors ${!category ? 'bg-prohp-500/15 text-prohp-400 border border-prohp-500/25' : 'text-slate-500 hover:text-slate-300 bg-slate-800/50'}`}>All</button>
          {catData?.categories?.map((c) => (
            <button key={c.category} onClick={() => setCategory(c.category)} className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-colors ${category === c.category ? 'bg-prohp-500/15 text-prohp-400 border border-prohp-500/25' : 'text-slate-500 hover:text-slate-300 bg-slate-800/50'}`}>
              {CATEGORY_LABELS[c.category] || c.category} <span className="text-slate-600 ml-0.5">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="prohp-card p-4 animate-pulse"><div className="h-4 bg-slate-800 rounded w-1/2 mb-2" /><div className="h-3 bg-slate-800 rounded w-3/4" /></div>
          ))
        ) : (
          data?.compounds?.map((c) => (
            <Link key={c.slug} to={`/compounds/${c.slug}`} className="prohp-card px-4 py-3 hover:bg-slate-800/40 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-200 group-hover:text-prohp-400 transition-colors">{c.name}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded risk-${c.risk_tier}`}>{c.risk_tier}</span>
                    <span className="text-[9px] font-semibold text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded">{CATEGORY_LABELS[c.category] || c.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.summary}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-prohp-400 transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))
        )}
        {!isLoading && data?.compounds?.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-500">No compounds match your search.</div>
        )}
      </div>

      <div className="text-center mt-6 text-xs text-slate-600">
        {data?.count || 0} compounds · Free access · Proof Over Hype
      </div>
    </div>
  );
}
