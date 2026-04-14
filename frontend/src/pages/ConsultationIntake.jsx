import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../hooks/api';

const FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', required: true },
  { key: 'age', label: 'Age', type: 'text', placeholder: 'e.g. 28', required: true },
  { key: 'email', label: 'Email', type: 'text', placeholder: 'you@email.com', required: true },
  { key: 'phone', label: 'Phone Number', type: 'text', placeholder: '(555) 123-4567', required: false },
  { key: 'height_weight_bf', label: 'Height / Weight / Body Fat %', type: 'composite', fields: [
    { key: 'height', placeholder: "Height (e.g. 5'10\")" },
    { key: 'weight', placeholder: 'Weight (e.g. 195 lbs)' },
    { key: 'bodyfat', placeholder: 'BF% (e.g. 14%)' },
  ]},
  { key: 'training_history', label: 'Training History', type: 'textarea', placeholder: 'Years lifting, training split, experience level, any injuries...', rows: 4, required: true },
  { key: 'diet', label: 'Current Diet', type: 'textarea', placeholder: 'Daily calories, macros, meal frequency, any restrictions or protocols...', rows: 3 },
  { key: 'current_supplements', label: 'Current Supplements & Compounds (with doses)', type: 'textarea', placeholder: "List everything you're currently taking. OTC supps, prohormones, SARMs, peptides. Include doses if known.", rows: 3, required: true },
  { key: 'prior_compounds', label: 'Prior Compound Experience', type: 'textarea', placeholder: 'What have you run before? How did you respond? Any sides or issues?', rows: 4, required: true },
  { key: 'trt_status', label: 'TRT Status', type: 'select', options: ['Not on TRT', 'Self-prescribed TRT', 'Clinic-prescribed TRT', 'Previously on TRT', 'Considering TRT'], required: true },
  { key: 'bloodwork', label: 'Recent Bloodwork', type: 'textarea', placeholder: 'Key markers: total T, free T, estradiol, LH/FSH, hematocrit, ALT/AST, lipids. Paste values or summarize.', rows: 4 },
  { key: 'primary_goal', label: 'Primary Goal', type: 'select', options: ['Lean bulk', 'Body recomp', 'Fat loss / cutting', 'Strength peak', 'PCT / recovery', 'Health optimization / TRT dial-in', 'Other'], required: true },
  { key: 'compounds_to_discuss', label: 'Compounds You Want to Discuss', type: 'textarea', placeholder: 'Which compounds are you interested in or considering?', rows: 3, required: true },
  { key: 'health_conditions', label: 'Health Conditions / Contraindications / Medications', type: 'textarea', placeholder: 'Any diagnosed conditions, prescriptions, cardiac history, liver issues, hormonal conditions, or health concerns...', rows: 4 },
  { key: 'the_one_question', label: 'The One Question', type: 'textarea', placeholder: 'If you could only ask one thing in this consultation, what would it be?', rows: 4, required: true, highlight: true },
];

function buildInitialState() {
  const state = {};
  FIELDS.forEach(f => {
    if (f.type === 'composite') {
      f.fields.forEach(sub => { state[sub.key] = ''; });
    } else {
      state[f.key] = '';
    }
  });
  return state;
}

export default function ConsultationIntake() {
  const navigate = useNavigate();
  const [form, setForm] = useState(buildInitialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const missing = FIELDS.filter(f => f.required && f.type !== 'composite' && !form[f.key]?.trim());
    if (missing.length > 0) {
      setError('Required: ' + missing.map(f => f.label).join(', '));
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/consultation-intake', form);
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase = 'w-full bg-[#0b1120]/60 border border-white/[0.08] rounded-xl p-4 text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#22a1d8] focus:ring-4 focus:ring-cyan-500/15 transition-all';
  const labelBase = 'block text-[13px] uppercase text-slate-400 font-bold tracking-widest mb-2.5';

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-emerald-500/20 p-8 text-center shadow-lg shadow-emerald-500/5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Intel Received.</h2>
          <p className="text-[15px] text-slate-400 leading-relaxed mb-6">
            Your pre-consultation intake has been submitted. This gives us a head start so we can spend consultation time on strategy, not background.
          </p>
          <button onClick={() => navigate('/consultation/schedule')} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors" style={{ background: 'rgba(34,161,216,0.12)', border: '1px solid rgba(34,161,216,0.25)', color: '#22a1d8' }}>
            Book Your Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      {/* S60 Honeypot */}
      <input type="text" name="intel_check" className="absolute -left-[9999px] top-auto w-1 h-1 overflow-hidden" tabIndex={-1} aria-hidden="true" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <ClipboardList className="w-6 h-6" style={{ color: '#22a1d8' }} />
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">Pre-Consultation Intel</h1>
        </div>
        <p className="text-[15px] text-slate-400 leading-relaxed">
          Fill this out before your consultation. The more detail you give, the more specific the guidance.
        </p>
      </div>

      {/* Glass Card Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl p-5 sm:p-7 space-y-6" style={{ background: 'linear-gradient(135deg, rgba(11,17,32,0.92), rgba(15,23,42,0.88))', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)' }}>

          {FIELDS.map(field => {
            const isHighlight = field.highlight;
            const wrapCls = isHighlight ? 'mt-4 bg-[#0b1120]/60 border-l-2 border-r border-y border-l-cyan-500/30 border-r-white/5 border-y-white/5 rounded-xl p-5 sm:p-6' : '';

            return (
              <div key={field.key} className={wrapCls}>
                <label className={isHighlight ? labelBase + ' text-cyan-400' : labelBase}>
                  {field.label}
                  {field.required && <span className="text-cyan-500 ml-1">*</span>}
                </label>

                {field.type === 'composite' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {field.fields.map(sub => (
                      <input key={sub.key} type="text" value={form[sub.key]} onChange={e => update(sub.key, e.target.value)} placeholder={sub.placeholder} className={inputBase + ' flex-1'} />
                    ))}
                  </div>
                )}
                {field.type === 'text' && (
                  <input type="text" value={form[field.key]} onChange={e => update(field.key, e.target.value)} placeholder={field.placeholder} className={inputBase} />
                )}
                {field.type === 'textarea' && (
                  <textarea value={form[field.key]} onChange={e => update(field.key, e.target.value)} placeholder={field.placeholder} rows={field.rows || 3} className={inputBase + ' resize-y'} style={{ minHeight: (field.rows || 3) * 28 + 'px' }} />
                )}
                {field.type === 'select' && (
                  <select value={form[field.key]} onChange={e => update(field.key, e.target.value)} className={inputBase + ' appearance-none'}>
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <span className="text-sm text-red-300 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4">
            <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold tracking-wide transition-all" style={{ background: submitting ? 'rgba(34,161,216,0.08)' : 'linear-gradient(to bottom, #2bb5e8, #22a1d8, #1a7eb0)', color: '#fff', opacity: submitting ? 0.5 : 1, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 10px 32px rgba(34,161,216,0.35)' }}>
              <Send className="w-5 h-5" />
              {submitting ? 'Transmitting...' : 'Submit Intel'}
            </button>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center mt-8 mb-6">
        <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
          All data is confidential. Proof Over Hype.
        </p>
      </div>
    </div>
  );
}
