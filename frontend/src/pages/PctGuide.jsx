import { Link } from 'react-router-dom';

const protocols = [
  { name: 'Enclomiphene', dose: '12.5-25mg/day', duration: '4-6 weeks', notes: 'Gold standard SERM for SARM and prohormone PCT. Stimulates LH/FSH directly. Cleaner isomer of Clomid without the emotional sides. Under doctor supervision.' },
  { name: 'Nolvadex (Tamoxifen)', dose: '20-40mg/day tapering', duration: '4 weeks', notes: 'Proven SERM. Blocks estrogen at the receptor. Works well but can cause mood sides in some users. Widely available.' },
  { name: 'Clomid (Clomiphene)', dose: '25-50mg/day', duration: '4 weeks', notes: 'Potent but higher side effect profile. The emotional sides are real. Like a period in a bottle. Enclomiphene is the cleaner option.' },
  { name: 'Gorilla Mode Sigma', dose: '4 pills/day', duration: '4-8 weeks', notes: 'OTC test booster option for mini prohormone cycles or those without SERM access. Travis and Vigorous Steve both saw testosterone nearly double in a short window. Not sufficient for heavy cycles.' },
];

const otcProducts = [
  { name: 'Post Gear (5% Nutrition)', price: '$54.99', verdict: 'Best all-in-one', notes: 'Only product that hits all 5 PCT categories: test booster (Longjack 300mg proven in humans), anti-estrogen (Brassopsis 500mg as powerful as prescription AI), DHT blocker (stinging nettle), liver support (milk thistle 200mg), prostate support. 14 ingredients. Best for 1-2 prohormone cycles.' },
  { name: 'Arimiplex (Hi-Tech)', price: '$49.99', verdict: 'Best for stacks', notes: '11 ingredients. Solid Arimistane dose (37.5mg). Good DHT blocker and liver support (NAC + milk thistle). Weak test boosting (Tribulus only). Pair with Tongkat Ali ($20) for complete coverage. Best for 3+ prohormone stacks.' },
  { name: 'PCTV (Blackstone Labs)', price: '$44.99', verdict: 'Budget option', notes: '5 ingredients only. Tribulus for test boosting (inconclusive studies), Arimistane 37.5mg for estrogen. No DHT blocker. NAC for liver. Cheapest but least comprehensive.' },
];

const needsPct = [
  { compound: 'Andriol', slug: 'andriol', pct: 'Depends', notes: 'Hi-Tech 1-DHEA based. Mild to moderate suppression. Bloodwork may show you do not need full PCT at lower doses. Get labs.' },
  { compound: 'Decabolin', slug: 'decabolin', pct: 'Yes', notes: 'Hi-Tech 19-NorDHEA. Nandrolone precursor. Suppressive. Can linger. Full PCT required. Allow extra recovery time.' },
  { compound: 'Superdrol', slug: 'superdrol', pct: 'Yes', notes: 'Highly suppressive prohormone. Aggressive PCT mandatory. Liver support critical (NAC + TUDCA recommended).' },
  { compound: 'Epiandro', slug: 'epiandro-epiandrosterone', pct: 'Mini PCT', notes: 'DHT derivative. Mild suppression. Mini PCT or OTC test booster usually sufficient. Get bloodwork to confirm.' },
  { compound: 'Halodrol', slug: 'halodrol', pct: 'Yes', notes: 'Banned. Methylated. If you have legacy supply: full PCT mandatory.' },
  { compound: 'M1T', slug: 'm1t-methyl-1-testosterone', pct: 'Yes', notes: 'Banned. Most suppressive prohormone. Aggressive PCT + extended recovery.' },
  { compound: 'Trenabol', slug: 'trenabol', pct: 'Yes', notes: 'Hi-Tech 19-NorDHEA based. Suppressive. Full PCT. Similar to Decabolin recovery.' },
];

