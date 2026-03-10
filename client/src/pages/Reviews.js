import { useState, useEffect } from 'react';
import { getSessions, createReview, getUserReviews } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function Reviews() {
  const { user } = useAuth();
  const [completedSessions, setCompletedSessions] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewModal, setReviewModal] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('write');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [sessRes, revRes] = await Promise.all([
        getSessions(),
        getUserReviews(user._id),
      ]);
      setCompletedSessions(sessRes.data.filter((s) => s.status === 'completed'));
      setMyReviews(revRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      await createReview({
        sessionId: reviewModal._id,
        rating: form.rating,
        comment: form.comment,
      });
      toast.success('Review submitted!');
      setReviewModal(null);
      setForm({ rating: 5, comment: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, readOnly = false }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition`}
        >
          <Star
            className={`h-6 w-6 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reviews</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('write')}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'write' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Write Review
        </button>
        <button
          onClick={() => setTab('received')}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'received' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          My Reviews ({myReviews.length})
        </button>
      </div>

      {tab === 'write' ? (
        completedSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No completed sessions to review yet.
          </div>
        ) : (
          <div className="space-y-4">
            {completedSessions.map((session) => {
              const partner = session.participants?.find((p) => p._id !== user._id);
              return (
                <div key={session._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar src={partner?.avatar} name={partner?.name} size="sm" />
                      <div>
                        <p className="font-semibold text-gray-900">{partner?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setReviewModal(session);
                        setForm({ rating: 5, comment: '' });
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition"
                    >
                      Leave Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        myReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No reviews received yet.</div>
        ) : (
          <div className="space-y-4">
            {myReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start space-x-3">
                  <Avatar src={review.reviewer?.avatar} name={review.reviewer?.name} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{review.reviewer?.name}</p>
                      <StarRating value={review.rating} readOnly />
                    </div>
                    {review.comment && <p className="text-gray-600 mt-2">{review.comment}</p>}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Leave a Review</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="How was your experience?"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
