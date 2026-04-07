import { Link } from 'react-router-dom';

const protocols = [
  { name: 'Enclomiphene', dose: '12.5-25mg/day', duration: '4-6 weeks', notes: 'Gold standard for SARM/prohormone PCT. Stimulates LH/FSH without estrogenic sides. Most effective option for maintaining gains.' },
  { name: 'Nolvadex (Tamoxifen)', dose: '20-40mg/day tapering', duration: '4 weeks', notes: 'Proven SERM. Blocks estrogen at the receptor. Works well but can cause mood sides in some users.' },
  { name: 'Clomid (Clomiphene)', dose: '25-50mg/day', duration: '4 weeks', notes: 'Potent but higher side effect profile (vision, mood). Enclomiphene is the cleaner isomer.' },
];

const signs = [
  'Lethargy or fatigue that persists after cycle ends',
  'Loss of libido or sexual function changes',
  'Mood swings, irritability, or depression',
  'Loss of strength or muscle fullness beyond normal',
  'Joint pain or dryness (estrogen crash indicator)',
];

export default function PctGuide() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back */}
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
        <p className="text-base text-slate-300 leading-relaxed">
          Every prohormone and SARM cycle suppresses your natural hormone production to some degree. PCT is the structured recovery protocol that restores your endocrine system to baseline. Skipping it is not an option. The compound determines the PCT. The bloodwork confirms it.
        </p>
      </div>

      {/* When You Need PCT */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">When You Need PCT</h2>
        <p className="text-sm text-slate-300 mb-4">Not every compound requires aggressive PCT. SARMs like AC-262 or Ostarine at low doses may only need a mini-PCT or none at all. Methylated prohormones like Superdrol or M1T require full PCT. The rule: if you are suppressed, you need recovery.</p>
        <h3 className="text-sm font-bold text-amber-400 mb-3">Signs of Suppression</h3>
        <div className="space-y-2">
          {signs.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-amber-400 text-[10px] font-bold">!</span></span>
              <span className="text-sm text-slate-300">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Common Protocols */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Common PCT Protocols</h2>
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

      {/* The Rule */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 mb-6 text-center">
        <p className="text-base font-bold text-white mb-2">The Rule</p>
        <p className="text-sm text-slate-300 mb-4">Get bloodwork before your cycle. Get bloodwork 4 weeks after PCT ends. Compare the numbers. That is the only way to know if your recovery is complete.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/compounds" className="inline-flex items-center justify-center bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] text-white font-bold text-sm rounded-xl px-6 py-3 transition-all shadow-lg shadow-[#229DD8]/20">
            Browse the Encyclopedia
          </Link>
          <Link to="/cycles" className="inline-flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium text-sm rounded-xl px-6 py-3 transition-all border border-white/10">
            View Cycle Logs
          </Link>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 text-center mb-8">Skepticism without data is fear. Skepticism with data is power.</p>
    </div>
  );
}
