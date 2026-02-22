import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
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
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getTierDisplay = (tier) => {
    switch (tier) {
      case 'premium':
        return 'Brother in Arms';
      case 'lab_rat':
        return 'Lab Rat';
      default:
        return tier;
    }
  };

  const getTierBadgeClass = (tier) => {
    switch (tier) {
      case 'premium':
        return 'tier-badge premium';
      case 'lab_rat':
        return 'tier-badge lab-rat';
      default:
        return 'tier-badge';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content) => {
    if (content.length > 150) {
      return content.substring(0, 150) + '...';
    }
    return content;
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1 className="username">{profile.user.username}</h1>
        <div className={getTierBadgeClass(profile.user.tier)}>
          {getTierDisplay(profile.user.tier)}
        </div>
        <div className="join-date">
          Member since {formatDate(profile.user.created_at)}
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {profile.recentActivity.length === 0 ? (
          <div className="no-activity">No recent activity</div>
        ) : (
          <div className="activity-list">
            {profile.recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="activity-item">
                <div className="activity-type">
                  {item.type === 'thread' ? 'Started thread:' : 'Posted in:'}
                </div>
                <div className="activity-content">
                  {item.type === 'thread' ? (
                    <Link to={`/t/${item.id}`} className="activity-link">
                      {item.title}
                    </Link>
                  ) : (
                    <>
                      <Link to={`/t/${item.thread_id}`} className="activity-link">
                        {item.thread_title}
                      </Link>
                      <div className="post-preview">
                        {formatContent(item.content)}
                      </div>
                    </>
                  )}
                </div>
                <div className="activity-date">
                  {formatDate(item.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;