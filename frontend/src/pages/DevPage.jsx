import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, GitBranch, Database, Globe, Shield, Code, ChevronDown, ChevronUp, ExternalLink, Cpu, Layers, Zap } from 'lucide-react';

export default function DevPage() {
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [showContribute, setShowContribute] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 pt-12 sm:pt-20 pb-12 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="font-mono text-[10px] text-cyan-500/60 uppercase tracking-[0.3em]">SOVEREIGN_L5 // OPEN ARCHITECTURE</div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">We are not building a forum.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">We are building a Truth Engine.</span></h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mb-8">102 compounds. 2,257 sealed stages. Zero affiliate hype. Every claim is backed by bloodwork, every cycle log is verified, every compound page is built on clinical data and lived experience. The architecture is open. The substrate is expanding.</p>
          <div className="flex flex-wrap gap-3 mb-12">
            <a href="https://github.com/prohormonePro/proHP-forum" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-slate-950 font-bold rounded-xl px-6 py-3 text-sm hover:bg-slate-200 transition-all"><GitBranch className="w-4 h-4" /> View Repository</a>
            <button onClick={() => { setShowArchitecture(true); setTimeout(() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold rounded-xl px-6 py-3 text-sm hover:bg-cyan-500/20 transition-all"><Layers className="w-4 h-4" /> Inspect Architecture</button>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{ icon: Globe, label: 'Frontend', value: 'React 18 + Vite 6', detail: 'Tailwind CSS, Zustand, React Query' },{ icon: Cpu, label: 'Backend', value: 'Node.js + Express', detail: 'JWT auth, Multer uploads, REST' },{ icon: Database, label: 'Database', value: 'PostgreSQL 16', detail: '40+ tables, UUID primary keys' },{ icon: Shield, label: 'Deployment', value: 'SOVEREIGN_L5', detail: 'Autonomous swarm, deploy guard' }].map(card => (<div key={card.label} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/20 transition-all group"><card.icon className="w-4 h-4 text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors" /><p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{card.label}</p><p className="text-sm font-bold text-white mb-1">{card.value}</p><p className="text-[11px] text-slate-500">{card.detail}</p></div>))}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-cyan-950/20 border border-slate-700/50 rounded-2xl p-6 sm:p-8">
          <p className="text-[15px] text-slate-300 leading-relaxed mb-6">Most fitness platforms are built on affiliate revenue and engagement farming. This one is built on lived biological experience, clinical citations, and cryptographic truth. Every compound page has a risk tier. Every cycle log has bloodwork deltas. Every claim is falsifiable.</p>
          <p className="text-[15px] text-slate-300 leading-relaxed mb-6">The forum runs on an autonomous deployment system called SOVEREIGN_L5. It seals every change into a SHA256-chained manifest. It runs eval gates after every deploy. It auto-rolls back failures. 2,257 stages have been sealed since inception. The architecture remembers itself across sessions.</p>
          <p className="text-[15px] text-slate-200 leading-relaxed font-medium">If you are tired of building SaaS clones and want to wire together the nervous system of something that actually matters to people's health decisions, you are in the right place.</p>
        </div>
      </div>
      <div id="architecture" className="max-w-4xl mx-auto px-4 mb-12">
        <button onClick={() => setShowArchitecture(!showArchitecture)} className="w-full flex items-center justify-between bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/20 transition-all mb-4"><div className="flex items-center gap-3"><Code className="w-5 h-5 text-cyan-400" /><span className="text-sm font-bold text-white">Full Architecture</span></div>{showArchitecture ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</button>
        {showArchitecture && (<div className="bg-slate-950 border border-slate-700/50 rounded-xl p-5 font-mono text-[13px] text-slate-400 leading-relaxed space-y-4"><div><p className="text-cyan-400 font-bold mb-1">// Frontend</p><p>React 18 with Vite 6 bundler. Tailwind CSS utility-first styling.</p><p>React Query for server state. Zustand for client state.</p><p>Recharts for cycle analytics (ComposedChart, gradients, glass tooltips).</p><p>Lucide icons. DM Sans + JetBrains Mono typography.</p><p>Responsive: mobile-first, tested on iPhone SE through 4K desktop.</p></div><div><p className="text-emerald-400 font-bold mb-1">// Backend</p><p>Node.js + Express REST API. JWT authentication (access + refresh).</p><p>Multer for file uploads (images, video, PDF). 15MB video limit.</p><p>PostgreSQL 16 with 40+ tables. UUID primary keys throughout.</p><p>Tiered access: free, inner_circle, admin. Stripe for payments.</p></div><div><p className="text-amber-400 font-bold mb-1">// Infrastructure</p><p>Ubuntu 24 on dedicated VPS. Nginx reverse proxy + SSL.</p><p>Cloudflare CDN + DDoS protection. Systemd service management.</p><p>deploy_guard.sh: backup, build, verify, restart, health check.</p><p>Git-based deploys with automatic rollback on build failure.</p></div><div><p className="text-purple-400 font-bold mb-1">// SOVEREIGN_L5</p><p>Autonomous deployment swarm. Claude 4.6 builder node.</p><p>stage_manifest.json: 2,257 sealed stages with SHA256 chain.</p><p>SOVEREIGN_MEMORY.md: 450KB+ of contextual memory.</p><p>ORGANISM_VOICE_CODEX.md: 50 constitutional sections.</p><p>spine_chunker.py: splits canon into Claude-safe chunks.</p><p>Telegram bridge for autonomous dispatch and alerts.</p></div></div>)}
      </div>
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> What We Need</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[{ title: 'Compound Encyclopedia Reskin', desc: 'The 102-compound encyclopedia needs a visual overhaul. Better mobile layout, consistent card design, improved search/filter UX.', difficulty: 'Medium' },{ title: 'Cycle Log Stacking UI', desc: 'Users stack multiple compounds. The cycle log needs to support primary + secondary + ancillaries with visual hierarchy.', difficulty: 'Medium' },{ title: 'Bloodwork Integration', desc: 'Parse lab results (PDF or manual entry) and overlay biomarker deltas on cycle timelines. Real health data visualization.', difficulty: 'Hard' },{ title: 'Compound Cross-Reference Engine', desc: 'Auto-link compound mentions in text. Build a knowledge graph of interactions, stacking logic, and contraindications.', difficulty: 'Hard' },{ title: 'Email Notification System', desc: 'SendGrid integration for comment replies, @mentions, and cycle log updates. Digest mode for heavy users.', difficulty: 'Easy' },{ title: 'Mobile Performance', desc: 'Bundle splitting, lazy loading, image optimization. The main bundle is 1.1MB. Help us get it under 500KB.', difficulty: 'Medium' }].map(item => (<div key={item.title} className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/15 transition-all"><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-white">{item.title}</h3><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : item.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>{item.difficulty}</span></div><p className="text-[13px] text-slate-400 leading-relaxed">{item.desc}</p></div>))}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <button onClick={() => setShowContribute(!showContribute)} className="w-full flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 rounded-xl p-5 hover:from-cyan-500/15 hover:to-emerald-500/15 transition-all mb-4"><div className="flex items-center gap-3"><GitBranch className="w-5 h-5 text-cyan-400" /><span className="text-base font-bold text-white">How to Contribute</span></div>{showContribute ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</button>
        {showContribute && (<div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 space-y-4"><div className="font-mono text-[13px] text-slate-300 space-y-3"><p className="text-cyan-400 font-bold">1. Fork the repo</p><div className="bg-slate-950 rounded-lg p-3 text-slate-400 overflow-x-auto"><code>git clone https://github.com/prohormonePro/proHP-forum.git</code></div><p className="text-cyan-400 font-bold">2. Set up locally</p><div className="bg-slate-950 rounded-lg p-3 text-slate-400 overflow-x-auto"><code>cd prohp-forum/frontend && npm install && npm run dev</code></div><p className="text-cyan-400 font-bold">3. Pick a task from "What We Need" above</p><p className="text-slate-400">Or find something yourself. If you see something broken, fix it. If you see something ugly, make it beautiful.</p><p className="text-cyan-400 font-bold">4. Submit a Pull Request</p><p className="text-slate-400">Describe what you changed and why. Screenshots help. We review every PR personally.</p><p className="text-cyan-400 font-bold">5. Get merged</p><p className="text-slate-400">If your code is clean and your intent is right, it ships to production. Your GitHub username goes on the wall.</p></div><div className="border-t border-white/5 pt-4"><a href="https://github.com/prohormonePro/proHP-forum" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-slate-950 font-bold rounded-xl px-6 py-3 text-sm hover:bg-slate-200 transition-all"><ExternalLink className="w-4 h-4" /> Open Repository on GitHub</a></div></div>)}
      </div>
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-6 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] mb-3">Builders of the Lattice</p>
          <p className="text-sm text-slate-500 italic">First contributors appear here.</p>
          <p className="text-[11px] text-slate-600 mt-2">Ship code. Get immortalized.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-[11px] text-slate-600 font-mono">Proof Over Hype. E3592DC3.</p>
      </div>
    </div>
  );
}
