import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/layout/BackButton';
import useAuthStore from '../stores/auth';

export default function CreateThread() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [roomSlug, setRoomSlug] = useState('');
  const [compoundSlug, setCompoundSlug] = useState('');
  const [rooms, setRooms] = useState([]);
  const [compounds, setCompounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tierRequired, setTierRequired] = useState(null);

  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [initialDataError, setInitialDataError] = useState('');
  const [formSubmissionError, setFormSubmissionError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    setInitialDataLoading(true);
    setInitialDataError('');

    Promise.all([
      fetch('/api/rooms', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      fetch('/api/compounds', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ])
      .then(async ([roomsRes, compoundsRes]) => {
        if (!roomsRes.ok) {
          const errorData = await roomsRes.json().catch(() => ({}));
          if (roomsRes.status === 401) {
            navigate('/login');
            throw new Error('Unauthorized');
          }
          throw new Error(errorData.error || `Failed to load rooms: ${roomsRes.status}`);
        }
        if (!compoundsRes.ok) {
          const errorData = await compoundsRes.json().catch(() => ({}));
          if (compoundsRes.status === 401) {
            navigate('/login');
            throw new Error('Unauthorized');
          }
          throw new Error(errorData.error || `Failed to load compounds: ${compoundsRes.status}`);
        }
        const roomsData = await roomsRes.json();
        const compoundsData = await compoundsRes.json();
        setRooms(roomsData);
        setCompounds(compoundsData);
      })
      .catch(err => {
        if (err.message !== 'Unauthorized') {
          setInitialDataError(err.message || 'Failed to load initial data');
        }
      })
      .finally(() => {
        setInitialDataLoading(false);
      });
  }, [accessToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmissionError('');
    setTierRequired(null);

    if (title.length < 6) {
      setFormSubmissionError('Title must be at least 6 characters');
      return;
    }
    if (body.length < 20) {
      setFormSubmissionError('Body must be at least 20 characters');
      return;
    }
    if (!roomSlug) {
      setFormSubmissionError('Select a room');
      return;
    }

    setLoading(true);

    const payload = {
      room_slug: roomSlug,
      title,
      body
    };
    if (compoundSlug) {
      payload.compound_slug = compoundSlug;
    }

    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        navigate(`/t/${data.thread.id}`);
      } else if (response.status === 403 && data.code === 'TIER_REQUIRED') {
        setTierRequired(data.required_tier);
      } else {
        setFormSubmissionError(data.error || 'Failed to create thread');
      }
    } catch {
      setFormSubmissionError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <BackButton fallback="/" label="Back to Forum" />
        <h1 className="text-2xl font-bold mb-8">Create Thread</h1>

        {initialDataLoading && (
          <div className="text-center text-slate-400 py-8">
            Loading forum data...
          </div>
        )}

        {initialDataError && !initialDataLoading && (
          <div className="text-red-400 text-sm mb-4">
            {initialDataError}
          </div>
        )}

        {!initialDataLoading && !initialDataError && (
          <>
            {tierRequired && (
              <div className="bg-slate-800 border border-[#229DD8] rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
                <p className="text-slate-300 mb-4">
                  Posting in this room requires {tierRequired} tier access.
                </p>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-[#229DD8] hover:bg-[#1e8bc3] px-6 py-2 rounded font-medium transition-colors"
                >
                  Unlock Posting
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="threadTitle" className="block text-sm font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="threadTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:border-[#229DD8] focus:outline-none"
                  placeholder="Enter thread title (6+ characters)"
                />
              </div>

              <div>
                <label htmlFor="roomSelect" className="block text-sm font-medium mb-2">
                  Room
                </label>
                <select
                  id="roomSelect"
                  value={roomSlug}
                  onChange={(e) => setRoomSlug(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:border-[#229DD8] focus:outline-none"
                >
                  <option value="">Select a room</option>
                  {rooms.map(room => (
                    <option key={room.slug} value={room.slug}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="compoundSelect" className="block text-sm font-medium mb-2">
                  Compound (Optional)
                </label>
                <select
                  id="compoundSelect"
                  value={compoundSlug}
                  onChange={(e) => setCompoundSlug(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:border-[#229DD8] focus:outline-none"
                >
                  <option value="">No compound</option>
                  {compounds.map(compound => (
                    <option key={compound.slug} value={compound.slug}>
                      {compound.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="threadBody" className="block text-sm font-medium mb-2">
                  Body
                </label>
                <textarea
                  id="threadBody"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:border-[#229DD8] focus:outline-none"
                  placeholder="Enter thread content (20+ characters)"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {formSubmissionError && !tierRequired && (
                <div className="text-red-400 text-sm">{formSubmissionError}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#229DD8] hover:bg-[#1e8bc3] disabled:opacity-50 px-6 py-3 rounded font-medium transition-colors"
              >
                {loading ? 'Posting...' : 'Post Thread'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