const sarmsNeedsPct = [
  { compound: 'RAD-140 (Testolone)', slug: 'rad-140-testolone', pct: 'Yes', notes: 'Most suppressive SARM. Full PCT required. Hi-Tech version is the legal product.' },
  { compound: 'LGD-4033 (Ligandrol)', slug: 'lgd-4033-ligandrol', pct: 'Yes', notes: 'Significant suppression at standard doses. Full PCT.' },
  { compound: 'AC-262', slug: 'ac-262', pct: 'Mini PCT', notes: 'Partial agonist. 66% anabolic, 27% androgenic. Mild suppression. Bloodwork at 10mg showed only 50-point testosterone drop. Mini PCT or OTC usually sufficient.' },
  { compound: 'Ostarine (MK-2866)', slug: 'ostarine-mk-2866', pct: 'Depends', notes: 'Mildest SARM. At 10-15mg for 8 weeks, some bloodwork shows no meaningful suppression. At 25mg+, mini PCT recommended. Always get labs.' },
  { compound: 'S-23', slug: 's-23', pct: 'Yes', notes: 'Extremely suppressive. Near-steroid level. Full PCT mandatory. Not for beginners.' },
  { compound: 'YK-11', slug: 'yk-11', pct: 'Yes', notes: 'Myostatin inhibitor + androgen. Highly suppressive. Full PCT.' },
];

const noPct = [
  { compound: 'MK-677 (Ibutamoren)', slug: 'mk-677', notes: 'GH secretagogue. Does not touch the HPTA axis. No suppression. No PCT needed.' },
  { compound: 'GW-501516 (Cardarine)', slug: 'gw-501516-cardarine', notes: 'PPAR agonist. Not hormonal. No suppression. No PCT needed.' },
  { compound: 'BPC-157', slug: 'bpc-157', notes: 'Healing peptide. No hormonal activity. No PCT needed.' },
  { compound: 'IGF-1 LR3', slug: 'igf-1-lr3', notes: 'Growth factor peptide. GH pathway. Does not suppress testosterone. No PCT needed.' },
  { compound: 'Pro IGF-1 (Hi-Tech)', slug: 'pro-igf-1', notes: 'Hi-Tech deer antler velvet product. GH pathway. Not hormonal. No PCT needed.' },
  { compound: 'CJC-1295', slug: 'cjc-1295', notes: 'GHRH peptide. Stimulates GH release. No testosterone suppression. No PCT needed.' },
  { compound: 'Ipamorelin', slug: 'ipamorelin', notes: 'GHRP peptide. GH pathway only. No PCT needed.' },
  { compound: 'Laxogenin', slug: 'laxogenin', notes: 'Plant steroid. Does not bind androgen receptor. No suppression. No PCT needed.' },
  { compound: 'Turkesterone', slug: 'turkesterone', notes: 'Ecdysteroid. Non-hormonal. No suppression. No PCT needed.' },
  { compound: 'Tongkat Ali', slug: 'tongkat-ali', notes: 'Natural test support. Actually HELPS recovery. Often used during PCT.' },
];

const signs = [
  'Lethargy or fatigue that persists after cycle ends',
  'Loss of libido or sexual function changes',
  'Mood swings, irritability, or depression',
  'Loss of strength or muscle fullness beyond normal',
  'Joint pain or dryness (estrogen crash indicator)',
  'Increased hunger and cortisol-driven cravings',
];

const fiveCategories = [
  { name: 'Test Booster', desc: 'Stimulate natural testosterone production back to baseline' },
  { name: 'Anti-Estrogen', desc: 'Block or reduce estrogen while testosterone is recovering' },
  { name: 'DHT Blocker', desc: 'Protect against androgenic side effects during recovery' },
  { name: 'Liver Support', desc: 'Repair liver stress from methylated compounds (NAC, Milk Thistle, TUDCA)' },
  { name: 'Prostate Support', desc: 'Protect prostate health (Saw Palmetto, Stinging Nettle)' },
];

