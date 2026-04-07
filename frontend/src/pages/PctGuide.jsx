import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// === HPTA RECOVERY DATA ===
function genCurve(startT, protocol) {
  const baseline = 650;
  const pts = [];
  for (let w = 0; w <= 8; w++) {
    let t;
    if (protocol === 'none') {
      t = startT + (baseline * 0.5 - startT) * (w / 8) * 0.9;
    } else if (protocol === 'otc') {
      const pct = w / 7;
      t = startT + (baseline - startT) * (pct < 1 ? pct * pct * 0.5 + pct * 0.5 : 1);
    } else {
      const peak = baseline * 1.15;
      if (w <= 3) t = startT + (peak - startT) * (w / 3);
      else if (w <= 5) t = peak - (peak - baseline) * ((w - 3) / 2);
      else t = baseline;
    }
    pts.push({ week: w, testosterone: Math.round(Math.min(t, 1000)) });
  }
  return pts;
}

const statusMap = {
  'none': { label: 'Prolonged Suppression', color: 'text-red-400', recovery: '12+ Weeks', badge: 'bg-red-500/10 border-red-500/20 text-red-400' },
  'otc': { label: 'Stable Recovery Path', color: 'text-amber-400', recovery: '6-7 Weeks', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  'serm': { label: 'Rapid HPTA Restoration', color: 'text-emerald-400', recovery: '3-4 Weeks', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
};

const lineColors = { 'none': '#ef4444', 'otc': '#f59e0b', 'serm': '#10b981' };

// === COMPOUND DATABASE ===
const allCompounds = [
  { name: '1-Andro (1-DHEA)', slug: null, cat: 'prohormone', pct: 'full', notes: 'Converts to 1-testosterone. Suppressive. Full PCT required.' },
  { name: '4-Andro (4-DHEA)', slug: null, cat: 'prohormone', pct: 'full', notes: 'Converts to testosterone. Wet compound. Aromatizes. Full PCT + AI on hand.' },
  { name: 'Andriol', slug: 'andriol', cat: 'prohormone', pct: 'depends', notes: 'Hi-Tech 1-DHEA based. Mild to moderate suppression. Bloodwork may show no full PCT needed at lower doses. Get labs.' },
  { name: 'Decabolin', slug: 'decabolin', cat: 'prohormone', pct: 'full', notes: 'Hi-Tech 19-NorDHEA. Nandrolone precursor. Suppressive. Can linger. Full PCT required. Allow extra recovery time.' },
  { name: 'Superdrol', slug: 'superdrol', cat: 'prohormone', pct: 'full', notes: 'Highly suppressive prohormone. Aggressive PCT mandatory. Liver support critical (NAC + TUDCA).' },
  { name: 'Epiandro', slug: null, cat: 'prohormone', pct: 'mini', notes: 'DHT derivative. Mild suppression. Mini PCT or OTC test booster usually sufficient. Get bloodwork.' },
  { name: 'Halodrol', slug: 'halodrol', cat: 'prohormone', pct: 'full', notes: 'Banned. If legacy supply: full PCT mandatory.' },
  { name: 'M1T', slug: null, cat: 'prohormone', pct: 'full', notes: 'Banned. Most suppressive prohormone. Aggressive PCT + extended recovery.' },
  { name: 'Trenabol', slug: 'trenabol', cat: 'prohormone', pct: 'full', notes: 'Hi-Tech 19-NorDHEA based. Suppressive. Full PCT. Similar to Decabolin recovery.' },
  { name: 'RAD-140 (Testolone)', slug: null, cat: 'sarm', pct: 'full', notes: 'Most suppressive SARM. Full PCT required. Hi-Tech version is the legal product.' },
  { name: 'LGD-4033 (Ligandrol)', slug: null, cat: 'sarm', pct: 'full', notes: 'Significant suppression at standard doses. Full PCT.' },
  { name: 'AC-262', slug: 'ac-262', cat: 'sarm', pct: 'mini', notes: 'Partial agonist. 66% anabolic, 27% androgenic. Mild suppression. Bloodwork at 10mg: only 50-point testosterone drop.' },
  { name: 'Ostarine (MK-2866)', slug: null, cat: 'sarm', pct: 'depends', notes: 'Mildest SARM. At 10-15mg/8wk some bloodwork shows no suppression. At 25mg+ mini PCT recommended. Get labs.' },
  { name: 'S-23', slug: null, cat: 'sarm', pct: 'full', notes: 'Extremely suppressive. Near-steroid level. Full PCT mandatory. Not for beginners.' },
  { name: 'YK-11', slug: 'yk-11', cat: 'sarm', pct: 'full', notes: 'Myostatin inhibitor + androgen. Highly suppressive. Full PCT.' },
  { name: 'MK-677 (Ibutamoren)', slug: 'mk-677', cat: 'other', pct: 'none', notes: 'GH secretagogue. Does not touch the HPTA axis. No suppression. No PCT needed.' },
  { name: 'GW-501516 (Cardarine)', slug: null, cat: 'other', pct: 'none', notes: 'PPAR agonist. Not hormonal. No suppression. No PCT needed.' },
  { name: 'BPC-157', slug: 'bpc-157', cat: 'peptide', pct: 'none', notes: 'Healing peptide. No hormonal activity. No PCT needed.' },
  { name: 'IGF-1 LR3', slug: 'igf-1-lr3', cat: 'peptide', pct: 'none', notes: 'Growth factor peptide. GH pathway. Does not suppress testosterone.' },
  { name: 'Pro IGF-1', slug: 'pro-igf-1', cat: 'peptide', pct: 'none', notes: 'Hi-Tech deer antler velvet product. GH pathway. Not hormonal.' },
  { name: 'CJC-1295', slug: 'cjc-1295', cat: 'peptide', pct: 'none', notes: 'GHRH peptide. Stimulates GH release. No testosterone suppression.' },
  { name: 'Ipamorelin', slug: 'ipamorelin', cat: 'peptide', pct: 'none', notes: 'GHRP peptide. GH pathway only. No PCT needed.' },
  { name: 'Laxogenin', slug: 'laxogenin', cat: 'natural', pct: 'none', notes: 'Plant steroid. Does not bind androgen receptor. No suppression.' },
  { name: 'Turkesterone', slug: 'turkesterone', cat: 'natural', pct: 'none', notes: 'Ecdysteroid. Non-hormonal. No suppression.' },
  { name: 'Tongkat Ali', slug: 'tongkat-ali', cat: 'natural', pct: 'none', notes: 'Natural test support. Actually helps recovery. Often used during PCT.' },
];

const pctBadge = { full: { label: 'FULL PCT', cls: 'text-red-400 bg-red-500/10 border border-red-500/20' }, mini: { label: 'MINI / OTC', cls: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' }, depends: { label: 'DEPENDS', cls: 'text-[#229DD8] bg-[#229DD8]/10 border border-[#229DD8]/20' }, none: { label: 'NO PCT', cls: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' } };

const protocols = [
  { name: 'Enclomiphene', dose: '12.5-25mg/day', duration: '4-6 weeks', tag: 'Gold Standard', notes: 'Stimulates LH/FSH directly. Cleaner isomer of Clomid without the emotional sides. Under doctor supervision.' },
  { name: 'Nolvadex (Tamoxifen)', dose: '20-40mg/day taper', duration: '4 weeks', tag: 'Proven SERM', notes: 'Blocks estrogen at the receptor. Works well but can cause mood sides in some users.' },
  { name: 'Clomid (Clomiphene)', dose: '25-50mg/day', duration: '4 weeks', tag: 'Potent', notes: 'Higher side effect profile. The emotional sides are real. Enclomiphene is the cleaner option.' },
  { name: 'Gorilla Mode Sigma', dose: '4 pills/day', duration: '4-8 weeks', tag: 'OTC Option', notes: 'For mini cycles or those without SERM access. Travis and Vigorous Steve both saw testosterone nearly double.' },
];

const otcProducts = [
  { name: 'Post Gear (5% Nutrition)', price: '$54.99', verdict: 'Best All-in-One', notes: 'Hits all 5 PCT categories. Longjack 300mg (proven), Brassopsis 500mg (prescription AI level), stinging nettle, milk thistle. 14 ingredients.' },
  { name: 'Arimiplex (Hi-Tech)', price: '$49.99', verdict: 'Best for Stacks', notes: '11 ingredients. Arimistane 37.5mg. Good DHT blocker + liver support. Pair with Tongkat Ali ($20) for complete coverage.' },
  { name: 'PCTV (Blackstone Labs)', price: '$44.99', verdict: 'Budget', notes: '5 ingredients. Tribulus (inconclusive) + Arimistane. No DHT blocker. Cheapest but least comprehensive.' },
];

const signs = [
  { icon: '⚠️', label: 'Lethargy & Fatigue', desc: 'Persists after cycle ends' },
  { icon: '📉', label: 'Loss of Libido', desc: 'Sexual function changes' },
  { icon: '😤', label: 'Mood Swings', desc: 'Irritability, depression' },
  { icon: '💪', label: 'Strength Loss', desc: 'Beyond normal deload' },
  { icon: '🦴', label: 'Joint Pain', desc: 'Estrogen crash indicator' },
  { icon: '🍔', label: 'Cortisol Cravings', desc: 'Hunger spike post-cycle' },
];

const fiveCats = [
  { n: 'Test Booster', d: 'Stimulate natural testosterone back to baseline' },
  { n: 'Anti-Estrogen', d: 'Block or reduce estrogen while test recovers' },
  { n: 'DHT Blocker', d: 'Protect against androgenic sides during recovery' },
  { n: 'Liver Support', d: 'NAC, Milk Thistle, TUDCA for methylated compounds' },
  { n: 'Prostate Support', d: 'Saw Palmetto, Stinging Nettle' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-slate-500 mb-1">Week {label}</p>
      <p className="text-sm font-bold" style={{ color: payload[0]?.stroke || '#f59e0b' }}>{payload[0]?.value} ng/dL</p>
    </div>
  );
};

export default function PctGuide() {
  const [suppression, setSuppression] = useState('heavy');
  const [protocol, setProtocol] = useState('otc');
  const [search, setSearch] = useState('');
  const [filterPct, setFilterPct] = useState('all');

  const startT = suppression === 'mild' ? 300 : 100;
  const chartData = useMemo(() => genCurve(startT, protocol), [startT, protocol]);
  const status = statusMap[protocol];
  const color = lineColors[protocol];

  const filtered = useMemo(() => {
    let list = allCompounds;
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (filterPct !== 'all') list = list.filter(c => c.pct === filterPct);
    return list;
  }, [search, filterPct]);

  const btnCls = (active) => `px-4 py-2 rounded-lg text-xs font-bold transition-all ${active ? 'bg-[#229DD8] text-white shadow-lg shadow-[#229DD8]/30' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-white/5'}`;
  const filterBtn = (val, label) => <button key={val} onClick={() => setFilterPct(val)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterPct === val ? 'bg-[#229DD8] text-white' : 'bg-slate-800/50 text-slate-500 hover:text-white border border-white/5'}`}>{label}</button>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-emerald-500/15 p-6 sm:p-8 mb-6 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Post Cycle Therapy (PCT)</h1>
            <p className="text-sm text-slate-400">The protocol that protects your gains and your health.</p>
          </div>
        </div>
        <p className="text-base text-slate-300 leading-relaxed">When you take a prohormone, your body slows natural testosterone production. When the cycle ends, androgens leave but production does not snap back. Your LH is weakened, testosterone is low, estrogen stays high. PCT fixes this.</p>
      </div>

      {/* === HPTA RECOVERY SIMULATOR === */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-extrabold text-white">HPTA Recovery Simulator</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${status.badge}`}>STATUS: {status.label}</span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5">EST: {status.recovery}</span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5">BASELINE: 650 ng/dL</span>
          </div>
        </div>

        <div className="h-64 sm:h-72 mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => v} label={{ value: 'Weeks Post-Cycle', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 1000]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => v} label={{ value: 'Testosterone (ng/dL)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={650} stroke="#94a3b8" strokeDasharray="6 4" label={{ value: 'Baseline', position: 'right', fontSize: 10, fill: '#94a3b8' }} />
              <Area type="monotone" dataKey="testosterone" stroke={color} strokeWidth={2.5} fill="url(#pctGrad)" dot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#0f172a' }} activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#0f172a' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Suppression</span>
            <button onClick={() => setSuppression('mild')} className={btnCls(suppression === 'mild')}>Mild</button>
            <button onClick={() => setSuppression('heavy')} className={btnCls(suppression === 'heavy')}>Heavy</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">PCT Protocol</span>
            <button onClick={() => setProtocol('none')} className={btnCls(protocol === 'none')}>None</button>
            <button onClick={() => setProtocol('otc')} className={btnCls(protocol === 'otc')}>OTC PCT</button>
            <button onClick={() => setProtocol('serm')} className={btnCls(protocol === 'serm')}>SERM</button>
          </div>
        </div>
      </div>

      {/* PCT Video */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-4 sm:p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="#fff" points="9.545 15.568 15.818 12 9.545 8.432"/></svg>
          <span className="text-xs font-bold text-white">PCT Explained</span>
          <a href="https://youtu.be/1js19YiC7lU" target="_blank" rel="noopener noreferrer" className="ml-auto text-[11px] text-slate-500 hover:text-[#229DD8] transition-colors">Watch on YouTube</a>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden border border-white/5">
          <iframe src="https://www.youtube-nocookie.com/embed/1js19YiC7lU?rel=0&modestbranding=1" title="PCT Explained" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
        </div>
      </div>

      {/* Signs of Suppression — Diagnostic Chips */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Signs of Suppression</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {signs.map((s, i) => (
            <div key={i} className="bg-slate-950/60 rounded-lg border border-amber-500/10 p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="text-xs font-bold text-white">{s.label}</p>
              <p className="text-[10px] text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5 PCT Categories */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">The 5 PCT Categories</h2>
        <p className="text-xs text-slate-500 mb-3">A complete PCT covers all five. Most OTC products miss at least one.</p>
        <div className="space-y-2">
          {fiveCats.map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-md bg-[#229DD8]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[#229DD8] text-xs font-bold">{i+1}</span></span>
              <div><p className="text-sm text-white font-medium">{c.n}</p><p className="text-xs text-slate-400">{c.d}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* === COMPOUND PROTOCOL DATABASE === */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Compound Protocol Database</h2>
        <p className="text-xs text-slate-500 mb-4">Search your compound for exact PCT requirements.</p>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search compounds..." className="w-full rounded-lg border border-slate-700/50 bg-slate-950/50 py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all mb-3" />
        <div className="flex flex-wrap gap-1.5 mb-4">
          {filterBtn('all', 'All')}
          {filterBtn('full', '🔴 Full PCT')}
          {filterBtn('mini', '🟡 Mini / OTC')}
          {filterBtn('depends', '🔵 Depends')}
          {filterBtn('none', '🟢 No PCT')}
        </div>
        <div className="space-y-1.5">
          {filtered.map((c, i) => {
            const b = pctBadge[c.pct];
            const CompName = c.slug
              ? <Link to={'/compounds/' + c.slug} className="text-sm font-bold text-[#229DD8] hover:text-white transition-colors underline decoration-[#229DD8]/30 hover:decoration-white/50 underline-offset-2">{c.name}</Link>
              : <span className="text-sm font-bold text-slate-300">{c.name}</span>;
            return (
              <div key={i} className="bg-slate-950/50 rounded-lg p-3 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="shrink-0 min-w-[170px]">{CompName}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${b.cls}`}>{b.label}</span>
                <span className="text-xs text-slate-400 flex-1">{c.notes}</span>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No compounds match your search.</p>}
        </div>
      </div>

      {/* === THE ARMORY: SERMs === */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">The Armory: PCT Protocols</h2>
        <p className="text-xs text-slate-500 mb-4">Under doctor supervision. Get bloodwork first.</p>
        <div className="space-y-3">
          {protocols.map((p, i) => (
            <div key={i} className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white">{p.name}</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{p.tag}</span>
                </div>
                <p className="text-xs text-slate-400">{p.notes}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[#229DD8] bg-[#229DD8]/10 px-3 py-1.5 rounded-lg border border-[#229DD8]/20">{p.dose}</span>
                <span className="text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5">{p.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === OTC PRODUCT COMPARISON === */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/15 p-5 mb-6 shadow-lg shadow-amber-500/5">
        <h2 className="text-lg font-bold text-white mb-1">OTC PCT Showdown</h2>
        <p className="text-xs text-slate-500 mb-4">Tested against the 5 PCT categories. Based on ingredient analysis + real bloodwork.</p>
        <div className="space-y-3">
          {otcProducts.map((p, i) => (
            <div key={i} className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-1">{p.name}</h3>
                <p className="text-xs text-slate-400">{p.notes}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">{p.price}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">{p.verdict}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === KEEPING GAINS === */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Keeping Your Gains Post-Cycle</h2>
        <div className="space-y-3">
          {[
            ['Eat at a surplus', '2-500 extra calories. Food is anabolic. Your appetite will spike from cortisol. Use it.'],
            ['Stick to the workout schedule', 'Maintain 75% of on-cycle lifting intensity. This is not the time to skip days.'],
            ['Restore testosterone ASAP', 'SERM or OTC test booster. The faster LH recovers, the more muscle you keep.'],
            ['Keep your head on straight', 'Motivation dips. Strength drops. Accept looking softer. Focus on the 100%, not the extra 20%.'],
            ['Best case: keep 70-80%', 'Of both strength and size. Composition looks different. Flatter, softer. Normal. Years of cycling creates permanent hyperplasia.'],
          ].map(([t, d], i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-md bg-[#229DD8]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[#229DD8] text-xs font-bold">{i+1}</span></span>
              <div><p className="text-sm text-white font-medium">{t}</p><p className="text-xs text-slate-400">{d}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* === THE RULE === */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 mb-6 text-center">
        <p className="text-base font-bold text-white mb-2">The Rule</p>
        <p className="text-sm text-slate-300 mb-4">Get bloodwork before your cycle. Get bloodwork 4 weeks after PCT ends. Compare the numbers. That is the only way to know if recovery is complete.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/compounds" className="inline-flex items-center justify-center bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] text-white font-bold text-sm rounded-xl px-6 py-3 transition-all shadow-lg shadow-[#229DD8]/20">Browse Encyclopedia</Link>
          <Link to="/cycles" className="inline-flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium text-sm rounded-xl px-6 py-3 transition-all border border-white/10">View Cycle Logs</Link>
          <Link to="/consultation" className="inline-flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium text-sm rounded-xl px-6 py-3 transition-all border border-amber-500/20">Book Consultation</Link>
        </div>
      </div>

      {/* IC CTA */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/15 p-6 mb-6 text-center shadow-lg shadow-amber-500/5">
        <h3 className="text-lg font-bold text-white mb-2">See the Receipts</h3>
        <p className="text-sm text-slate-400 mb-4">Theory is great. Bloodwork is undeniable. Join the Inner Circle to view actual post-cycle lab results and recovery timelines.</p>
        <Link to="/register" className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl px-8 py-3 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">Join Inner Circle | $19/mo</Link>
      </div>

      <p className="text-[10px] text-slate-600 text-center mb-8">Skepticism without data is fear. Skepticism with data is power.</p>
    </div>
  );
}
