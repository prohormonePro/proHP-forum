import React, { useState, useEffect, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || '';

export default function EncyclopediaGate({ onUnlock }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [honeypotValue, setHoneypotValue] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmSource(params.get('utm_source') || '');
    setUtmMedium(params.get('utm_medium') || '');
    setUtmCampaign(params.get('utm_campaign') || '');
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          'bot-field': honeypotValue,
          source: 'Forum Encyclopedia Gate',
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed.');
      }

      onUnlock();
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const showVideo = !videoFailed;
  const videoPlaying = showVideo && videoReady;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617]">

      {/* LAYER 1: Always-on premium gradient (never black on any screen size) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(1100px 700px at 50% 25%, rgba(0,198,255,.14), transparent 58%), radial-gradient(900px 520px at 20% 40%, rgba(0,112,243,.16), transparent 60%), linear-gradient(180deg, #020617 0%, #000000 100%)',
        }}
      />

      {/* LAYER 2: Subtle texture so mobile isn't flat */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,.08) 0%, transparent 42%)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* LAYER 3: Desktop video (fades in only when canplay fires) */}
      {showVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          ref={videoRef}
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover object-[center_32%] transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          style={{ filter: isDesktop ? 'brightness(0.42) contrast(1.18) saturate(0.75) blur(1.5px) hue-rotate(15deg)' : 'brightness(0.85) contrast(1.10) saturate(0.80) blur(0px)' }}
          onCanPlay={() => { setVideoReady(true); if (videoRef.current) videoRef.current.playbackRate = 0.08; }}
          onError={() => { setVideoFailed(true); setVideoReady(false); }}
          onStalled={() => setTimeout(() => { if (!videoReady) { setVideoFailed(true); } }, 8000)}
        >
          <source src="/videos/Prohormones_slow4x.mp4" type="video/mp4" />
        </video>
      )}
      {/* STAGE_100: Fallback when video fails on desktop */}
      {videoFailed && (
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 35%, rgba(30,30,40,1) 0%, rgba(10,10,15,1) 70%)',
        }} />
      )}

      {/* LAYER 4: Cinematic overlays ONLY when video is actually visible */}
      {videoPlaying && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/35 to-black/90" />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 42%, transparent 40%, rgba(0,0,0,.60) 100%)',
            }}
          />
          {/* LAYER 5: Film grain texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px',
            }}
          />
          {/* LAYER 6: Corner vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 30%, rgba(0,0,0,.55) 100%)',
            }}
          />
        </>
      )}

      {/* FORM */}
      <div className="relative z-10 max-w-md sm:max-w-lg lg:max-w-xl w-full mx-auto px-4 py-12 lg:py-16">
        <form
          onSubmit={handleSubmit}
          className="bg-[rgba(15,23,42,0.40)] md:bg-[rgba(15,23,42,0.75)] backdrop-blur-2xl backdrop-brightness-[0.85] md:backdrop-brightness-[0.4] border border-white/[0.08] ring-1 ring-inset ring-white/[0.05] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_24px_80px_rgba(0,0,0,.70)]"
        >
          <div className="mb-5 text-center">
            <div className="text-[11px] text-white/60 mb-1 uppercase tracking-[0.18em]" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>I searched{'\u2026'} found nothing.</div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>So I built it.</div>
            <div className="text-sm font-semibold text-white/80 mb-2">
              Every benefit. Every side effect. For <span className="text-white font-black">EVERY</span> prohormone.
            </div>
            <div className="text-xs text-white/50 mb-4">
              52+ compounds reviewed {'\u00B7'} 2M+ YouTube views {'\u00B7'} 200+ consultations
            </div>
            <div className="text-xs text-white/55 italic">
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
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/45 focus:border-[#229DD8] focus:shadow-[0_0_0_4px_rgba(34,157,216,.35)] focus:bg-black/40 outline-none transition-all"
            />
            <input
              type="text"
              name="last_name"
              autoComplete="family-name"
              required
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/45 focus:border-[#229DD8] focus:shadow-[0_0_0_4px_rgba(34,157,216,.35)] focus:bg-black/40 outline-none transition-all"
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
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/45 focus:border-[#229DD8] focus:shadow-[0_0_0_4px_rgba(34,157,216,.35)] focus:bg-black/40 outline-none transition-all mb-5"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white font-black text-sm py-4 rounded-full transition-all disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "linear-gradient(180deg, #2bb5e8 0%, #229DD8 50%, #1a7eb0 100%)", boxShadow: "0 10px 32px rgba(34,157,216,.40), 0 0 60px rgba(34,157,216,.15)" }}
          >
            {isSubmitting ? 'Securing access\u2026' : 'Enter the ProHormone Encyclopedia \u2192'}
          </button>

          <div className="mt-3 text-[11px] text-white/40 text-center">
            No spam. This unlocks access and keeps you looped in.
          </div>

          {error && (
            <div className="text-red-300 text-xs text-center mt-3" role="status" aria-live="polite">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
