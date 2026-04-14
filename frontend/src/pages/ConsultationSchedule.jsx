import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/auth';

const API = import.meta.env.VITE_API_URL || '';

const SLOTS = [
  { id: 'wed-12', label: 'Wednesday', time: '12:00 – 1:00 PM CST' }, { id: 'thu-12', label: 'Thursday',  time: '12:00 – 1:00 PM CST' },
  { id: 'fri-12', label: 'Friday',    time: '12:00 – 1:00 PM CST' }, { id: 'sat-14', label: 'Saturday',  time: '2:00 – 4:00 PM CST' },
];

export default function ConsultationSchedule() { const user = useAuthStore((s) => s.user);
  const [selected, setSelected] = useState(null);
  const [noneWork, setNoneWork] = useState(false);
  const [altText, setAltText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() { if (!selected && !altText.trim()) return;
    setSubmitting(true);
    setError('');
    try { const token = localStorage.getItem('prohp_at');
      const res = await fetch(API + '/api/consultation-intake', { method: 'POST',
        headers: { 'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({ type: 'schedule',
          selected_slot: selected || null,
          alt_time: noneWork ? altText.trim() : null,
          user_id: user?.id || null,
          username: user?.username || null,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      setDone(true);
    } catch {
      setError('Something went wrong. Try again or DM Travis on Instagram.');
      setSubmitting(false);
    }
  }

  if (done) { return (
      <div className="max-w-xl mx-auto animate-fade-in py-12">
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-emerald-500/20 p-8 text-center shadow-lg shadow-emerald-500/5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">You're Locked In</h1>
          <p className="text-sm text-slate-400 mb-1">
            {selected ? `Slot received: ${SLOTS.find((s) => s.id === selected)?.label} ${SLOTS.find((s) => s.id === selected)?.time}.`
              : 'Your preferred time has been sent to Travis.'}
          </p>
          <p className="text-sm text-slate-400 mb-6">Travis will confirm via email within 24 hours.</p>
          <Link to="/consultation" className="inline-flex items-center gap-2 text-sm text-[#229DD8] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Consultation
          </Link>
        </div>
      </div>
    );
  }

  return ( <div className="max-w-xl mx-auto animate-fade-in">
      {/* Back */}
      <div className="mb-6">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 sm:p-8 mb-6 shadow-lg shadow-[#229DD8]/5">
        <h1 className="text-2xl font-extrabold text-white mb-1">Schedule Your Consultation</h1>
        <p className="text-sm text-slate-400">Select a recurring weekly slot. Travis will confirm the exact date via email after you submit.</p>
      </div>

      {/* Slot Picker */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 sm:p-6 mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">Available Slots</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SLOTS.map((slot) => { const active = selected === slot.id && !noneWork;
            return ( <button
                key={slot.id}
                onClick={() => { setSelected(slot.id); setNoneWork(false); }}
                className={`text-left rounded-xl p-4 border transition-all ${ active
                    ? 'bg-[#229DD8]/10 border-[#229DD8]/40 shadow-lg shadow-[#229DD8]/10'
                    : 'bg-slate-950/50 border-white/5 hover:border-[#229DD8]/20 hover:bg-[#229DD8]/5'
                }`}
              >
                <p className={`text-sm font-bold ${active ? 'text-[#229DD8]' : 'text-white'}`}>{slot.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{slot.time}</p>
                {active && ( <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-[#229DD8] animate-pulse" />
                    <span className="text-[10px] text-[#229DD8] font-semibold uppercase tracking-wider">Selected</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* None work toggle */}
        <button
          onClick={() => { setNoneWork(!noneWork); if (!noneWork) setSelected(null); }}
          className={`mt-4 w-full text-left rounded-xl p-4 border transition-all ${ noneWork
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-slate-950/50 border-white/5 hover:border-amber-500/15'
          }`}
        >
          <p className={`text-sm font-bold ${noneWork ? 'text-amber-400' : 'text-slate-400'}`}>None of these work</p>
          <p className="text-xs text-slate-500 mt-0.5">Propose a time that fits your schedule.</p>
        </button>

        {noneWork && ( <div className="mt-3 animate-fade-in">
            <textarea
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Monday afternoons, Sunday mornings, any evening after 7pm CST..."
              rows={3}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#229DD8]/40 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">Travis will reach out with a time that works.</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/15 p-6 sm:p-8 shadow-lg shadow-amber-500/5">
        {error && ( <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || (!selected && !(noneWork && altText.trim()))}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl py-4 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 mb-3"
        >
          {submitting ? 'Submitting...' : 'Confirm Slot'}
        </button>

        <p className="text-xs text-slate-500 text-center">Travis will confirm the exact date via email within 24 hours.</p>
      </div>

      <p className="text-xs text-slate-600 text-center mt-6 mb-8">Proof Over Hype.</p>
    </div>
  );
}
