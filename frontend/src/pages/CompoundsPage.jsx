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
  low: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#10b981' },
  moderate: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)', text: '#eab308' },
  high: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: '#ef4444' },
  extreme: { bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.25)', text: '#dc2626' },
};

function CompoundTile({ compound }) {
  const c = compound;
  const risk = RISK_COLORS[c.risk_tier] || RISK_COLORS.moderate;
  const benefits = c.best_for || c.benefits || '';
  const benefitText = benefits.length > 80 ? benefits.slice(0, 80).replace(/,\s*$/, '') + '...' : benefits;

  return (
    <Link
      to={`/compounds/${c.slug}`}
      className="group block"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="bg-slate-900/80 border border-white/[0.05] rounded-xl p-4 pt-5 text-center transition-all duration-200 h-full
                   hover:-translate-y-0.5 hover:border-prohp-500/20"
        style={{ boxShadow: 'none' }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,157,216,0.06)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* Bottle Image */}
        <div className="w-20 h-24 mx-auto mb-3 rounded-lg flex items-center justify-center"
             style={{ background: `radial-gradient(ellipse at center, ${risk.bg}, transparent 70%)` }}>
          <img
            src={`/images/compounds/${c.slug}.png`}
            alt={c.name}
            className="max-h-20 max-w-16 object-contain drop-shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
            }}
          />
          <div className="w-9 h-16 rounded bg-gradient-to-b from-slate-700 to-slate-900 border border-white/10 items-center justify-center text-[10px] font-bold text-slate-500 hidden">
            {c.name?.charAt(0) || '?'}
          </div>
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-slate-100 mb-2 group-hover:text-prohp-400 transition-colors leading-tight">
          {c.name}
        </h3>

        {/* Badges */}
        <div className="flex gap-1 justify-center flex-wrap mb-2.5">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: risk.bg, border: `0.5px solid ${risk.border}`, color: risk.text }}
          >
            Risk: {c.risk_tier}
          </span>
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-prohp-500/8 border border-prohp-500/15 text-prohp-400">
            {CATEGORY_LABELS[c.category] || c.category}
          </span>
          {c.legal_status === 'banned' && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              Banned
            </span>
          )}
        </div>

        {/* Benefit text */}
        {benefitText && (
          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
            {benefitText}
          </p>
        )}
      </div>
    </Link>
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

  // Client-side risk filter
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
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <FlaskConical className="w-5 h-5 text-prohp-400" />
          <h1 className="text-lg font-extrabold tracking-tight">Compound Encyclopedia</h1>
        </div>
        <p className="text-xs text-slate-400">105 compounds. Every one reviewed. Proof over hype.</p>
      </div>

      {/* Control Bar - single row */}
      <div className="flex gap-2 mb-3 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search compounds..."
            className="w-full bg-slate-900/60 border border-white/[0.06] rounded-lg pl-8 pr-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-prohp-500/30 transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-slate-900/60 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-prohp-500/30"
        >
          <option value="">Most popular</option>
          <option value="risk">Risk (high first)</option>
          <option value="name_asc">A-Z</option>
          <option value="category">Category</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors ${
            activeFilterCount > 0
              ? 'bg-prohp-500/10 border border-prohp-500/25 text-prohp-400'
              : 'bg-slate-900/60 border border-white/[0.06] text-slate-400 hover:text-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
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
          <button onClick={() => setRiskFilter('')} className="text-[10px] text-slate-500 hover:text-slate-300">
            Clear all
          </button>
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
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    riskFilter === r
                      ? 'bg-prohp-500/15 text-prohp-400 border border-prohp-500/25'
                      : 'text-slate-500 hover:text-slate-300 bg-slate-800/50 border border-white/[0.04]'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowFilters(false)}
            className="w-full py-2 rounded-lg text-xs font-semibold bg-prohp-500/15 text-prohp-400 border border-prohp-500/25 hover:bg-prohp-500/25 transition-colors"
          >
            Apply filters
          </button>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap mb-5 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory('')}
          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
            !category
              ? 'bg-prohp-500/15 text-prohp-400 border border-prohp-500/25'
              : 'text-slate-500 hover:text-slate-300 bg-slate-800/50 border border-white/[0.04]'
          }`}
        >
          All
        </button>
        {catData?.categories?.map((c) => (
          <button
            key={c.category}
            onClick={() => setCategory(c.category)}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
              category === c.category
                ? 'bg-prohp-500/15 text-prohp-400 border border-prohp-500/25'
                : 'text-slate-500 hover:text-slate-300 bg-slate-800/50 border border-white/[0.04]'
            }`}
          >
            {CATEGORY_LABELS[c.category] || c.category}{' '}
            <span className="text-slate-600 ml-0.5">{c.count}</span>
          </button>
        ))}
      </div>

      {/* Tile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-slate-900/80 border border-white/[0.05] rounded-xl p-4 pt-5 animate-pulse">
              <div className="w-20 h-24 mx-auto mb-3 bg-slate-800 rounded-lg" />
              <div className="h-4 bg-slate-800 rounded w-2/3 mx-auto mb-2" />
              <div className="flex gap-1 justify-center mb-2">
                <div className="h-4 bg-slate-800 rounded-full w-16" />
                <div className="h-4 bg-slate-800 rounded-full w-20" />
              </div>
              <div className="h-3 bg-slate-800 rounded w-3/4 mx-auto" />
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
      <div className="text-center mt-8 mb-4 text-xs text-slate-600">
        {compounds.length} compounds {'\u00B7'} Proof Over Hype
      </div>
    </div>
  );
}
