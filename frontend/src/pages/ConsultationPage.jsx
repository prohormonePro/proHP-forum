import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../components/layout/BackButton';
import useAuthStore from '../stores/auth';

const API = import.meta.env.VITE_API_URL || '';

export default function ConsultationPage() {
  var [loading, setLoading] = useState(false);
  var user = useAuthStore(function(s) { return s.user; });
  var tier = user ? user.tier : null;
  var isInnerCircle = tier === 'inner_circle' || tier === 'admin';
  var price = isInnerCircle ? 400 : 500;

  async function handleCheckout() {
    setLoading(true);
    try {
      var res = await fetch(API + '/api/stripe/create-consultation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: isInnerCircle ? 'inner_circle' : 'free' }),
      });
      var data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout unavailable. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton />

        <h1 className="text-2xl font-bold mt-6 mb-1">$500 1-on-1 Consultation</h1>
        <p className="text-base text-[var(--prohp-blue)] font-medium mb-4">
          Need real one-on-one help? Book a consult.
        </p>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Get personalized guidance from Travis - compound selection, cycle planning, PCT protocol, and bloodwork interpretation. The written post-call report is part of what makes this valuable.
        </p>

        <div className="prohp-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">What you get</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--prohp-blue)] mt-0.5">&#10003;</span>
              <span>45 minute video call with Travis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--prohp-blue)] mt-0.5">&#10003;</span>
              <span>Personalized compound/cycle recommendation document</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--prohp-blue)] mt-0.5">&#10003;</span>
              <span>PCT protocol tailored to your cycle</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--prohp-blue)] mt-0.5">&#10003;</span>
              <span>Bloodwork guidance - what to test and when</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--prohp-blue)] mt-0.5">&#10003;</span>
              <span>Written summary document sent after the call</span>
            </li>
          </ul>
        </div>

        <div className="prohp-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Sample consultation deliverable</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            Every consultation includes a detailed written document. Here is what a real deliverable looks like with the client name removed.
          </p>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-xs text-[var(--text-secondary)] border border-white/[0.06]">
            <p className="font-semibold text-[var(--text-primary)] mb-2">Consultation Summary - [Client]</p>
            <p className="mb-1"><strong>Goal:</strong> Lean mass gain with minimal side effects</p>
            <p className="mb-1"><strong>Recommended cycle:</strong> 8-week protocol</p>
            <p className="mb-1"><strong>Primary compound:</strong> Selected based on bloodwork and goals</p>
            <p className="mb-1"><strong>PCT:</strong> Full protocol with timing</p>
            <p className="mb-1"><strong>Bloodwork:</strong> Pre, mid-cycle, and post-PCT panels specified</p>
            <p className="mb-1"><strong>Neurogenesis support:</strong> Counter-lethargy stack included</p>
            <p className="mb-1"><strong>Dosing:</strong> Start-low protocol with titration guidance</p>
            <p className="mt-2 italic">Full document is 2-3 pages with specific dosing, timing, and monitoring guidance.</p>
          </div>
        </div>

        <div className="prohp-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold">{'$' + price}</p>
              {isInnerCircle ? (
                <p className="text-xs text-[var(--prohp-blue)]">Inner Circle member price</p>
              ) : (
                <p className="text-xs text-[var(--text-secondary)]">One-time consultation fee <span className="text-[var(--prohp-blue)]">($400 for Inner Circle members)</span></p>
              )}
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="prohp-btn-primary w-full text-center py-3"
          >
            {loading ? 'Redirecting to checkout...' : 'Book a Consultation'}
          </button>
          <p className="text-[10px] text-[var(--text-secondary)] text-center mt-3">
            Secure checkout powered by Stripe. You will receive scheduling details after payment.
          </p>
        </div>

        <p className="text-xs text-[var(--text-secondary)] text-center mt-6">
          Reach out on{' '}
          <a href="https://youtube.com/@ProHormonePro" target="_blank" rel="noopener noreferrer" className="text-[var(--prohp-blue)] hover:underline">YouTube</a>,{' '}
          <a href="https://instagram.com/prohormonepro" target="_blank" rel="noopener noreferrer" className="text-[var(--prohp-blue)] hover:underline">Instagram</a>{' '}
          or through the{' '}
          <Link to="/" className="text-[var(--prohp-blue)] hover:underline">forum</Link>.
        </p>
      </div>
    </div>
  );
}
