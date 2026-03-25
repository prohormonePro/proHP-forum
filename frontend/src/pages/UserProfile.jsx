import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BackButton from '../components/layout/BackButton';
import './UserProfile.css';

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
      <div className="profile-container">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prohp-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
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
    <div className="profile-container">
      <BackButton fallback="/" />

      {/* Profile Header — username + badge centered */}
      <div className="bg-slate-900 rounded-lg p-6 mb-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl font-bold text-slate-200">{user.username}</h1>
          <span className={`tier-badge tier-${user.tier}`}>
            {TIER_NAMES[user.tier] || user.tier}
          </span>
        </div>
        {(user.is_founding_member || user.id <= 1000) && (
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
        <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
          We search for proof, above the hype.
        </p>
      </div>

      {/* Community Intel CTA — compact, full-width below header */}
      <Link
        to="/community-intel"
        className="prohp-card block mb-6 no-underline"
        style={{ padding: '0.75rem 1rem', textDecoration: 'none', borderColor: 'rgba(34,157,216,.2)', transition: 'border-color 0.2s' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#229DD8', fontSize: '0.85rem', fontWeight: 600 }}>Community Intel</div>
            <div className="text-slate-500 text-xs" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Real user reports &amp; dosage data from 12,500+ YouTube comments
            </div>
          </div>
          <div style={{ color: '#229DD8', fontSize: '1.1rem', flexShrink: 0 }}>&#8594;</div>
        </div>
      </Link>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Threads */}
        <div className="activity-section">
          <h2 className="text-xl font-bold text-slate-200 mb-4">Recent Threads</h2>
          {recentActivity.threads.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.threads.map((thread) => (
                <div key={thread.id} className="bg-slate-900 rounded-lg p-4">
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
          <h2 className="text-xl font-bold text-slate-200 mb-4">Recent Posts</h2>
          {recentActivity.posts.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.posts.map((post) => (
                <div key={post.id} className="bg-slate-900 rounded-lg p-4">
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
    </div>
  );
}
