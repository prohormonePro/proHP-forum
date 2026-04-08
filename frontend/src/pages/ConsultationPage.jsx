import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/auth';

const API = import.meta.env.VITE_API_URL || '';

export default function ConsultationPage() {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const tier = user?.tier;
  const isIC = tier === 'inner_circle' || tier === 'admin';
  const price = isIC ? 400 : 500;

  async function handleCheckout() {
    setLoading(true);
    try {
      const token = localStorage.getItem('prohp_at');
      const res = await fetch(API + '/api/stripe/create-consultation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) },
        body: JSON.stringify({ tier: isIC ? 'inner_circle' : 'free' }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert('Checkout unavailable.'); setLoading(false); }
    } catch (err) { alert('Something went wrong.'); setLoading(false); }
  }


  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 sm:p-8 mb-6 shadow-lg shadow-[#229DD8]/5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#229DD8]/30 shrink-0">
            <img src="/images/travis.jpg" alt="Travis Dillard" className="w-full h-full object-cover object-top" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">1-on-1 Consultation with Travis</h1>
            <p className="text-sm text-slate-400">17 years. 600+ clients. Zero brand deals. Your protocol, built from your data.</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[['600+','Clients'],['17','Years'],['105+','Compounds'],['2M+','YT Views']].map(([v,l],i) => (
            <div key={i} className="text-center bg-slate-950/50 rounded-lg py-2.5 border border-white/5">
              <div className="text-lg font-extrabold text-white">{v}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* === THE DICHOTOMY ENGINE === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Entropic Path */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-red-500/10 p-5">
          <h2 className="text-lg font-bold text-red-400 mb-3">The Cost of Guessing</h2>
          <div className="space-y-2.5">
            {[
              'Wasted cycles on bunk gear',
              'Crushed LH/FSH for 6+ months',
              'Panic-buying the wrong PCT',
              'Permanent hair loss from mismanaged DHT',
              'Losing 100% of gains the week you come off',
              'Bloodwork you cannot interpret alone',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-red-400 text-xs">&#10007;</span></span>
                <p className="text-sm text-slate-400">{t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sovereign Path */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-emerald-500/10 p-5">
          <h2 className="text-lg font-bold text-emerald-400 mb-3">The Price of Certainty</h2>
          <div className="space-y-2.5">
            {[
              'Pre-cleared bloodwork markers before Day 1',
              'Exact titration schedule for your suppression tolerance',
              'Neurogenesis support to counter lethargy',
              'PCT protocol locked in before you start',
              'Written exit strategy: dose, duration, recovery',
              'A locked-in protocol verified by 17 years of experience',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-emerald-400 text-xs">&#10003;</span></span>
                <p className="text-sm text-slate-300">{t}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-500/10 text-center">
            <p className="text-xs text-slate-500">{'$' + price + ' once'} vs. months of biological repair.</p>
          </div>
        </div>
      </div>

      {/* === WHAT YOU GET (deliverables) === */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">What You Get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['\uD83C\uDFA5', '45-Minute Video Call', 'Face to face with Travis. Your stack, your goals, your questions. No script. No warmup. We start at the data.'],
            ['\uD83D\uDCCB', 'Written Protocol Document', '2-3 page personalized document: compound selection, dosing, timing, PCT, and monitoring schedule.'],
            ['\uD83E\uDDEA', 'Bloodwork Blueprint', 'Exactly what panels to order, when to draw, and what the numbers mean for your protocol.'],
            ['\uD83D\uDEE1\uFE0F', 'PCT Protocol', 'Tailored recovery plan based on your specific compounds, suppression level, and biological context.'],
            ['\u26A1', 'Neurogenesis Support', 'Counter-lethargy, mood, and cognitive support compounds matched to your cycle.'],
            ['\uD83D\uDCC8', 'Titration Guidance', 'Start-low protocol with exact ramp schedule. No guessing on dose progression.'],
          ].map(([icon, title, desc], i) => (
            <div key={i} className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{icon}</span>
                <p className="text-sm font-bold text-white">{title}</p>
              </div>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* === TERMINAL RECEIPT (sample deliverable) === */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Sample Deliverable</h2>
        <p className="text-sm text-slate-400 mb-4">Every consultation includes a detailed written document. Real output, client name removed.</p>
        <div className="bg-slate-950/80 rounded-xl p-5 border border-[#229DD8]/10 font-mono text-sm">
          <p className="text-[#229DD8] font-bold mb-3">// CONSULTATION_RECEIPT.protocol</p>
          {[
            ['GOAL', 'Lean mass gain, minimal side effects'],
            ['CYCLE', '8-week protocol tailored to bloodwork baseline'],
            ['COMPOUND', 'Selected based on androgen receptor affinity + suppression tolerance'],
            ['PCT', 'Full recovery timeline: compound, dose, duration, monitoring'],
            ['BLOODWORK', 'Pre-cycle, mid-cycle (wk 4), post-PCT (wk 4) panels specified'],
            ['NEURO', 'Counter-lethargy + cognitive stack matched to cycle'],
            ['DOSING', 'Start-low with week-by-week titration ramp'],
          ].map(([k, v], i) => (
            <div key={i} className="flex gap-3 py-1 border-b border-white/3 last:border-0">
              <span className="text-amber-400 shrink-0 w-28">{k}:</span>
              <span className="text-slate-400">{v}</span>
            </div>
          ))}
          <p className="text-slate-600 italic mt-3 text-xs">// Full document: 2-3 pages. Dosing, timing, monitoring, exit strategy.</p>
        </div>
      </div>

      {/* === THE PROCESS === */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">The Process</h2>
        <div className="space-y-3">
          {[
            ['Submit below', 'Secure checkout via Stripe. Scheduling details sent immediately.'],
            ['Intake form arrives', 'A short form covering your age, lifting history, compounds, goals, and any bloodwork. Sent via email after booking.'],
            ['45-minute video call', 'Travis reviews your data before the call. No warmup. No fluff. We start at the data and work forward.'],
            ['Written protocol in 48 hours', 'Your personalized 2-3 page document: compound, dosing, PCT, bloodwork blueprint, and exit strategy.'],
          ].map(([t, d], i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-amber-400 text-sm font-bold">{i + 1}</span></span>
              <div><p className="text-sm text-white font-semibold">{t}</p><p className="text-sm text-slate-400">{d}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* === PRICING CTA === */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/15 p-6 sm:p-8 mb-6 shadow-lg shadow-amber-500/5">
        <div className="text-center mb-5">
          <p className="text-sm text-slate-500 uppercase tracking-widest mb-2">1-on-1 Consultation with Travis</p>
          <p className="text-4xl font-extrabold text-white">{'$' + price}</p>
          {isIC ? (
            <p className="text-sm text-amber-400 font-medium mt-1">Inner Circle member price. You save $100.</p>
          ) : (
            <p className="text-sm text-slate-400 mt-1">One-time fee. <span className="text-amber-400">$400 for Inner Circle members.</span></p>
          )}
        </div>

        <p className="text-sm text-slate-400 text-center mb-5 max-w-md mx-auto">Your stack, your goals, your data. 45 minutes with Travis, plus a written protocol document you own forever.</p>

        <button onClick={handleCheckout} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold text-base rounded-xl py-4 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 mb-3">
          {loading ? 'Redirecting to checkout...' : 'Book Your Consultation | $' + price}
        </button>

        {!isIC && (
          <Link to="/register" className="block w-full text-center bg-transparent border border-[#229DD8]/30 hover:border-[#229DD8]/60 text-[#229DD8] font-bold text-sm rounded-xl py-3 transition-all">
            Inner Circle Member? Unlock $400 Rate
          </Link>
        )}

        <p className="text-xs text-slate-500 text-center mt-3">Secure checkout powered by Stripe. Scheduling details sent immediately after payment.</p>
      </div>

      {/* === WHY TRAVIS === */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-5">Why Travis</h2>
        <div className="space-y-5">
          {[
            ['\uD83D\uDCDA', '105+ Compound Encyclopedia', 'Written from direct experience. Not scraped from Reddit. Not generated by AI. Every profile is backed by mechanism data, real bloodwork, and personal use history.'],
            ['\uD83D\uDCC8', '600+ Consultations Completed', 'From first-time SARM users to TRT veterans running complex stacks. Every consultation gets the same depth of analysis.'],
            ['\uD83D\uDEAB', 'No Brand Deals. No Affiliate Bias.', 'Travis does not sell supplements. Does not take sponsorships. The recommendation is always the best compound for your goals, not the one that pays commission.'],
            ['\uD83E\uDE78', 'Bloodwork-First Protocol Design', 'Every protocol starts and ends with bloodwork. If you do not have pre-cycle labs, Travis will tell you what to order before you touch a compound.'],
          ].map(([icon, title, desc], i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">{icon}</span>
              <div><p className="text-sm text-white font-semibold">{title}</p><p className="text-sm text-slate-400 leading-relaxed">{desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Social */}
      <div className="text-center mb-6">
        <p className="text-sm text-slate-400 mb-2">Questions before booking?</p>
        <div className="flex items-center justify-center gap-4">
          <a href="https://youtube.com/@ProHormonePro" target="_blank" rel="noopener noreferrer" className="text-sm text-[#229DD8] hover:text-white transition-colors underline underline-offset-2 decoration-[#229DD8]/30">YouTube</a>
          <a href="https://instagram.com/prohormonepro" target="_blank" rel="noopener noreferrer" className="text-sm text-[#229DD8] hover:text-white transition-colors underline underline-offset-2 decoration-[#229DD8]/30">Instagram</a>
          <Link to="/" className="text-sm text-[#229DD8] hover:text-white transition-colors underline underline-offset-2 decoration-[#229DD8]/30">Forum</Link>
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center mb-8">Skepticism without data is fear. Skepticism with data is power.</p>
    </div>
  );
}
