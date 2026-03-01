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
    description: ''
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createCycleMutation = useMutation({
    mutationFn: (cycleData) => api.post('/api/cycles', cycleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      setFormData({ title: '', compound_name: '', dose: '', duration_weeks: '', start_date: '', description: '' });
      setError('');
      onSuccess();
    },
    onError: (err) => {
      setError(err.message || 'Failed to create cycle log');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      description: formData.description.trim() || ''
    });
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-white/10 p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">Title *</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="RAD-140 8-Week Recomp" required className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 px-4 text-white placeholder-slate-500 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8]" />
        </div>
        <div>
          <label htmlFor="compound_name" className="block text-sm font-medium text-white mb-2">Compound Name *</label>
          <input type="text" id="compound_name" name="compound_name" value={formData.compound_name} onChange={handleInputChange} placeholder="RAD-140" required className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 px-4 text-white placeholder-slate-500 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="dose" className="block text-sm font-medium text-white mb-2">Dose</label>
            <input type="text" id="dose" name="dose" value={formData.dose} onChange={handleInputChange} placeholder="10mg/day" className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 px-4 text-white placeholder-slate-500 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8]" />
          </div>
          <div>
            <label htmlFor="duration_weeks" className="block text-sm font-medium text-white mb-2">Duration (weeks)</label>
            <input type="number" id="duration_weeks" name="duration_weeks" value={formData.duration_weeks} onChange={handleInputChange} placeholder="8" min="1" max="52" className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 px-4 text-white placeholder-slate-500 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8]" />
          </div>
        </div>
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-white mb-2">Start Date</label>
          <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 px-4 text-white placeholder-slate-500 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8]" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Goals, baseline bloodwork, expected outcomes, notes..." className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 px-4 text-white placeholder-slate-500 focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] resize-vertical" />
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={createCycleMutation.isPending} className="flex-1 bg-[#229DD8] hover:bg-[#1b87bc] disabled:bg-[#229DD8]/50 text-white font-semibold rounded-xl py-3 px-6 transition-colors">
            {createCycleMutation.isPending ? 'Saving...' : 'Start Cycle Log'}
          </button>
          <button type="button" onClick={onSuccess} className="flex-1 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl py-3 px-6 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
