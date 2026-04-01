import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FlaskConical, Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../hooks/api';
import useAuthStore from '../stores/auth';
import EncyclopediaGate from '../components/EncyclopediaGate';

const CATEGORY_LABELS = {
  sarm: 'SARMs',
  prohormone: 'Prohormones',
  peptide: 'Peptides',
  serm: 'SERMs / PCT',
  ai: 'Aromatase Inhibitors',
  natural: 'Naturals',
  ancillary: 'Ancillaries',
  other: 'Other',
};

const RISK_COLORS = {
  low: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#10b981' },
  moderate: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.25)', text: '#eab308' },
  high: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '#ef4444' },
  extreme: { bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.3)', text: '#dc2626' },
};

/* Premium fallback: frosted flask SVG */
function FlaskFallback() {
  return (
    <svg viewBox="0 0 48 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-32 opacity-50">
      <path d="M18 4h12v20l14 32a4 4 0 01-3.6 5.7H7.6A4 4 0 014 56L18 24V4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"/>
      <rect x="16" y="0" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-slate-600"/>
      <path d="M14 44h20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-slate-700"/>
      <path d="M16 52h16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-slate-700"/>
    </svg>
  );
}

function CompoundTile({ compound }) {
  const c = compound;
  const RISK_COLORS = {
    low: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
    moderate: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#eab308' },
    high: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
    extreme: { bg: 'rgba(220,38,38,0.18)', border: 'rgba(220,38,38,0.35)', text: '#dc2626' },
  };
  const CATEGORY_LABELS = {
    sarm: 'SARMs', prohormone: 'Prohormones', peptide: 'Peptides',
    serm: 'SERMs / PCT', ai: 'Aromatase Inhibitors',
    natural: 'Naturals', ancillary: 'Ancillaries', other: 'Other',
  };
  const risk = RISK_COLORS[c.risk_tier] || RISK_COLORS.moderate;
  const benefitText = (c.best_for || '').length > 80 ? (c.best_for || '').slice(0, 80).replace(/,\s*$/, '') + '...' : (c.best_for || '');

  return (
    <Link to={`/compounds/${c.slug}`} className="group block h-full" style={{ textDecoration: 'none' }}>
      <div
        className="bg-slate-900/80 border border-white/[0.05] rounded-xl flex flex-col overflow-hidden h-full
                   transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[rgba(34,157,216,0.3)]"
        style={{ boxShadow: 'none' }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(34,157,216,0.12)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* THE STAGE - bottle commands the card */}
        <div className="w-full flex items-center justify-center relative pt-4 pb-2"
             style={{ aspectRatio: '1/1', background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)' }}>
          <img
            src={`/images/compounds/${c.slug}.png`}
            alt={c.name}
            className="object-contain transition-transform duration-500 group-hover:scale-110"
            style={{ height: '140px', maxWidth: '95%', filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.7))' }}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="items-center justify-center hidden" style={{ width: '60%' }}>
            <svg viewBox="0 0 48 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', opacity: 0.5 }}>
              <path d="M18 4h12v20l14 32a4 4 0 01-3.6 5.7H7.6A4 4 0 014 56L18 24V4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"/>
              <rect x="16" y="0" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-slate-500"/>
              <path d="M14 44h20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-slate-600"/>
              <path d="M16 52h16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-slate-600"/>
            </svg>
          </div>
        </div>

        {/* THE DATA CONSOLE */}
        <div className="px-3 pb-3 flex flex-col items-center text-center flex-1">
          <h3 className="text-sm font-bold text-slate-100 tracking-tight leading-none mb-2 group-hover:text-prohp-400 transition-colors">
            {c.name}
          </h3>

          <div className="flex gap-1.5 justify-center flex-wrap mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ background: risk.bg, border: `0.5px solid ${risk.border}`, color: risk.text }}>
              {c.risk_tier}
            </span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/60 border border-white/[0.08] text-slate-400">
              {CATEGORY_LABELS[c.category] || c.category}
            </span>
          </div>

          {benefitText && (
            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-auto">
              {benefitText}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

  );
}

export default function CompoundsPage() {
  const { user, hasLeadAccess, setHasLeadAccess, checkLeadAccess } = useAuthStore();
  const [gateChecked, setGateChecked] = useState(false);
  useEffect(() => {
    checkLeadAccess().finally(() => setGateChecked(true));
  }, [checkLeadAccess]);

  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [riskFilter, setRiskFilter] = useState('');

  const { data: catData } = useQuery({
    queryKey: ['compound-categories'],
    queryFn: () => api.get('/api/compounds/categories'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['compounds', category, search, sort],
    queryFn: () => {
      const params = [];
      if (category) params.push('category=' + encodeURIComponent(category));
      if (search) params.push('search=' + encodeURIComponent(search));
      if (sort === 'risk') { params.push('sort=risk'); params.push('dir=desc'); }
      else if (sort === 'name_asc') { params.push('sort=name'); params.push('dir=asc'); }
      else if (sort === 'category') { params.push('sort=category'); params.push('dir=asc'); }
      const qs = params.length ? '?' + params.join('&') : '';
      const sep = qs ? '&' : '?';
      return api.get('/api/compounds' + qs + sep + 'limit=200');
    },
  });

  const compounds = (data?.compounds || []).filter(c => {
    if (riskFilter && c.risk_tier !== riskFilter) return false;
    return true;
  });

  if (!gateChecked) return null;
  if (!user && !hasLeadAccess) {
    return <EncyclopediaGate onUnlock={() => setHasLeadAccess(true)} />;
  }

  const activeFilterCount = (riskFilter ? 1 : 0);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <FlaskConical className="w-5 h-5 text-prohp-400" />
          <h1 className="text-lg font-extrabold tracking-tight">Compound Encyclopedia</h1>
        </div>
        <p className="text-xs text-slate-500">105 compounds. Every one reviewed. Proof over hype.</p>
      </div>

      {/* Control Bar */}
      <div className="flex gap-2 mb-3 flex-nowrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search compounds..."
            className="w-full bg-slate-900/60 border border-white/[0.06] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-prohp-500/30 transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-slate-900/60 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-prohp-500/30"
        >
          <option value="">Most popular</option>
          <option value="risk">Risk (high first)</option>
          <option value="name_asc">A-Z</option>
          <option value="category">Category</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap ${
            activeFilterCount > 0
              ? 'bg-prohp-500/10 border border-prohp-500/25 text-prohp-400'
              : 'bg-slate-900/60 border border-white/[0.06] text-slate-400 hover:text-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex gap-2 mb-3 items-center">
          {riskFilter && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-prohp-500/10 border border-prohp-500/20 text-prohp-400">
              Risk: {riskFilter}
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setRiskFilter('')} />
            </span>
          )}
          <button onClick={() => setRiskFilter('')} className="text-[10px] text-slate-600 hover:text-slate-300">Clear all</button>
        </div>
      )}

      {/* Filter drawer */}
      {showFilters && (
        <div className="mb-4 p-4 rounded-xl bg-slate-900/90 border border-white/[0.06] backdrop-blur-sm animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-300">Advanced filters</span>
            <X className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" onClick={() => setShowFilters(false)} />
          </div>
          <div className="mb-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Risk level</span>
            <div className="flex gap-1.5 flex-wrap">
              {['low', 'moderate', 'high', 'extreme'].map(r => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(riskFilter === r ? '' : r)}
                  className={`text-[11px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors ${
                    riskFilter === r
                      ? 'bg-prohp-500/15 text-prohp-400 border border-prohp-500/25'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800/50 border border-white/[0.06]'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowFilters(false)}
            className="w-full py-2 rounded-lg text-xs font-semibold bg-prohp-500/15 text-prohp-400 border border-prohp-500/25 hover:bg-prohp-500/25 transition-colors mt-1"
          >
            Apply filters
          </button>
        </div>
      )}

      {/* Category pills - visible, clickable */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 flex-nowrap scrollbar-hide snap-x">
        <button
          onClick={() => setCategory('')}
          className={`text-[11px] font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
            !category
              ? 'bg-prohp-500/15 text-prohp-400 border border-prohp-500/25'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 border border-white/[0.06]'
          }`}
        >
          All
        </button>
        {catData?.categories?.map((c) => (
          <button
            key={c.category}
            onClick={() => setCategory(c.category)}
            className={`text-[11px] font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
              category === c.category
                ? 'bg-prohp-500/15 text-prohp-400 border border-prohp-500/25'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 border border-white/[0.06]'
            }`}
          >
            {CATEGORY_LABELS[c.category] || c.category}{' '}
            <span className="text-slate-600 ml-0.5">{c.count}</span>
          </button>
        ))}
      </div>

      {/* Tile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-slate-900/80 border border-white/[0.05] rounded-xl px-3 py-4 animate-pulse flex flex-col items-center">
              <div className="w-24 h-28 bg-slate-800/50 rounded-lg mb-2" />
              <div className="h-3.5 bg-slate-800 rounded w-2/3 mb-1.5" />
              <div className="h-2.5 bg-slate-800/50 rounded w-4/5 mb-2" />
              <div className="flex gap-1 mt-auto">
                <div className="h-3.5 bg-slate-800 rounded-full w-12" />
                <div className="h-3.5 bg-slate-800 rounded-full w-16" />
              </div>
            </div>
          ))
        ) : (
          compounds.map((c) => <CompoundTile key={c.slug} compound={c} />)
        )}
        {!isLoading && compounds.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-slate-500">
            No compounds match your search.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-6 mb-4 text-[11px] text-slate-600">
        {compounds.length} compounds &middot; Proof Over Hype
      </div>
    </div>
  );
}
