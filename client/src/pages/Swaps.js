import { useState, useEffect } from 'react';
import { getSwapRequests, acceptSwap, rejectSwap } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Check, X, Clock, ArrowRight } from 'lucide-react';

export default function Swaps() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received');

  useEffect(() => {
    loadSwaps();
  }, []);

  const loadSwaps = async () => {
    try {
      const { data } = await getSwapRequests();
      setSwaps(data);
    } catch (err) {
      toast.error('Failed to load swap requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptSwap(id);
      toast.success('Swap accepted! You can now chat.');
      loadSwaps();
    } catch (err) {
      toast.error('Failed to accept swap');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectSwap(id);
      toast.success('Swap rejected');
      loadSwaps();
    } catch (err) {
      toast.error('Failed to reject swap');
    }
  };

  const received = swaps.filter((s) => s.to?._id === user?._id);
  const sent = swaps.filter((s) => s.from?._id === user?._id);
  const displayed = tab === 'received' ? received : sent;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Swap Requests</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('received')}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'received' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received ({received.length})
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'sent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent ({sent.length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {tab} swap requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((swap) => {
            const otherUser = tab === 'received' ? swap.from : swap.to;
            return (
              <div key={swap._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-indigo-600">
                      {otherUser?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{otherUser?.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">{swap.skillOffered}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{swap.skillWanted}</span>
                      </div>
                      {swap.message && <p className="text-sm text-gray-500 mt-2">{swap.message}</p>}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[swap.status]}`}>
                    {swap.status}
                  </span>
                </div>

                {tab === 'received' && swap.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleAccept(swap._id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition"
                    >
                      <Check className="h-4 w-4" /> Accept
                    </button>
                    <button
                      onClick={() => handleReject(swap._id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium text-sm hover:bg-red-100 transition"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}

                {swap.status === 'pending' && tab === 'sent' && (
                  <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-100 text-sm text-yellow-600">
                    <Clock className="h-4 w-4" /> Waiting for response...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
