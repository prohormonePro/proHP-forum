import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/auth';

const API = import.meta.env.VITE_API_URL || '';

export default function ConsultationPage() {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const tier = user?.tier;
  const isInnerCircle = tier === 'inner_circle' || tier === 'admin';
  const price = isInnerCircle ? 400 : 500;

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch(API + '/api/stripe/create-consultation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: isInnerCircle ? 'inner_circle' : 'free' }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert('Checkout unavailable. Please try again.'); setLoading(false); }
    } catch (err) { alert('Something went wrong. Please try again.'); setLoading(false); }
  }

  const stats = [
    { value: '600+', label: 'Clients' },
    { value: '17', label: 'Years' },
    { value: '105+', label: 'Compounds' },
    { value: '2M+', label: 'YT Views' },
  ];

  const deliverables = [
    { icon: '\uD83C\uDFA5', title: '45-Minute Video Call', desc: 'Face to face with Travis. Your stack, your goals, your questions. No script.' },
    { icon: '\uD83D\uDCCB', title: 'Written Protocol Document', desc: '2-3 page personalized document: compound selection, dosing, timing, PCT, and monitoring schedule.' },
    { icon: '\uD83E\uDDEA', title: 'Bloodwork Blueprint', desc: 'Exactly what panels to order, when to draw (pre, mid-cycle, post-PCT), and what the numbers mean for your protocol.' },
    { icon: '\uD83D\uDEE1\uFE0F', title: 'PCT Protocol', desc: 'Tailored recovery plan based on your specific compounds, suppression level, and biological context.' },
    { icon: '\u26A1', title: 'Neurogenesis Support Stack', desc: 'Counter-lethargy, mood, and cognitive support compounds matched to your cycle.' },
    { icon: '\uD83D\uDCC8', title: 'Titration Guidance', desc: 'Start-low protocol with exact ramp schedule. No guessing on dose progression.' },
  ];

  const whoFor = [
    'You are about to run your first cycle and want to get it right the first time',
    'You have run cycles before but never had bloodwork guidance',
    'You are stacking multiple compounds and need someone to verify the protocol',
    'You are on TRT and want to add a prohormone or SARM safely',
    'You are experiencing side effects and need an experienced eye on your data',
    'You want a second opinion on a protocol you found online',
  ];

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
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 sm:p-8 mb-6 shadow-lg shadow-[#229DD8]/5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#229DD8]/30 shrink-0">
            <img src="/images/travis.jpg" alt="Travis Dillard" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">1-on-1 with Travis</h1>
            <p className="text-sm text-slate-400">Your stack. Your goals. Your questions. Real talk, no script, receipts included.</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {stats.map((s, i) => (
            <div key={i} className="text-center bg-slate-950/50 rounded-lg py-2 border border-white/5">
              <div className="text-lg font-extrabold text-white">{s.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="text-base text-slate-300 leading-relaxed">This is not a generic fitness coaching call. Travis has 17 years of direct experience with prohormones and SARMs, 600+ one-on-one clients, and 105+ compound profiles written from personal use and verified bloodwork. You get a protocol built specifically for your biology, your goals, and your risk tolerance.</p>
      </div>

      {/* What You Get */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">What You Get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {deliverables.map((d, i) => (
            <div key={i} className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
              <div className="text-2xl mb-2">{d.icon}</div>
              <p className="text-sm font-bold text-white mb-1">{d.title}</p>
              <p className="text-sm text-slate-400">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Deliverable */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Sample Deliverable</h2>
        <p className="text-sm text-slate-400 mb-4">Every consultation includes a detailed written document. Here is what a real deliverable looks like (client name removed).</p>
        <div className="bg-slate-950/60 rounded-xl p-5 border border-[#229DD8]/10">
          <p className="text-sm font-bold text-white mb-3">Consultation Summary - [Client]</p>
          <div className="space-y-2">
            {[
              ['Goal', 'Lean mass gain with minimal side effects'],
              ['Recommended Cycle', '8-week protocol tailored to bloodwork baseline'],
              ['Primary Compound', 'Selected based on bloodwork, goals, and suppression tolerance'],
              ['PCT Protocol', 'Full recovery timeline with exact dosing and duration'],
              ['Bloodwork Schedule', 'Pre-cycle, mid-cycle (week 4), and 4 weeks post-PCT panels specified'],
              ['Neurogenesis Support', 'Counter-lethargy and cognitive support stack included'],
              ['Dosing', 'Start-low protocol with week-by-week titration guidance'],
            ].map(([k, v], i) => (
              <div key={i} className="flex gap-3">
                <span className="text-sm font-bold text-[#229DD8] shrink-0 w-36">{k}</span>
                <span className="text-sm text-slate-400">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 italic mt-3">Full document is 2-3 pages with specific dosing, timing, and monitoring guidance.</p>
        </div>
      </div>

      {/* Who This Is For */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Who This Is For</h2>
        <div className="space-y-2">
          {whoFor.map((w, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-md bg-[#229DD8]/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[#229DD8] text-xs font-bold">&#10003;</span>
              </span>
              <p className="text-sm text-slate-300">{w}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The Process */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">The Process</h2>
        <div className="space-y-3">
          {[
            ['Book below', 'Secure checkout via Stripe. You will receive scheduling details immediately after payment.'],
            ['Fill out the intake form', 'A short form covering your age, lifting history, current compounds, goals, and any bloodwork you have. This arrives via email after booking.'],
            ['45-minute video call', 'Travis reviews your data before the call. No warmup. No fluff. We start at the data and work forward.'],
            ['Written protocol delivered', 'Within 48 hours you receive a 2-3 page document: your personalized compound recommendation, dosing schedule, PCT protocol, and bloodwork blueprint.'],
          ].map(([t, d], i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 text-sm font-bold">{i + 1}</span>
              </span>
              <div><p className="text-sm text-white font-semibold">{t}</p><p className="text-sm text-slate-400">{d}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing + CTA */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/15 p-6 sm:p-8 mb-6 shadow-lg shadow-amber-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-3xl font-extrabold text-white">{'$' + price}</p>
            {isInnerCircle ? (
              <p className="text-sm text-amber-400 font-medium">Inner Circle member price (you save $100)</p>
            ) : (
              <p className="text-sm text-slate-400">One-time consultation fee. <span className="text-amber-400">$400 for Inner Circle members.</span></p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-slate-500">45-min video call</span>
            <span className="text-xs text-slate-500">Written protocol included</span>
            <span className="text-xs text-slate-500">Bloodwork blueprint included</span>
          </div>
        </div>

        <button onClick={handleCheckout} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold text-base rounded-xl py-4 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">
          {loading ? 'Redirecting to checkout...' : 'Book Your Consultation'}
        </button>

        <p className="text-xs text-slate-500 text-center mt-3">Secure checkout powered by Stripe. Scheduling details sent immediately after payment.</p>

        {!isInnerCircle && (
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-sm text-slate-400 mb-2">Want the $400 rate?</p>
            <Link to="/register" className="text-sm text-[#229DD8] font-bold underline underline-offset-2 decoration-[#229DD8]/30 hover:text-white transition-colors">Join Inner Circle | $19/mo</Link>
          </div>
        )}
      </div>

      {/* Trust Anchors */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Why Travis</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">&#128218;</span>
            <div><p className="text-sm text-white font-semibold">105+ Compound Encyclopedia</p><p className="text-sm text-slate-400">Written from direct experience. Not scraped from Reddit. Not generated by AI. Every profile is backed by mechanism data, real bloodwork, and personal use history.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">&#128200;</span>
            <div><p className="text-sm text-white font-semibold">600+ Consultations Completed</p><p className="text-sm text-slate-400">From first-time SARM users to TRT veterans running complex stacks. Every consultation gets the same depth of analysis.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">&#127891;</span>
            <div><p className="text-sm text-white font-semibold">No Brand Deals. No Affiliate Bias.</p><p className="text-sm text-slate-400">Travis does not sell supplements. Does not take sponsorships. The recommendation is always the best compound for your goals, not the one that pays commission.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">&#129656;</span>
            <div><p className="text-sm text-white font-semibold">Bloodwork-First Protocol Design</p><p className="text-sm text-slate-400">Every protocol starts and ends with bloodwork. If you do not have pre-cycle labs, Travis will tell you what to order before you touch a compound.</p></div>
          </div>
        </div>
      </div>

      {/* Social links */}
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
