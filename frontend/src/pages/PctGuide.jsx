import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function genCurve(startT, protocol) {
  const baseline = 650;
  const pts = [];
  for (let w = 0; w <= 8; w++) {
    let t;
    if (protocol === 'none') { t = startT + (baseline * 0.5 - startT) * (w / 8) * 0.9; }
    else if (protocol === 'otc') { const p = w / 7; t = startT + (baseline - startT) * (p < 1 ? p * p * 0.5 + p * 0.5 : 1); }
    else { const peak = baseline * 1.15; if (w <= 3) t = startT + (peak - startT) * (w / 3); else if (w <= 5) t = peak - (peak - baseline) * ((w - 3) / 2); else t = baseline; }
    pts.push({ week: w, testosterone: Math.round(Math.min(t, 1000)) });
  }
  return pts;
}

const statusMap = {
  'none': { label: 'Prolonged Suppression', recovery: '12+ Weeks', badge: 'bg-red-500/10 border-red-500/20 text-red-400' },
  'otc': { label: 'Stable Recovery Path', recovery: '6-7 Weeks', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  'serm': { label: 'Rapid HPTA Restoration', recovery: '3-4 Weeks', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
};
const lineColors = { 'none': '#ef4444', 'otc': '#f59e0b', 'serm': '#10b981' };

const compounds = [
  { name: 'Andriol', slug: 'andriol', cat: 'Prohormone', pct: 'otc', notes: 'Hi-Tech 1-DHEA based. Converts to testosterone. OTC PCT (Arimiplex) typically sufficient. Get bloodwork to confirm.' },
  { name: 'Hi-Tech Decadurabolin', slug: 'decabolin', cat: 'Prohormone', pct: 'otc', notes: 'Hi-Tech 19-NorDHEA. Nandrolone precursor. Can linger. OTC PCT recommended. Allow extra recovery time.' },
  { name: 'Halodrol', slug: 'halodrol', cat: 'Prohormone', pct: 'otc', notes: 'Active prohormone. OTC PCT (Arimiplex) typically sufficient for most users.' },
  { name: 'Trenabol', slug: 'trenabol', cat: 'Prohormone', pct: 'otc', notes: 'Hi-Tech 19-NorDHEA based. Suppressive. OTC PCT (Arimiplex) sufficient for recovery.' },
  { name: 'M1T (Methyl-1-Testosterone)', slug: 'm1t-methyl-1-testosterone', cat: 'Prohormone', pct: 'serm', notes: 'Banned. Old school. Most suppressive prohormone ever made. SERM (Enclomiphene) required. Not OTC recoverable.' },
  { name: 'Superdrol (Methasterone)', slug: 'superdrol', cat: 'Prohormone', pct: 'serm', notes: 'Banned. One of the most toxic and highly suppressive designer steroids ever produced. Aggressive SERM protocol mandatory. Liver support critical.' },
  { name: 'RAD-140 (Testolone)', slug: 'rad-140-testolone', cat: 'SARM', pct: 'full', notes: 'Most suppressive SARM. Full PCT required. Hi-Tech version is the legal product.' },
  { name: 'LGD-4033 (Ligandrol)', slug: 'lgd-4033-ligandrol', cat: 'SARM', pct: 'full', notes: 'Significant suppression at standard doses. Full PCT required.' },
  { name: 'AC-262', slug: 'ac-262', cat: 'SARM', pct: 'otc', notes: 'Partial agonist. 66% anabolic, 27% androgenic. Mild suppression. OTC PCT (Arimiplex) sufficient for most.' },
  { name: 'Ostarine (MK-2866)', slug: 'ostarine-mk-2866', cat: 'SARM', pct: 'full', notes: 'Full PCT required. At just 5mg, bloodwork has shown suppression and reported depression. Do not underestimate this compound.' },
  { name: 'S-23', slug: 's-23', cat: 'SARM', pct: 'serm', notes: 'Extremely suppressive. Developed as a potential male contraceptive. Near-steroid level shutdown. Do not attempt to recover with OTC products. SERM required.' },
  { name: 'YK-11', slug: 'yk-11', cat: 'SARM', pct: 'full', notes: 'Myostatin inhibitor + androgen. Highly suppressive. Full PCT required.' },
  { name: 'MK-677 (Ibutamoren)', slug: 'mk-677', cat: 'GH Secretagogue', pct: 'none', notes: 'GH secretagogue. Does not touch the HPTA axis. No suppression. No PCT needed.' },
  { name: 'GW-501516 (Cardarine)', slug: 'gw-501516-cardarine', cat: 'Other', pct: 'none', notes: 'PPAR agonist. Not hormonal. No suppression. No PCT needed.' },
  { name: 'BPC-157', slug: 'bpc-157', cat: 'Peptide', pct: 'none', notes: 'Healing peptide. No hormonal activity. No PCT needed.' },
  { name: 'IGF-1 LR3', slug: 'igf-1-lr3', cat: 'Peptide', pct: 'none', notes: 'Growth factor peptide. GH pathway. Does not suppress testosterone.' },
  { name: 'Pro IGF-1', slug: 'pro-igf-1', cat: 'Peptide', pct: 'none', notes: 'Hi-Tech deer antler velvet product. GH pathway. Not hormonal.' },
  { name: 'CJC-1295', slug: 'cjc-1295', cat: 'Peptide', pct: 'none', notes: 'GHRH peptide. Stimulates GH release. No testosterone suppression.' },
  { name: 'Ipamorelin', slug: 'ipamorelin', cat: 'Peptide', pct: 'none', notes: 'GHRP peptide. GH pathway only. No PCT needed.' },
  { name: 'Laxogenin', slug: 'laxogenin', cat: 'Plant Steroid', pct: 'none', notes: 'Non-hormonal plant steroid. Does not bind androgen receptor. No suppression.' },
  { name: 'Turkesterone', slug: 'turkesterone', cat: 'Plant Steroid', pct: 'none', notes: 'Ecdysteroid. Non-hormonal. No suppression.' },
  { name: 'Tongkat Ali', slug: 'tongkat-ali', cat: 'Natural', pct: 'none', notes: 'Natural test support. Actually helps recovery. Often used during PCT.' },
  { name: 'Eucommia Ulmoides', slug: 'eucommia-ulmoides', cat: 'Natural', pct: 'none', notes: 'Adaptogenic herb. Supports joint and hormonal health. No suppression.' },
  { name: 'Halo Elite', slug: 'halo-elite', cat: 'Natural', pct: 'none', notes: 'Natural anabolic. Non-hormonal. No PCT needed.' },
];

const pctBadge = {
  full: { label: 'FULL PCT', cls: 'text-red-400 bg-red-500/10 border border-red-500/20' },
  serm: { label: 'SERM REQUIRED', cls: 'text-red-400 bg-red-500/15 border border-red-500/30' },
  otc: { label: 'OTC PCT', cls: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' },
  none: { label: 'NO PCT', cls: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' },
};

const signs = [
  { icon: '\u26A0\uFE0F', label: 'Lethargy & Fatigue', desc: 'Persists after cycle ends' },
  { icon: '\uD83D\uDCC9', label: 'Loss of Libido', desc: 'Sexual function changes' },
  { icon: '\uD83D\uDE24', label: 'Mood Swings', desc: 'Irritability, depression' },
  { icon: '\uD83D\uDCAA', label: 'Strength Loss', desc: 'Beyond normal deload' },
  { icon: '\uD83E\uDDB4', label: 'Joint Pain', desc: 'Estrogen crash indicator' },
  { icon: '\uD83C\uDF54', label: 'Cortisol Cravings', desc: 'Hunger spike post-cycle' },
];

const fiveCats = [
  { n: 'Test Booster', d: 'Stimulate natural testosterone back to baseline' },
  { n: 'Anti-Estrogen', d: 'Block or reduce estrogen while testosterone recovers' },
  { n: 'DHT Blocker', d: 'Protect against androgenic side effects during recovery' },
  { n: 'Liver Support', d: 'NAC, Milk Thistle, TUDCA for methylated compounds' },
  { n: 'Prostate Support', d: 'Saw Palmetto, Stinging Nettle' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-500 mb-1">Week {label}</p>
      <p className="text-base font-bold" style={{ color: payload[0]?.stroke || '#f59e0b' }}>{payload[0]?.value} ng/dL</p>
    </div>
  );
};

export default function PctGuide() {
  const [suppression, setSuppression] = useState('heavy');
  const [protocol, setProtocol] = useState('otc');
  const [search, setSearch] = useState('');
  const [filterPct, setFilterPct] = useState('all');
  const [showHandoff, setShowHandoff] = useState(false);

  const startT = suppression === 'mild' ? 300 : 100;
  const chartData = useMemo(() => genCurve(startT, protocol), [startT, protocol]);
  const status = statusMap[protocol];
  const color = lineColors[protocol];

  const filtered = useMemo(() => {
    let list = compounds;
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (filterPct !== 'all') list = list.filter(c => c.pct === filterPct);
    return list;
  }, [search, filterPct]);

  const btnCls = (active) => `px-4 py-2 rounded-lg text-sm font-bold transition-all ${active ? 'bg-[#229DD8] text-white shadow-lg shadow-[#229DD8]/30' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-white/5'}`;
  const fBtn = (val, label) => <button key={val} onClick={() => setFilterPct(val)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterPct === val ? 'bg-[#229DD8] text-white' : 'bg-slate-800/50 text-slate-500 hover:text-white border border-white/5'}`}>{label}</button>;

  const CLink = ({ slug, children }) => (
    <Link to={'/compounds/' + slug} className="text-[#229DD8] hover:text-white transition-colors underline decoration-[#229DD8]/30 hover:decoration-white/50 underline-offset-2">{children}</Link>
  );

  const CLinkBold = ({ slug, children }) => (
    <Link to={'/compounds/' + slug} className="text-sm font-bold text-[#229DD8] hover:text-white transition-colors underline decoration-[#229DD8]/30 hover:decoration-white/50 underline-offset-2">{children}</Link>
  );

  const downloadHandoff = () => {
    const handoff = {
      _sovereign: { anchor: 'E3592DC3', source: 'forum.prohormonepro.com', format: 'PCT_DATABASE_V1', doctrine: 'Proof Over Hype' },
      _ai_context: { role: 'You are analyzing a PCT database from ProHormonePro. Use this data to build a week-by-week recovery protocol for the user based on their specific cycle. Cross-reference with their Cycle Log AI Handoff if provided.', warning: 'These are prohormones and SARMs sold as supplements, NOT anabolic steroids. Do not confuse product names with pharmaceutical compounds.' },
      compounds: compounds.map(c => ({ name: c.name, category: c.cat, pct_level: c.pct, notes: c.notes })),
      protocols: { otc: { name: 'Arimiplex (Hi-Tech)', dose: '1 cap/day', duration: '4-6 weeks', use_case: 'All prohormone cycles' }, serm: { name: 'Enclomiphene', dose: '12.5-25mg/day', duration: '4-6 weeks', use_case: 'Heavy cycles, SARMs, or when OTC is insufficient' }, hcg: { name: 'HCG', dose: '250-500 IU 2-3x/wk', duration: '2-4 weeks', use_case: 'Testicular atrophy, fertility restoration' } },
      categories: fiveCats.map(c => ({ name: c.n, description: c.d })),
    };
    const blob = new Blob([JSON.stringify(handoff, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'PCT-Database-' + new Date().toISOString().slice(0,10) + '.json'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>

      {/* Hero + AI Handoff Button */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-emerald-500/15 p-6 sm:p-8 mb-6 shadow-lg shadow-emerald-500/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Post Cycle Therapy (PCT)</h1>
              <p className="text-sm text-slate-400">The protocol that protects your gains and your health.</p>
            </div>
          </div>
          <button onClick={() => setShowHandoff(true)} className="shrink-0 flex items-center gap-1.5 bg-[#229DD8]/10 hover:bg-[#229DD8]/20 text-[#229DD8] text-xs font-bold px-3 py-2 rounded-lg border border-[#229DD8]/20 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AI Handoff
          </button>
        </div>
        <p className="text-base text-slate-300 leading-relaxed">When you take a prohormone, your body slows natural testosterone production. When the cycle ends, androgens leave but production does not snap back. Your LH is weakened, testosterone is low, estrogen stays high. PCT fixes this.</p>
      </div>

      {/* AI Handoff Modal */}
      {showHandoff && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowHandoff(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold text-white mb-3">Generate Your Recovery Protocol</h2>
            <p className="text-sm text-slate-400 mb-4">Do not guess on your PCT. This tool exports the entire PCT Database alongside your specific cycle data so an AI can build you a flawless recovery timeline.</p>
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3"><span className="w-6 h-6 rounded-md bg-[#229DD8]/10 flex items-center justify-center shrink-0"><span className="text-[#229DD8] text-xs font-bold">1</span></span><p className="text-sm text-slate-300">Download the PCT Database JSON below.</p></div>
              <div className="flex items-start gap-3"><span className="w-6 h-6 rounded-md bg-[#229DD8]/10 flex items-center justify-center shrink-0"><span className="text-[#229DD8] text-xs font-bold">2</span></span><p className="text-sm text-slate-300">Go to your <Link to="/cycles" className="text-[#229DD8] underline underline-offset-2" onClick={() => setShowHandoff(false)}>Active Cycle Log</Link> and download your Cycle Log AI Handoff.</p></div>
              <div className="flex items-start gap-3"><span className="w-6 h-6 rounded-md bg-[#229DD8]/10 flex items-center justify-center shrink-0"><span className="text-[#229DD8] text-xs font-bold">3</span></span><p className="text-sm text-slate-300">Paste BOTH files into ChatGPT, Claude, or Gemini with this prompt:</p></div>
            </div>
            <div className="bg-slate-950/80 rounded-lg p-3 mb-5 border border-white/5">
              <p className="text-xs text-slate-400 italic">"I am finishing the cycle detailed in [Cycle_Log.json]. Using the rules and compound data provided in [PCT_Database.json], give me a week-by-week recovery protocol, including exact dosages and when to get my post-cycle bloodwork."</p>
            </div>
            <div className="flex gap-3">
              <button onClick={downloadHandoff} className="flex-1 bg-gradient-to-r from-[#229DD8] to-[#1b87bc] text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-[#229DD8]/20">Download PCT JSON</button>
              <button onClick={() => setShowHandoff(false)} className="px-4 bg-slate-800/50 text-slate-400 text-sm rounded-xl border border-white/5">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* HPTA Simulator */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-extrabold text-white">HPTA Recovery Simulator</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${status.badge}`}>{status.label}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5">Est: {status.recovery}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5">Baseline: 650 ng/dL</span>
          </div>
        </div>
        <div className="h-64 sm:h-72 mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <defs><linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.3} /><stop offset="95%" stopColor={color} stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="week" tick={{ fontSize: 13, fill: '#94a3b8' }} label={{ value: 'Weeks Post-Cycle', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[0, 1000]} tick={{ fontSize: 13, fill: '#94a3b8' }} label={{ value: 'Testosterone (ng/dL)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 12, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={650} stroke="#94a3b8" strokeDasharray="6 4" label={{ value: 'Baseline', position: 'right', fontSize: 12, fill: '#94a3b8' }} />
              <Area type="monotone" dataKey="testosterone" stroke={color} strokeWidth={2.5} fill="url(#pctGrad)" dot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#0f172a' }} activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#0f172a' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 font-medium">Suppression</span>
            <button onClick={() => setSuppression('mild')} className={btnCls(suppression === 'mild')}>Mild</button>
            <button onClick={() => setSuppression('heavy')} className={btnCls(suppression === 'heavy')}>Heavy</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 font-medium">PCT Protocol</span>
            <button onClick={() => setProtocol('none')} className={btnCls(protocol === 'none')}>None</button>
            <button onClick={() => setProtocol('otc')} className={btnCls(protocol === 'otc')}>OTC</button>
            <button onClick={() => setProtocol('serm')} className={btnCls(protocol === 'serm')}>SERM</button>
          </div>
        </div>
      </div>

      {/* PCT Video */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-4 sm:p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="#fff" points="9.545 15.568 15.818 12 9.545 8.432"/></svg>
          <span className="text-sm font-bold text-white">PCT Explained</span>
          <a href="https://youtu.be/1js19YiC7lU" target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-slate-500 hover:text-[#229DD8] transition-colors">Watch on YouTube</a>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden border border-white/5">
          <iframe src="https://www.youtube-nocookie.com/embed/1js19YiC7lU?rel=0&modestbranding=1" title="PCT Explained" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
        </div>
      </div>

      {/* Signs of Suppression */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Signs of Suppression</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {signs.map((s, i) => (
            <div key={i} className="bg-slate-950/60 rounded-lg border border-amber-500/10 p-3 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-sm font-bold text-white">{s.label}</p>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5 PCT Categories */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">The 5 PCT Categories</h2>
        <p className="text-sm text-slate-400 mb-4">A complete PCT covers all five. Most OTC products miss at least one.</p>
        <div className="space-y-3">
          {fiveCats.map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-md bg-[#229DD8]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[#229DD8] text-sm font-bold">{i+1}</span></span>
              <div><p className="text-sm text-white font-semibold">{c.n}</p><p className="text-sm text-slate-400">{c.d}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Prohormone Categories */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-xl font-bold text-white mb-2">PCT by Prohormone Category</h2>
        <p className="text-sm text-slate-400 mb-4">These are precursor categories. Multiple products fall under each. All require at minimum an OTC PCT like <CLink slug="arimiplex">Arimiplex</CLink>.</p>
        <div className="space-y-2">
          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-1"><span className="text-sm font-bold text-white">1-Andro / 1-DHEA</span><span className="text-xs font-bold px-2 py-0.5 rounded-md text-amber-400 bg-amber-500/10 border border-amber-500/20">OTC PCT</span></div>
            <p className="text-sm text-slate-400">Converts to 1-Testosterone via two-step enzymatic process. Dry compound. Products: Hi-Tech <CLink slug="1-ad">1-AD</CLink>, <CLink slug="chosen-1">Chosen-1</CLink> (banned). Suppressive. OTC PCT required.</p>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-1"><span className="text-sm font-bold text-white">4-Andro / 4-DHEA</span><span className="text-xs font-bold px-2 py-0.5 rounded-md text-amber-400 bg-amber-500/10 border border-amber-500/20">OTC PCT</span></div>
            <p className="text-sm text-slate-400">Converts to testosterone. Wet compound. Aromatizes. Products: Hi-Tech <CLink slug="andriol">Andriol</CLink>, <CLink slug="sustanon-250">Sustanon 250</CLink>, <CLink slug="androdiol">Androdiol</CLink>. OTC PCT + keep AI (<CLink slug="arimistane">Arimistane</CLink>) on hand.</p>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-1"><span className="text-sm font-bold text-white">Epiandro / Epiandrosterone</span><span className="text-xs font-bold px-2 py-0.5 rounded-md text-amber-400 bg-amber-500/10 border border-amber-500/20">OTC PCT</span></div>
            <p className="text-sm text-slate-400">DHT derivative. Dry, hardening compound. Mild suppression. OTC PCT (<CLink slug="arimiplex">Arimiplex</CLink>) sufficient for most. Products include Hi-Tech <CLink slug="dymethazine">Dymethazine</CLink> (2-step converting prohormone to DHT) and <CLink slug="superstrol-7">Superstrol-7</CLink> (Epiandro + anti-cortisol). Get bloodwork to verify.</p>
          </div>
        </div>
      </div>

      {/* Compound Protocol Database */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Compound Protocol Database</h2>
        <p className="text-sm text-slate-400 mb-4">Search the most popular compounds in the encyclopedia for exact PCT requirements. Every compound hyperlinked to the Encyclopedia.</p>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search compounds..." className="w-full rounded-lg border border-slate-700/50 bg-slate-950/50 py-3 px-4 text-base text-white placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all mb-3" />
        <div className="flex flex-wrap gap-1.5 mb-4">
          {fBtn('all', 'All')}
          {fBtn('full', '\uD83D\uDD34 Full PCT')}
          {fBtn('serm', '\uD83D\uDD34 SERM Req')}
          {fBtn('otc', '\uD83D\uDFE1 OTC PCT')}
          {fBtn('none', '\uD83D\uDFE2 No PCT')}
        </div>
        <div className="space-y-1.5">
          {filtered.map((c, i) => {
            const b = pctBadge[c.pct];
            return (
              <div key={i} className="bg-slate-950/50 rounded-lg p-3 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="shrink-0 min-w-[180px]">
                  <CLinkBold slug={c.slug}>{c.name}</CLinkBold>
                  <span className="text-xs text-slate-600 ml-2">{c.cat}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md shrink-0 ${b.cls}`}>{b.label}</span>
                <span className="text-sm text-slate-400 flex-1">{c.notes}</span>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No compounds match your search.</p>}
        </div>
      </div>

      {/* === THE ARMORY: Tiered PCT Protocols === */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-xl font-bold text-white mb-5">The Armory: PCT Protocols</h2>

        {/* Tier 1: For Prohormones */}
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-3">Tier 1: For Prohormones</h3>
        <div className="bg-slate-950/50 rounded-xl p-4 border border-amber-500/10 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CLinkBold slug="arimiplex">Arimiplex (Hi-Tech)</CLinkBold>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md text-amber-400 bg-amber-500/10 border border-amber-500/20">OTC</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Best for Stacks</span>
              </div>
              <p className="text-sm text-slate-400">11 ingredients. <CLink slug="arimistane">Arimistane</CLink> 37.5mg. Solid DHT blocker + liver support. The go-to OTC PCT for prohormone users. Pair with <CLink slug="tongkat-ali">Tongkat Ali</CLink> for complete coverage.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-[#229DD8] bg-[#229DD8]/10 px-3 py-1.5 rounded-lg border border-[#229DD8]/20">1 cap/day</span>
              <span className="text-sm font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5">4-6 weeks</span>
            </div>
          </div>
        </div>

        {/* Tier 2: For Heavy Cycles & SARMs */}
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">Tier 2: For Heavy Prohormone Runs and SARMs</h3>
        <div className="bg-slate-950/50 rounded-xl p-4 border border-red-500/10 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CLinkBold slug="enclomiphene">Enclomiphene</CLinkBold>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md text-red-400 bg-red-500/10 border border-red-500/20">Pharma</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Gold Standard</span>
              </div>
              <p className="text-sm text-slate-400">Stimulates LH/FSH directly. Cleaner isomer of <CLink slug="clomid-clomiphene">Clomid</CLink> without the emotional sides. The safest bet for SARMs or heavy prohormone runs. Under doctor supervision.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-[#229DD8] bg-[#229DD8]/10 px-3 py-1.5 rounded-lg border border-[#229DD8]/20">12.5-25mg/day</span>
              <span className="text-sm font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5">4-6 weeks</span>
            </div>
          </div>
        </div>

        {/* Tier 3: Specialized */}
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Tier 3: Specialized and Everything Else</h3>
        <div className="space-y-3">
          <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CLinkBold slug="nolvadex-tamoxifen">Nolvadex (Tamoxifen)</CLinkBold>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md text-red-400 bg-red-500/10 border border-red-500/20">Pharma</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Proven SERM</span>
              </div>
              <p className="text-sm text-slate-400">Blocks estrogen at the receptor. Works well but can cause mood sides in some users.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-[#229DD8] bg-[#229DD8]/10 px-3 py-1.5 rounded-lg border border-[#229DD8]/20">20-40mg/day taper</span>
              <span className="text-sm font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5">4 weeks</span>
            </div>
          </div>
          <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CLinkBold slug="clomid-clomiphene">Clomid (Clomiphene)</CLinkBold>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md text-red-400 bg-red-500/10 border border-red-500/20">Pharma</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Potent</span>
              </div>
              <p className="text-sm text-slate-400">Higher side effect profile. The zuclomiphene isomer is what makes Clomid "wet" and causes the highly emotional side effects. It is commonly used to stimulate egg growth in women. <CLink slug="enclomiphene">Enclomiphene</CLink> is the isolated clean isomer and the much better option.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-[#229DD8] bg-[#229DD8]/10 px-3 py-1.5 rounded-lg border border-[#229DD8]/20">25-50mg/day</span>
              <span className="text-sm font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5">4 weeks</span>
            </div>
          </div>
          <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CLinkBold slug="hcg-human-chorionic-gonadotropin">HCG (Human Chorionic Gonadotropin)</CLinkBold>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md text-red-400 bg-red-500/10 border border-red-500/20">Pharma</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Testicular Recovery</span>
              </div>
              <p className="text-sm text-slate-400">Restores LH/FSH and testicular size. Can lead to estrogenic sides (water retention, moodiness) if dosed too high. Primarily for restoring ball size and fertility markers.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-[#229DD8] bg-[#229DD8]/10 px-3 py-1.5 rounded-lg border border-[#229DD8]/20">250-500 IU 2-3x/wk</span>
              <span className="text-sm font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5">2-4 weeks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keeping Gains */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Keeping Your Gains Post-Cycle</h2>
        <div className="space-y-3">
          {[
            ['Eat at a surplus', '2-500 extra calories. Food is anabolic. Your appetite will spike from cortisol. Use it.'],
            ['Stick to the workout schedule', 'Maintain 75% of on-cycle lifting intensity. This is not the time to skip days.'],
            ['Restore testosterone ASAP', 'SERM or OTC PCT. The faster LH recovers, the more muscle you keep.'],
            ['Keep your head on straight', 'Motivation dips. Strength drops. Accept looking softer. Focus on the 100%, not the extra 20%.'],
            ['Best case: keep 70-80%', 'Of both strength and size. Composition looks different. Flatter, softer. Normal. Years of cycling creates permanent hyperplasia.'],
          ].map(([t, d], i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-md bg-[#229DD8]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[#229DD8] text-sm font-bold">{i+1}</span></span>
              <div><p className="text-sm text-white font-semibold">{t}</p><p className="text-sm text-slate-400">{d}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* The Rule */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 mb-6 text-center">
        <p className="text-lg font-bold text-white mb-2">The Rule</p>
        <p className="text-sm text-slate-300 mb-4">Get bloodwork before your cycle. Get bloodwork 4 weeks after PCT ends. Compare the numbers. That is the only way to know if recovery is complete.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/compounds" className="inline-flex items-center justify-center bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] text-white font-bold text-sm rounded-xl px-6 py-3 transition-all shadow-lg shadow-[#229DD8]/20">Browse Encyclopedia</Link>
          <Link to="/r/lab" className="inline-flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium text-sm rounded-xl px-6 py-3 transition-all border border-white/10">View Cycle Logs</Link>
          <Link to="/consultation" className="inline-flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium text-sm rounded-xl px-6 py-3 transition-all border border-amber-500/20">Book Consultation</Link>
        </div>
      </div>

      {/* IC CTA */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/15 p-6 mb-6 text-center shadow-lg shadow-amber-500/5">
        <h3 className="text-lg font-bold text-white mb-2">See the Receipts</h3>
        <p className="text-sm text-slate-400 mb-4">Theory is great. Bloodwork is undeniable. Join the Inner Circle to view actual post-cycle lab results and recovery timelines.</p>
        <Link to="/register" className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl px-8 py-3 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">Join Inner Circle | $19/mo</Link>
      </div>

      <p className="text-xs text-slate-600 text-center mb-8">Skepticism without data is fear. Skepticism with data is power.</p>
    </div>
  );
}
