import { useState } from 'react';
import { api } from '../hooks/api';
import useAuthStore from '../stores/auth';

export default function GenesisGate({ onComplete }) {
  const user = useAuthStore((s) => s.user);
  const [age, setAge] = useState('');
  const [yearsLifting, setYearsLifting] = useState('');
  const [trtHrt, setTrtHrt] = useState(false);
  const [trtCompound, setTrtCompound] = useState('');
  const [trtDose, setTrtDose] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!age || parseInt(age) < 16 || parseInt(age) > 100) {
      setError('Please enter a valid age (16-100)');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('prohp_at');
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          age: parseInt(age),
          years_lifting: yearsLifting ? parseInt(yearsLifting) : null,
          trt_hrt: trtHrt,
          trt_compound: trtHrt ? trtCompound : null,
          trt_dose: trtHrt ? trtDose : null,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Save failed - status ' + res.status); }
      // Refresh user data
      await useAuthStore.getState().fetchMe();
      onComplete?.();
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const ic = "w-full rounded-xl border border-slate-700 bg-slate-950/50 py-2.5 px-4 text-white text-base placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all";

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div className="bg-slate-900 border border-[#229DD8]/20 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl shadow-[#229DD8]/5">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#229DD8]/10 flex items-center justify-center text-[#229DD8] font-bold text-2xl mx-auto mb-4">
            {user?.username?.charAt(0).toUpperCase() || 'P'}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Establish Your Baseline</h2>
          <p className="text-sm text-slate-400">Your biological context makes every cycle log 10x more valuable.</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Age *</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min="16" max="100" placeholder="45" className={ic} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Years Lifting</label>
              <input type="number" value={yearsLifting} onChange={(e) => setYearsLifting(e.target.value)} min="0" max="60" placeholder="12" className={ic} />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer py-2">
              <input type="checkbox" checked={trtHrt} onChange={(e) => setTrtHrt(e.target.checked)} className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-[#229DD8] focus:ring-[#229DD8]" />
              <div>
                <span className="text-sm font-medium text-white">Currently on TRT / HRT</span>
                <p className="text-[11px] text-slate-500">This context is critical for accurate cycle analysis</p>
              </div>
            </label>
          </div>
          {trtHrt && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Compound</label>
                <input type="text" value={trtCompound} onChange={(e) => setTrtCompound(e.target.value)} placeholder="Test Cyp" maxLength={40} className={ic} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dose</label>
                <input type="text" value={trtDose} onChange={(e) => setTrtDose(e.target.value)} placeholder="150mg/wk" maxLength={30} className={ic} />
              </div>
            </div>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={handleSubmit} disabled={saving || !age}
            className="w-full bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] disabled:opacity-50 text-white font-bold text-sm rounded-xl py-3 transition-all">
            {saving ? 'Saving...' : 'Lock In Baseline'}
          </button>
        </div>
      </div>
    </div>
  );
}
