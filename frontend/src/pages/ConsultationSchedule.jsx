import { useState } from 'react';
import { Calendar, CheckCircle, Clock, MessageSquare, ArrowLeft } from 'lucide-react';
import { api } from '../hooks/api';
import useAuthStore from '../stores/auth';

const SLOTS = [
  { id: 'wed-12', day: 'Wednesday', time: '12:00 - 1:00 PM CST', icon: '🗓' },
  { id: 'thu-12', day: 'Thursday', time: '12:00 - 1:00 PM CST', icon: '🗓' },
  { id: 'fri-12', day: 'Friday', time: '12:00 - 1:00 PM CST', icon: '🗓' },
  { id: 'sat-14', day: 'Saturday', time: '2:00 - 4:00 PM CST', icon: '🗓' },
];

const SLOT_LABELS = { 'wed-12': 'Wednesday 12-1pm CST', 'thu-12': 'Thursday 12-1pm CST', 'fri-12': 'Friday 12-1pm CST', 'sat-14': 'Saturday 2-4pm CST' };

export default function ConsultationSchedule() {
  const user = useAuthStore((s) => s.user);
  const [selected, setSelected] = useState(null);
  const [noneWork, setNoneWork] = useState(false);
  const [altText, setAltText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!selected && !altText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/consultation-intake', {
        type: 'schedule',
        selected_slot: selected || null,
        alt_time: noneWork ? altText.trim() : null,
        user_id: user?.id || null,
        username: user?.username || 'anonymous',
      });
      setDone(true);
    } catch {
      setError('Something went wrong. Try again or DM Travis on Instagram.');
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in py-16 px-4">
        <div className="rounded-2xl p-8 sm:p-10 text-center" style={{ background: 'linear-gradient(135deg, rgba(11,17,32,0.95), rgba(15,23,42,0.9))', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 0 60px rgba(16,185,129,0.06)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3 tracking-tight">You're Locked In.</h2>
          <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <p className="text-[15px] text-emerald-300 font-medium">
              {selected ? SLOT_LABELS[selected] || selected : 'Custom time requested'}
            </p>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-2">
            Travis will confirm the exact date via email within 24 hours.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Come prepared. The more you put into the intake, the more you get out of the call.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              Browse the Forum
            </a>
          </div>
          <p className="mt-8 font-mono text-[10px] text-slate-700 uppercase tracking-widest">Proof Over Hype · E3592DC3</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in py-8 px-4">
      {/* Back */}
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <Calendar className="w-6 h-6" style={{ color: '#22a1d8' }} />
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">Pick a Time</h1>
        </div>
        <p className="text-[15px] text-slate-400 leading-relaxed">
          Select a time that works for you. Travis will confirm the exact date within 24 hours.
        </p>
      </div>

      {/* Slot Picker */}
      <div className="rounded-2xl p-5 sm:p-7 mb-6" style={{ background: 'linear-gradient(135deg, rgba(11,17,32,0.92), rgba(15,23,42,0.88))', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-4">Available Windows</p>

        <div className="space-y-3">
          {SLOTS.map(slot => {
            const active = selected === slot.id && !noneWork;
            return (
              <button key={slot.id} onClick={() => { setSelected(slot.id); setNoneWork(false); }} className="w-full text-left rounded-xl p-4 border transition-all" style={{ background: active ? 'rgba(34,161,216,0.08)' : 'rgba(15,23,42,0.5)', border: active ? '1px solid rgba(34,161,216,0.4)' : '1px solid rgba(255,255,255,0.05)', boxShadow: active ? '0 0 20px rgba(34,161,216,0.08)' : 'none' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4" style={{ color: active ? '#22a1d8' : '#64748b' }} />
                    <div>
                      <p className="text-base font-bold" style={{ color: active ? '#22a1d8' : '#f1f5f9' }}>{slot.day}</p>
                      <p className="text-sm" style={{ color: active ? '#94a3b8' : '#64748b' }}>{slot.time}</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: active ? '#22a1d8' : '#475569' }}>
                    {active && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
                  </div>
                </div>
              </button>
            );
          })}

          {/* None work */}
          <button onClick={() => { setNoneWork(!noneWork); if (!noneWork) setSelected(null); }} className="w-full text-left rounded-xl p-4 border transition-all" style={{ background: noneWork ? 'rgba(245,158,11,0.06)' : 'rgba(15,23,42,0.5)', border: noneWork ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" style={{ color: noneWork ? '#f59e0b' : '#64748b' }} />
              <div>
                <p className="text-base font-bold" style={{ color: noneWork ? '#fbbf24' : '#94a3b8' }}>None of these work</p>
                <p className="text-sm text-slate-500">Propose a time that fits your schedule.</p>
              </div>
            </div>
          </button>

          {noneWork && (
            <div className="animate-fade-in pt-2">
              <textarea value={altText} onChange={e => setAltText(e.target.value)} placeholder="e.g. Monday afternoons, Sunday mornings, any evening after 7pm CST..." rows={3} className="w-full bg-[#0b1120]/60 border border-white/[0.08] rounded-xl p-4 text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#22a1d8] focus:ring-4 focus:ring-cyan-500/15 transition-all resize-y" />
              <p className="text-xs text-slate-500 mt-2">Travis will reach out with a time that works.</p>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg mb-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={submitting || (!selected && !(noneWork && altText.trim()))} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold tracking-wide transition-all" style={{ background: (submitting || (!selected && !(noneWork && altText.trim()))) ? 'rgba(34,161,216,0.06)' : 'linear-gradient(to bottom, #2bb5e8, #22a1d8, #1a7eb0)', color: (submitting || (!selected && !(noneWork && altText.trim()))) ? '#475569' : '#fff', opacity: (submitting || (!selected && !(noneWork && altText.trim()))) ? 0.4 : 1, cursor: (submitting || (!selected && !(noneWork && altText.trim()))) ? 'not-allowed' : 'pointer', boxShadow: selected || (noneWork && altText.trim()) ? '0 10px 32px rgba(34,161,216,0.35)' : 'none' }}>
        {submitting ? 'Confirming...' : 'Confirm Slot'}
      </button>

      <p className="text-center mt-6 mb-8 font-mono text-[10px] text-slate-600 uppercase tracking-widest">Proof Over Hype.</p>
    </div>
  );
}
