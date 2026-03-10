import { useState, useEffect } from 'react';
import { getSessions, createSession, completeSession, cancelSession, getSwapRequests } from '../api';
import toast from 'react-hot-toast';
import { Calendar, Clock, Video, MapPin, Check, X, Plus } from 'lucide-react';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [acceptedSwaps, setAcceptedSwaps] = useState([]);
  const [form, setForm] = useState({
    swapRequestId: '',
    date: '',
    duration: 60,
    type: 'video',
    notes: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessRes, swapRes] = await Promise.all([getSessions(), getSwapRequests()]);
      setSessions(sessRes.data);
      setAcceptedSwaps(swapRes.data.filter((s) => s.status === 'accepted'));
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.swapRequestId || !form.date) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      await createSession(form);
      toast.success('Session scheduled!');
      setShowCreate(false);
      setForm({ swapRequestId: '', date: '', duration: 60, type: 'video', notes: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeSession(id);
      toast.success('Session marked as completed!');
      loadData();
    } catch (err) {
      toast.error('Failed to update session');
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelSession(id);
      toast.success('Session cancelled');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel session');
    }
  };

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition text-sm"
        >
          <Plus className="h-4 w-4" /> Book Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No sessions yet. Book one after a swap request is accepted!
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {session.participants?.map((p) => p.name).join(' & ')}
                    </h3>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${statusColors[session.status]}`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {session.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      {session.type === 'video' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                      {session.type === 'video' ? 'Video Call' : 'In Person'}
                    </span>
                  </div>
                  {session.notes && <p className="text-sm text-gray-500 mt-2">{session.notes}</p>}
                </div>
              </div>

              {session.status === 'scheduled' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleComplete(session._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition"
                  >
                    <Check className="h-4 w-4" /> Mark Complete
                  </button>
                  <button
                    onClick={() => handleCancel(session._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium text-sm hover:bg-red-100 transition"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Book a Session</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Swap Partner</label>
                <select
                  value={form.swapRequestId}
                  onChange={(e) => setForm({ ...form, swapRequestId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select accepted swap</option>
                  {acceptedSwaps.map((swap) => (
                    <option key={swap._id} value={swap._id}>
                      {swap.from?.name} ↔ {swap.to?.name} ({swap.skillOffered} / {swap.skillWanted})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                    min={15}
                    max={480}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="video">Video Call</option>
                    <option value="in-person">In Person</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  maxLength={1000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Any details about the session..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {creating ? 'Booking...' : 'Book Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
