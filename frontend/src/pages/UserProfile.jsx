import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './UserProfile.css';

const TIER_NAMES = {
  lab_rat: 'Lab Rat',
  premium: 'Brother in Arms',
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
      {/* Profile Header */}
      <div className="bg-slate-900 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-slate-200">{user.username}</h1>
          <span className={`tier-badge tier-${user.tier}`}>
            {TIER_NAMES[user.tier] || user.tier}
          </span>
        </div>
        <p className="text-slate-400">Joined: {joinDate}</p>
      </div>

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