export default function PctGuide() {
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
        <p className="text-base text-slate-300 leading-relaxed mb-4">
          When you take a prohormone, your body's natural testosterone production slows down because it's already getting androgens from the supplement. When the cycle ends, those androgens leave your body. But your natural production doesn't snap back instantly. Your LH (luteinizing hormone) is weakened. Your testosterone is low. Your estrogen is still high. PCT fixes this.
        </p>
        <p className="text-sm text-slate-400">Not every compound needs PCT. Some barely touch the HPTA axis. Some crush it. The compound determines the PCT. The bloodwork confirms it.</p>
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

      {/* The 5 Categories */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">The 5 PCT Categories</h2>
        <p className="text-sm text-slate-300 mb-4">A complete PCT covers all five. Most OTC products miss at least one.</p>
        <div className="space-y-3">
          {fiveCategories.map((cat, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-md bg-[#229DD8]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[#229DD8] text-xs font-bold">{i+1}</span></span>
              <div><p className="text-sm text-white font-medium">{cat.name}</p><p className="text-xs text-slate-400">{cat.desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Signs of Suppression */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Signs of Suppression</h2>
        <div className="space-y-2">
          {signs.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-amber-400 text-[10px] font-bold">!</span></span>
              <span className="text-sm text-slate-300">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prohormones: Needs PCT? */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Prohormones: Do I Need PCT?</h2>
        <p className="text-xs text-slate-500 mb-4">Hi-Tech products are legal two-step converting prohormones unless marked BANNED.</p>
        <div className="space-y-2">
          {needsPct.map((c, i) => (
            <div key={i} className="bg-slate-950/50 rounded-lg p-3 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-2">
              <Link to={'/compounds/' + c.slug} className="text-sm font-bold text-[#229DD8] hover:text-white transition-colors underline decoration-[#229DD8]/30 hover:decoration-white/50 underline-offset-2 shrink-0 min-w-[160px]">{c.compound}</Link>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${c.pct === 'Yes' ? 'text-red-400 bg-red-500/10' : c.pct === 'Mini PCT' ? 'text-amber-400 bg-amber-500/10' : 'text-[#229DD8] bg-[#229DD8]/10'}`}>{c.pct}</span>
              <span className="text-xs text-slate-400 flex-1">{c.notes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SARMs: Needs PCT? */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">SARMs: Do I Need PCT?</h2>
        <div className="space-y-2">
          {sarmsNeedsPct.map((c, i) => (
            <div key={i} className="bg-slate-950/50 rounded-lg p-3 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-2">
              <Link to={'/compounds/' + c.slug} className="text-sm font-bold text-[#229DD8] hover:text-white transition-colors underline decoration-[#229DD8]/30 hover:decoration-white/50 underline-offset-2 shrink-0 min-w-[160px]">{c.compound}</Link>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${c.pct === 'Yes' ? 'text-red-400 bg-red-500/10' : c.pct === 'Mini PCT' ? 'text-amber-400 bg-amber-500/10' : 'text-[#229DD8] bg-[#229DD8]/10'}`}>{c.pct}</span>
              <span className="text-xs text-slate-400 flex-1">{c.notes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* No PCT Needed */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-emerald-500/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-1">No PCT Needed</h2>
        <p className="text-xs text-slate-500 mb-4">These compounds do not suppress the HPTA axis. No testosterone impact. No PCT required.</p>
        <div className="space-y-2">
          {noPct.map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1"><span className="text-emerald-400 text-[10px]">&#10003;</span></span>
              <div>
                <Link to={'/compounds/' + c.slug} className="text-sm font-bold text-[#229DD8] hover:text-white transition-colors underline decoration-[#229DD8]/30 hover:decoration-white/50 underline-offset-2">{c.compound}</Link>
                <p className="text-xs text-slate-400">{c.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SERM Protocols */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Prescription PCT Protocols (SERMs)</h2>
        <p className="text-sm text-slate-300 mb-4">For moderate to heavy cycles. Under doctor supervision. Get bloodwork first.</p>
        <div className="space-y-4">
          {protocols.map((p, i) => (
            <div key={i} className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{p.dose}</span>
                <span className="text-[10px] font-bold text-[#229DD8] bg-[#229DD8]/10 px-2 py-0.5 rounded-md">{p.duration}</span>
              </div>
              <p className="text-sm text-slate-300">{p.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* OTC PCT Products */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/15 p-6 mb-6 shadow-lg shadow-amber-500/5">
        <h2 className="text-lg font-bold text-white mb-1">OTC PCT Product Comparison</h2>
        <p className="text-xs text-slate-500 mb-4">Tested against the 5 PCT categories. Based on ingredient analysis and real bloodwork.</p>
        <div className="space-y-4">
          {otcProducts.map((p, i) => (
            <div key={i} className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">{p.price}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{p.verdict}</span>
              </div>
              <p className="text-sm text-slate-300">{p.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keeping Gains */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Keeping Your Gains Post-Cycle</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3"><span className="text-[#229DD8] font-bold shrink-0">1.</span><div><p className="text-sm text-white font-medium">Eat at a surplus</p><p className="text-xs text-slate-400">2-500 extra calories. Food is anabolic. Your appetite will spike from cortisol. Use it.</p></div></div>
          <div className="flex items-start gap-3"><span className="text-[#229DD8] font-bold shrink-0">2.</span><div><p className="text-sm text-white font-medium">Stick to the workout schedule</p><p className="text-xs text-slate-400">Maintain 75% of on-cycle lifting intensity. This is not the time to skip days.</p></div></div>
          <div className="flex items-start gap-3"><span className="text-[#229DD8] font-bold shrink-0">3.</span><div><p className="text-sm text-white font-medium">Restore testosterone ASAP</p><p className="text-xs text-slate-400">SERM or OTC test booster. The faster LH recovers, the more muscle you keep.</p></div></div>
          <div className="flex items-start gap-3"><span className="text-[#229DD8] font-bold shrink-0">4.</span><div><p className="text-sm text-white font-medium">Keep your head on straight</p><p className="text-xs text-slate-400">Motivation will dip. Strength will drop. Accept looking softer. Focus on the 100%, not the extra 20%.</p></div></div>
          <div className="flex items-start gap-3"><span className="text-[#229DD8] font-bold shrink-0">5.</span><div><p className="text-sm text-white font-medium">Best case: keep 70-80%</p><p className="text-xs text-slate-400">Of both strength and size. Your composition will look different. Flatter, softer. That is normal. The years of cycling is what creates permanent hyperplasia.</p></div></div>
        </div>
      </div>

      {/* The Rule */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 mb-6 text-center">
        <p className="text-base font-bold text-white mb-2">The Rule</p>
        <p className="text-sm text-slate-300 mb-4">Get bloodwork before your cycle. Get bloodwork 4 weeks after PCT ends. Compare the numbers. That is the only way to know if your recovery is complete. No guessing. No bro-science. Receipts.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/compounds" className="inline-flex items-center justify-center bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] text-white font-bold text-sm rounded-xl px-6 py-3 transition-all shadow-lg shadow-[#229DD8]/20">Browse the Encyclopedia</Link>
          <Link to="/cycles" className="inline-flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium text-sm rounded-xl px-6 py-3 transition-all border border-white/10">View Cycle Logs</Link>
          <Link to="/consultation" className="inline-flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium text-sm rounded-xl px-6 py-3 transition-all border border-amber-500/20">Book a Consultation</Link>
        </div>
      </div>

            <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/15 p-6 mb-6 text-center shadow-lg shadow-amber-500/5">
        <h3 className="text-lg font-bold text-white mb-2">Get the Full Picture</h3>
        <p className="text-sm text-slate-400 mb-4">Inner Circle members get unrestricted access to every cycle log, verified bloodwork, and the complete 105+ Compound Encyclopedia.</p>
        <Link to="/register" className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl px-8 py-3 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">Join Inner Circle | $19/mo</Link>
      </div>
      <p className="text-[10px] text-slate-600 text-center mb-8">Skepticism without data is fear. Skepticism with data is power.</p>
    </div>
  );
}
