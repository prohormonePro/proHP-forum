import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../hooks/api';

const FIELD_META = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', required: true }, { key: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 28', required: true },
  { key: 'height_weight_bf', label: 'Height / Weight / Body Fat %', type: 'composite', fields: [ { key: 'height', placeholder: 'e.g. 5\'10"', style: { flex: 1 } },
    { key: 'weight', placeholder: 'e.g. 195 lbs', style: { flex: 1 } }, { key: 'bodyfat', placeholder: 'e.g. 14%', style: { flex: 1 } },
  ]}, { key: 'training_history', label: 'Training History', type: 'textarea', placeholder: 'Years lifting, training split, experience level...', rows: 3, required: true },
  { key: 'diet', label: 'Current Diet', type: 'textarea', placeholder: 'Daily calories, macros, meal frequency, any restrictions...', rows: 3 }, { key: 'current_supplements', label: 'Current Supplements', type: 'textarea', placeholder: 'List everything you\'re currently taking...', rows: 2 },
  { key: 'prior_compounds', label: 'Prior Compound Experience', type: 'textarea', placeholder: 'Previous cycles, compounds used, doses, outcomes...', rows: 3 }, { key: 'trt_status', label: 'TRT Status', type: 'select', options: ['Not on TRT', 'Currently on TRT', 'Previously on TRT', 'Considering TRT'], required: true },
  { key: 'bloodwork', label: 'Recent Bloodwork', type: 'textarea', placeholder: 'Any recent labs? Testosterone, liver enzymes, lipids, etc. Paste values or describe...', rows: 3 }, { key: 'primary_goal', label: 'Primary Goal', type: 'select', options: ['Lean bulk', 'Recomp', 'Cut / fat loss', 'Strength', 'Athletic performance', 'PCT / recovery', 'General wellness', 'Other'], required: true },
  { key: 'compounds_to_discuss', label: 'Compounds You Want to Discuss', type: 'textarea', placeholder: 'Which compounds are you interested in or considering?', rows: 2, required: true }, { key: 'health_conditions', label: 'Health Conditions / Medications', type: 'textarea', placeholder: 'Any diagnosed conditions, prescriptions, or health concerns we should know about...', rows: 2 },
  { key: 'the_one_question', label: 'The One Question', type: 'textarea', placeholder: 'If you could only ask one thing in this consultation, what would it be?', rows: 3, required: true, highlight: true },
];

function buildInitialState() { const state = {};
  FIELD_META.forEach(f => { if (f.type === 'composite') {
      f.fields.forEach(sub => { state[sub.key] = ''; });
    } else {
      state[f.key] = '';
    }
  });
  return state;
}

export default function ConsultationIntake() { const navigate = useNavigate();
  const [form, setForm] = useState(buildInitialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) { e.preventDefault();
    setError('');
    setSubmitting(true);
    try { await api.post('/api/consultation-intake', form);
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) { return (
      <div className="max-w-2xl mx-auto py-16 px-4 animate-fade-in">
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(11,17,32,0.95), rgba(15,23,42,0.9))',
            border: '1px solid rgba(34,161,216,0.15)',
            boxShadow: '0 0 80px rgba(34,161,216,0.06)',
          }}
        >
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Intel Received</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Your pre-consultation intake has been submitted. This gives us a head start so
            we can spend consultation time on strategy, not background.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: 'rgba(34,161,216,0.12)',
              border: '1px solid rgba(34,161,216,0.25)',
              color: '#22a1d8',
            }}
          >
            Back to Forum
          </button>
        </div>
      </div>
    );
  }

  return ( <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <ClipboardList className="w-5 h-5" style={{ color: '#22a1d8' }} />
          <h1 className="text-lg font-extrabold tracking-tight text-slate-100">Pre-Consultation Intel</h1>
        </div>
        <p className="text-xs text-slate-500">
          Fill this out before your consultation. The more detail you give, the more specific the guidance.
        </p>
      </div>

      {/* Glass Card Form */}
      <form onSubmit={handleSubmit}>
        <div
          className="rounded-2xl p-5 sm:p-6 space-y-5"
          style={{ background: 'linear-gradient(135deg, rgba(11,17,32,0.92), rgba(15,23,42,0.88))',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 0 80px rgba(34,161,216,0.04)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {FIELD_META.map(field => { const isHighlight = field.highlight;
            const wrapStyle = isHighlight ? { background: 'rgba(34,161,216,0.04)',
              border: '1px solid rgba(34,161,216,0.12)',
              borderRadius: '12px',
              padding: '16px',
            } : {};

            return ( <div key={field.key} style={wrapStyle}>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 tracking-wide">
                  {field.label}
                  {field.required && <span style={{ color: '#22a1d8' }} className="ml-1">*</span>}
                </label>

                {field.type === 'composite' && ( <div className="flex gap-2">
                    {field.fields.map(sub => ( <input
                        key={sub.key}
                        type="text"
                        value={form[sub.key]}
                        onChange={e => update(sub.key, e.target.value)}
                        placeholder={sub.placeholder}
                        style={sub.style}
                        className="bg-slate-900/60 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[rgba(34,161,216,0.35)] transition-colors"
                      />
                    ))}
                  </div>
                )}

                {field.type === 'text' && ( <input
                    type="text"
                    value={form[field.key]}
                    onChange={e => update(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full bg-slate-900/60 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[rgba(34,161,216,0.35)] transition-colors"
                  />
                )}

                {field.type === 'number' && ( <input
                    type="number"
                    value={form[field.key]}
                    onChange={e => update(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    min="13"
                    max="99"
                    className="w-full bg-slate-900/60 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[rgba(34,161,216,0.35)] transition-colors"
                  />
                )}

                {field.type === 'textarea' && ( <textarea
                    value={form[field.key]}
                    onChange={e => update(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={field.rows || 3}
                    className="w-full bg-slate-900/60 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[rgba(34,161,216,0.35)] transition-colors resize-none"
                  />
                )}

                {field.type === 'select' && ( <select
                    value={form[field.key]}
                    onChange={e => update(field.key, e.target.value)}
                    required={field.required}
                    className="w-full bg-slate-900/60 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[rgba(34,161,216,0.35)] transition-colors"
                  >
                    <option value="">Select...</option>
                    {field.options.map(opt => ( <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}

          {/* Error */}
          {error && ( <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-700/20">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-xs text-red-300">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200"
            style={{ background: submitting ? 'rgba(34,161,216,0.08)' : 'rgba(34,161,216,0.15)',
              border: '1px solid rgba(34,161,216,0.3)',
              color: '#22a1d8',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'rgba(34,161,216,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = submitting ? 'rgba(34,161,216,0.08)' : 'rgba(34,161,216,0.15)'; }}
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Intel'}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center mt-5 text-[11px] text-slate-600">
        All data is confidential. Proof Over Hype.
      </div>
    </div>
  );
}
