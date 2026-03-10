import { useState, useEffect } from 'react';
import { searchUsers, sendSwapRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search as SearchIcon, Star, MapPin, Send } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [swapModal, setSwapModal] = useState(null);
  const [swapForm, setSwapForm] = useState({ skillOffered: '', skillWanted: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (query.trim()) params.skill = query.trim();
      const { data } = await searchUsers(params);
      setResults(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const openSwapModal = (targetUser) => {
    setSwapModal(targetUser);
    setSwapForm({
      skillOffered: user?.skillsOffered?.[0]?.name || '',
      skillWanted: targetUser.skillsOffered?.[0]?.name || '',
      message: '',
    });
  };

  const handleSendSwap = async () => {
    if (!swapForm.skillOffered || !swapForm.skillWanted) {
      toast.error('Please select skills to swap');
      return;
    }
    setSending(true);
    try {
      await sendSwapRequest({
        to: swapModal._id,
        skillOffered: swapForm.skillOffered,
        skillWanted: swapForm.skillWanted,
        message: swapForm.message,
      });
      toast.success('Swap request sent!');
      setSwapModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Skills</h1>
        <p className="text-gray-600">Find people who can teach you what you want to learn</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Search by skill... (e.g. Python, Guitar, Photoshop)"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No users found. Try a different search.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((person) => (
              <div key={person._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-20" />
                <div className="p-5 -mt-8">
                  <Avatar src={person.avatar} name={person.name} size="lg" className="border-4 border-white shadow mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                  {person.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" /> {person.location}
                    </p>
                  )}
                  {person.rating?.count > 0 && (
                    <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400" /> {person.rating.average} ({person.rating.count} reviews)
                    </p>
                  )}
                  {person.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{person.bio}</p>}

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Can Teach</p>
                    <div className="flex flex-wrap gap-1">
                      {person.skillsOffered?.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => openSwapModal(person)}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition text-sm"
                  >
                    <Send className="h-4 w-4" /> Send Swap Request
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Swap Request Modal */}
      {swapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Send Swap Request to {swapModal.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill you'll teach</label>
                <select
                  value={swapForm.skillOffered}
                  onChange={(e) => setSwapForm({ ...swapForm, skillOffered: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select a skill</option>
                  {user?.skillsOffered?.map((s, i) => (
                    <option key={i} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill you want to learn</label>
                <select
                  value={swapForm.skillWanted}
                  onChange={(e) => setSwapForm({ ...swapForm, skillWanted: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select a skill</option>
                  {swapModal.skillsOffered?.map((s, i) => (
                    <option key={i} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                <textarea
                  value={swapForm.message}
                  onChange={(e) => setSwapForm({ ...swapForm, message: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Introduce yourself..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSwapModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSwap}
                disabled={sending}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
