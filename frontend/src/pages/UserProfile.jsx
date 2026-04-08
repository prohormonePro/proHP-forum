import { useState, useEffect } from 'react';
import useAuthStore from '../stores/auth';
import { useParams, Link } from 'react-router-dom';
import BackButton from '../components/layout/BackButton';
// CSS replaced by Tailwind glassmorphism

const TIER_NAMES = {
  free: 'Free',
  inner_circle: 'Inner Circle',
  elite: 'Elite',
  admin: 'Admin'
};

export default function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reputation, setReputation] = useState(null);
  const currentUser = useAuthStore((s) => s.user);
  const isOwner = currentUser?.username === username;
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ age: '', years_lifting: '', trt_hrt: false, trt_compound: '', trt_dose: '' });
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setEditForm({
      age: user?.age || '',
      years_lifting: user?.years_lifting || '',
      trt_hrt: user?.trt_hrt || false,
      trt_compound: user?.trt_compound || '',
      trt_dose: user?.trt_dose || '',
    });
    setEditing(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('prohp_at');
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          age: editForm.age ? parseInt(editForm.age) : null,
          years_lifting: editForm.years_lifting ? parseInt(editForm.years_lifting) : null,
          trt_hrt: editForm.trt_hrt,
          trt_compound: editForm.trt_compound || null,
          trt_dose: editForm.trt_dose || null,
        }),
      });
      if (res.ok) {
        setProfile(prev => ({
          ...prev,
          user: { ...prev.user, ...editForm, age: editForm.age ? parseInt(editForm.age) : null, years_lifting: editForm.years_lifting ? parseInt(editForm.years_lifting) : null }
        }));
        setEditing(false);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${username}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load user profile');
          }
          return;
        }

        const data = await response.json();
        setProfile(data);
        // Fetch reputation
        try {
          const repRes = await fetch('/api/users/reputation/' + username);
          if (repRes.ok) {
            const repData = await repRes.json();
            setReputation(repData);
          }
        } catch (e) { console.error('Rep fetch:', e); }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prohp-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">{error}</h2>
          <Link
            to="/"
            className="text-prohp-400 hover:text-prohp-300 underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const { user, recentActivity } = profile;
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <BackButton fallback="/" />

      {/* Profile Header — username + badge centered */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-md rounded-xl border border-[#229DD8]/15 p-6 sm:p-8 mb-4 text-center shadow-lg shadow-[#229DD8]/5">
        <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl font-bold text-slate-200">{user.username}</h1>
          {isOwner && !editing && (
            <button onClick={startEdit} className="text-xs px-2.5 py-1 rounded-lg bg-[#229DD8]/10 border border-[#229DD8]/20 text-[#229DD8] hover:bg-[#229DD8]/20 transition-all">Edit Profile</button>
          )}
          <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${
            user.tier === 'admin' ? 'bg-red-500/15 border border-red-500/30 text-red-400' :
            user.tier === 'inner_circle' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' :
            'bg-slate-800 border border-white/5 text-slate-400'
          }`}>{TIER_NAMES[user.tier] || user.tier}</span>
        </div>
        {(new Date(user.created_at) < new Date("2026-04-01")) && (
          <span
            style={{
              display: 'inline-block',
              marginTop: '0.35rem',
              marginBottom: '0.25rem',
              padding: '0.15rem 0.6rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#229DD8',
              border: '1px solid rgba(34,157,216,.35)',
              borderRadius: '9999px',
              background: 'rgba(34,157,216,.08)',
              textTransform: 'uppercase',
            }}
          >
            Founding Member
          </span>
        )}
        <p className="text-slate-400 text-sm" style={{ marginTop: '0.25rem' }}>Joined: {joinDate}</p>
        {(user.age || user.trt_hrt || user.years_lifting) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
            {user.age && <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>Age: {user.age}</span>}
            {user.years_lifting && <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>{user.years_lifting} Yrs Lifting</span>}
            {user.trt_hrt && <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>{user.trt_compound || 'TRT'}{user.trt_dose ? ' \u00b7 ' + user.trt_dose : ''}</span>}
          </div>
        )}
        <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
          We search for proof, above the hype.
        </p>

        {editing && (
          <div className="mt-4 pt-4 border-t border-white/5 text-left">
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Age</label>
                <input type="number" value={editForm.age} onChange={e => setEditForm(p => ({...p, age: e.target.value}))}
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-950/50 py-2 px-3 text-white text-sm focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Years Lifting</label>
                <input type="number" value={editForm.years_lifting} onChange={e => setEditForm(p => ({...p, years_lifting: e.target.value}))}
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-950/50 py-2 px-3 text-white text-sm focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all" />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.trt_hrt} onChange={e => setEditForm(p => ({...p, trt_hrt: e.target.checked}))}
                    className="rounded border-slate-600 bg-slate-800 text-[#229DD8] focus:ring-[#229DD8]" />
                  <span className="text-sm text-slate-300">On TRT / HRT</span>
                </label>
              </div>
              {editForm.trt_hrt && (
                <>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">TRT Compound</label>
                    <input type="text" value={editForm.trt_compound} onChange={e => setEditForm(p => ({...p, trt_compound: e.target.value}))}
                      placeholder="Test Cyp" maxLength={40}
                      className="w-full rounded-lg border border-slate-700/50 bg-slate-950/50 py-2 px-3 text-white text-sm focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">TRT Dose</label>
                    <input type="text" value={editForm.trt_dose} onChange={e => setEditForm(p => ({...p, trt_dose: e.target.value}))}
                      placeholder="200mg/wk" maxLength={30}
                      className="w-full rounded-lg border border-slate-700/50 bg-slate-950/50 py-2 px-3 text-white text-sm focus:border-[#229DD8] focus:ring-1 focus:ring-[#229DD8] transition-all" />
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={saveProfile} disabled={saving}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#229DD8] to-[#1a7fb0] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#229DD8]/20 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-5 py-2 rounded-lg bg-slate-800 text-slate-400 text-sm hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reputation */}
      {reputation && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10 p-5 mb-4 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-white">Reputation</h2>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
              reputation.rep_tier === 'elite' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' :
              reputation.rep_tier === 'verified' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' :
              reputation.rep_tier === 'contributor' ? 'bg-[#229DD8]/15 border border-[#229DD8]/30 text-[#229DD8]' :
              'bg-slate-800 border border-white/5 text-slate-400'
            }`}>{reputation.rep_tier}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="text-center bg-slate-950/50 rounded-lg py-2.5 border border-white/8">
              <div className="text-lg font-extrabold text-white">{reputation.cycle_count}</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">Cycles</div>
            </div>
            <div className="text-center bg-slate-950/50 rounded-lg py-2.5 border border-white/8">
              <div className="text-lg font-extrabold text-white">{reputation.comment_count}</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">Comments</div>
            </div>
            <div className="text-center bg-slate-950/50 rounded-lg py-2.5 border border-white/8">
              <div className="text-lg font-extrabold text-[#229DD8]">{reputation.total_likes}</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">Upvotes</div>
            </div>
          </div>

        </div>
      )}

      {/* Community Intel CTA — compact, full-width below header */}
      <Link to="/community-intel" className="block mb-4 bg-slate-900/60 backdrop-blur-xl rounded-xl border border-[#229DD8]/15 p-4 hover:border-[#229DD8]/30 transition-all shadow-sm hover:shadow-[#229DD8]/10" style={{ textDecoration: 'none' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#229DD8]">Community Intel</p>
            <p className="text-xs text-slate-500">Real user reports and dosage data from 1,034+ data points</p>
          </div>
          <span className="text-[#229DD8] text-lg shrink-0">&#8594;</span>
        </div>
      </Link>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Threads */}
        <div className="activity-section">
          <h2 className="text-lg font-bold text-white mb-3">Recent Threads</h2>
          {recentActivity.threads.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.threads.map((thread) => (
                <div key={thread.id} className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/5 p-4">
                  <Link
                    to={`/t/${thread.id}`}
                    className="text-prohp-400 hover:text-prohp-300 font-medium block mb-2"
                  >
                    {thread.title}
                  </Link>
                  <p className="text-slate-500 text-sm">
                    {new Date(thread.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No recent threads</p>
          )}
        </div>

        {/* Recent Posts */}
        <div className="activity-section">
          <h2 className="text-lg font-bold text-white mb-3">Recent Posts</h2>
          {recentActivity.posts.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.posts.map((post) => (
                <div key={post.id} className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/5 p-4">
                  <p className="text-slate-300 mb-2">
                    {truncateText(post.body)}
                  </p>
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/t/${post.thread_id}`}
                      className="text-prohp-400 hover:text-prohp-300 text-sm"
                    >
                      View Thread →
                    </Link>
                    <p className="text-slate-500 text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No recent posts</p>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-600 text-center mt-6 mb-4">Skepticism without data is fear. Skepticism with data is power.</p>
    </div>
  );
}
