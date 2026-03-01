import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../hooks/api';

export default function CycleLogForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    compound_name: '',
    dose: '',
    duration_weeks: '',
    start_date: '',
    description: '',
    bloodwork_url: '',
    before_pic_url: '',
    after_pic_url: ''
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createCycleMutation = useMutation({
    mutationFn: (cycleData) => api.post('/api/cycles', cycleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      setFormData({ title: '', compound_name: '', dose: '', duration_weeks: '', start_date: '', description: '', bloodwork_url: '', before_pic_url: '', after_pic_url: '' });
      setError('');
      onSuccess?.();
    },
    onError: (err) => {
      setError(err?.message || 'Failed to create cycle log');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildDescription = () => {
    const lines = [];
    const base = (formData.description || '').trim();
    if (base) lines.push(base);
    const blood = (formData.bloodwork_url || '').trim();
    const before = (formData.before_pic_url || '').trim();
    const after = (formData.after_pic_url || '').trim();
    const media = [];
    if (blood) media.push('Bloodwork: ' + blood);
    if (before) media.push('Before: ' + before);
    if (after) media.push('After: ' + after);
    if (media.length) {
      if (lines.length) lines.push('');
      lines.push('---');
      lines.push(...media);
    }
    return lines.join('\n');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.title.trim()) { setError('Title is required'); return; }
    if (!formData.compound_name.trim()) { setError('Compound name is required'); return; }
    createCycleMutation.mutate({
      title: formData.title.trim(),
      compound_name: formData.compound_name.trim(),
      dose: formData.dose.trim() || null,
      duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks, 10) || null : null,
      start_date: formData.start_date || null,
      description: buildDescription()
    });
  };

  const inputClass = "w-full rounded-xl border border-slate-700 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-600 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all";

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-[#229DD8]/25 shadow-2xl p-6 md:p-8">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white">Log a Real Cycle</h2>
        <p className="text-sm text-slate-400 mt-1">Real protocol. Real bloodwork. Real outcomes. This is how we learn.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-[#229DD8] uppercase tracking-wider">1. Core Protocol</h3>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-200 mb-2">Log Title *</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., 8-Week AC-262 Recomp" required className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="compound_name" className="block text-sm font-medium text-slate-200 mb-2">Primary Compound *</label>
              <input type="text" id="compound_name" name="compound_name" value={formData.compound_name} onChange={handleInputChange} placeholder="AC-262" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="dose" className="block text-sm font-medium text-slate-200 mb-2">Daily Dose</label>
              <input type="text" id="dose" name="dose" value={formData.dose} onChange={handleInputChange} placeholder="10mg/day" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="duration_weeks" className="block text-sm font-medium text-slate-200 mb-2">Duration (Weeks)</label>
              <input type="number" id="duration_weeks" name="duration_weeks" value={formData.duration_weeks} onChange={handleInputChange} placeholder="8" min="1" max="52" className={inputClass} />
            </div>
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-slate-200 mb-2">Start Date</label>
              <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleInputChange} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="space-y-5 pt-4 border-t border-white/10">
          <div>
            <h3 className="text-sm font-semibold text-[#229DD8] uppercase tracking-wider">2. Tracking Media</h3>
            <p className="text-xs text-slate-500 mt-1">Native uploads coming soon. For now, paste links (Drive / Imgur / Dropbox).</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label htmlFor="bloodwork_url" className="block text-sm font-medium text-slate-200 mb-2">Bloodwork PDF</label>
              <input type="url" id="bloodwork_url" name="bloodwork_url" value={formData.bloodwork_url} onChange={handleInputChange} placeholder="https://drive.google.com/..." className={inputClass} />
            </div>
            <div>
              <label htmlFor="before_pic_url" className="block text-sm font-medium text-slate-200 mb-2">Before Pic</label>
              <input type="url" id="before_pic_url" name="before_pic_url" value={formData.before_pic_url} onChange={handleInputChange} placeholder="https://imgur.com/..." className={inputClass} />
            </div>
            <div>
              <label htmlFor="after_pic_url" className="block text-sm font-medium text-slate-200 mb-2">After Pic</label>
              <input type="url" id="after_pic_url" name="after_pic_url" value={formData.after_pic_url} onChange={handleInputChange} placeholder="https://imgur.com/..." className={inputClass} />
            </div>
          </div>
        </div>

        <div className="space-y-5 pt-4 border-t border-white/10">
          <h3 className="text-sm font-semibold text-[#229DD8] uppercase tracking-wider">3. Log Details</h3>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} placeholder="Goals, baseline stats, training protocol, expected outcomes..." className={inputClass + " resize-vertical"} />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-red-400">!</span>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button type="submit" disabled={createCycleMutation.isPending} className="flex-1 bg-gradient-to-r from-[#229DD8] to-[#1b87bc] hover:from-[#1b87bc] hover:to-[#166e9c] disabled:opacity-50 text-white font-bold rounded-xl py-4 px-6 transition-all shadow-lg hover:shadow-[#229DD8]/20">
            {createCycleMutation.isPending ? 'Committing...' : 'Deploy Cycle Log'}
          </button>
          <button type="button" onClick={onSuccess} className="sm:w-1/3 border border-slate-600 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl py-4 px-6 transition-all">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
