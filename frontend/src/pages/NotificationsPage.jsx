import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react';
import useAuthStore from '../stores/auth';
import BackButton from '../components/layout/BackButton';

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <p className="text-sm text-slate-400 mb-3">Log in to view notifications.</p>
      <Link to="/login" className="prohp-btn-primary text-xs">Log in</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <BackButton fallback="/" />
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-5 h-5 text-[#229DD8]" />
        <h1 className="text-lg font-extrabold text-white">Notifications</h1>
      </div>
      <div className="prohp-card p-8 text-center">
        <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400 mb-1">No notifications yet.</p>
        <p className="text-[10px] text-slate-600">You'll see replies, mentions, and activity here.</p>
      </div>
    </div>
  );
}
