import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

export default function EncyclopediaGate({ onUnlock }) { const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [honeypotValue, setHoneypotValue] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  useEffect(() => { const params = new URLSearchParams(window.location.search);
    setUtmSource(params.get('utm_source') || '');
    setUtmMedium(params.get('utm_medium') || '');
    setUtmCampaign(params.get('utm_campaign') || '');
  }, []);

  async function handleSubmit(e) { e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try { const res = await fetch(`${API}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ first_name: firstName,
          last_name: lastName,
          email, 'bot-field': honeypotValue,
          source: 'Forum Encyclopedia Gate',
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        }),
      });

      if (!res.ok) { const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed.');
      }

      onUnlock();
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return ( <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0b1120' }}>

      {/* LAYER 1: Deep sovereign radials */}
      <div
        className="absolute inset-0"
        style={{ background: [
            'radial-gradient(ellipse 900px 600px at 50% 20%, rgba(34,161,216,0.08), transparent 60%)', 'radial-gradient(ellipse 600px 500px at 20% 60%, rgba(34,161,216,0.05), transparent 55%)',
            'radial-gradient(ellipse 500px 400px at 80% 70%, rgba(14,165,233,0.04), transparent 50%)',
          ].join(', '),
        }}
      />

      {/* LAYER 2: Animated pulse ring — slow breathe */}
      <div
        className="absolute rounded-full"
        style={{ width: '700px',
          height: '700px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(34,161,216,0.06) 0%, transparent 70%)',
          animation: 'sovereignPulse 6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* LAYER 3: Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322a1d8' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />

      {/* LAYER 4: Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,161,216,0.3) 50%, transparent)' }}
      />

      {/* Keyframes */}
      <style>{` @keyframes sovereignPulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowShift { 0%, 100% { box-shadow: 0 10px 32px rgba(34,161,216,0.35), 0 0 60px rgba(34,161,216,0.10); }
          50% { box-shadow: 0 10px 40px rgba(34,161,216,0.50), 0 0 80px rgba(34,161,216,0.18); }
        }
      `}</style>

      {/* FORM CARD */}
      <div
        className="relative z-10 max-w-md sm:max-w-lg lg:max-w-xl w-full mx-auto px-4 py-12 lg:py-16"
        style={{ animation: 'fadeInUp 0.6s ease-out both' }}
      >
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 sm:p-8 lg:p-10"
          style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.80) 0%, rgba(11,17,32,0.90) 100%)',
            backdropFilter: 'blur(24px) brightness(0.85)',
            border: '1px solid rgba(34,161,216,0.12)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(34,161,216,0.08)',
          }}
        >
          {/* Anchor badge */}
          <div className="flex justify-center mb-5">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase"
              style={{ background: 'rgba(34,161,216,0.08)',
                border: '1px solid rgba(34,161,216,0.15)',
                color: 'rgba(34,161,216,0.7)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22a1d8', display: 'inline-block', boxShadow: '0 0 8px rgba(34,161,216,0.6)' }} />
              E3592DC3
            </div>
          </div>

          <div className="mb-6 text-center">
            <div className="text-[11px] text-slate-500 mb-1.5 uppercase tracking-[0.18em]">
              I searched{'\u2026'} found nothing.
            </div>
            <div
              className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3"
              style={{ textShadow: '0 2px 16px rgba(34,161,216,0.15)' }}
            >
              So I built it.
            </div>
            <div className="text-sm font-semibold text-slate-300 mb-2">
              Every benefit. Every side effect. For{' '}
              <span className="font-black" style={{ color: '#22a1d8' }}>EVERY</span>{' '}
              prohormone.
            </div>
            <div className="text-xs text-slate-500 mb-4">
              106 compounds reviewed {'\u00B7'} 2M+ YouTube views {'\u00B7'} 600+ consultations
            </div>
            <div className="text-xs text-slate-500 italic">
              Confidence comes from clarity. That{'\u2019'}s what this site gives you.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              name="first_name"
              autoComplete="given-name"
              required
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
              style={{ background: 'rgba(11,17,32,0.60)',
                border: '1px solid rgba(34,161,216,0.15)',
                placeholder: 'rgba(148,163,184,0.45)',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#22a1d8'; e.target.style.boxShadow = '0 0 0 4px rgba(34,161,216,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(34,161,216,0.15)'; e.target.style.boxShadow = 'none'; }}
            />
            <input
              type="text"
              name="last_name"
              autoComplete="family-name"
              required
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
              style={{ background: 'rgba(11,17,32,0.60)',
                border: '1px solid rgba(34,161,216,0.15)',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#22a1d8'; e.target.style.boxShadow = '0 0 0 4px rgba(34,161,216,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(34,161,216,0.15)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <input
            type="hidden"
            name="bot-field"
            tabIndex={-1}
            aria-hidden="true"
            value={honeypotValue}
            onChange={(e) => setHoneypotValue(e.target.value)}
            className="absolute -left-[9999px]"
          />

          <input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-all mb-5"
            style={{ background: 'rgba(11,17,32,0.60)',
              border: '1px solid rgba(34,161,216,0.15)',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#22a1d8'; e.target.style.boxShadow = '0 0 0 4px rgba(34,161,216,0.15)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(34,161,216,0.15)'; e.target.style.boxShadow = 'none'; }}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white font-black text-sm py-4 rounded-full transition-all disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: 'linear-gradient(180deg, #2bb5e8 0%, #22a1d8 50%, #1a7eb0 100%)',
              boxShadow: '0 10px 32px rgba(34,161,216,0.35), 0 0 60px rgba(34,161,216,0.10)',
              animation: 'glowShift 4s ease-in-out infinite',
            }}
          >
            {isSubmitting ? 'Securing access\u2026' : 'Enter the ProHormone Encyclopedia \u2192'}
          </button>

          <div className="mt-3 text-[11px] text-slate-600 text-center">
            No spam. This unlocks access and keeps you looped in.
          </div>

          {error && ( <div className="text-red-400 text-xs text-center mt-3 px-3 py-2 rounded-lg" role="status" aria-live="polite" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              {error}
            </div>
          )}
        </form>

        {/* Bottom anchor line */}
        <div className="mt-6 flex justify-center">
          <div className="text-[9px] font-mono tracking-[0.25em] uppercase" style={{ color: 'rgba(34,161,216,0.25)' }}>
            PROOF OVER HYPE
          </div>
        </div>
      </div>
    </div>
  );
}
