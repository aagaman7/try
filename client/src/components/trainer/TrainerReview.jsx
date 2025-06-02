import React, { useState } from 'react';
import apiService from '../../services/apiService';
import { StarIcon } from '@heroicons/react/20/solid';

const StarRating = ({ rating, setRating, editable }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => editable && setRating && setRating(star)}
        className="focus:outline-none"
        disabled={!editable}
      >
        <StarIcon
          className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      </button>
    ))}
  </div>
);

const TrainerReview = ({ trainerId, reviews, user, onReviewAdded, onReviewEdited, onReviewDeleted }) => {
  const [form, setForm] = useState({ rating: 0, review: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 0, review: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const userReview = user && reviews.find(r => r.user && (r.user._id === user._id || r.user._id === user.id));
  const hasMembership = !!user;

  // console.log('Debug Review Component:', {
  //   user,
  //   hasMembership,
  //   userReview,
  //   showAddForm,
  //   reviews
  // });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const reviewData = { trainerId, rating: form.rating, review: form.review };
      const newReview = await apiService.createTrainerReview(reviewData);
      onReviewAdded && onReviewAdded(newReview);
      setForm({ rating: 0, review: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setEditForm({ rating: review.rating, review: review.review });
  };

  const handleEditSubmit = async (e, reviewId) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updated = await apiService.editTrainerReview(reviewId, { rating: editForm.rating, review: editForm.review });
      onReviewEdited && onReviewEdited(updated);
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteTrainerReview(reviewId);
      onReviewDeleted && onReviewDeleted(reviewId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {/* Add Review Button */}
      {user && hasMembership && !userReview && !showAddForm && (
        <button
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowAddForm(true)}
        >
          Add Review
        </button>
      )}
      {/* Add Review Form */}
      {user && hasMembership && !userReview && showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <div className="flex items-center">
            <span className="mr-2 font-medium">Your Rating:</span>
            <StarRating rating={form.rating} setRating={r => setForm(f => ({ ...f, rating: r }))} editable />
          </div>
          <textarea
            name="review"
            value={form.review}
            onChange={handleChange}
            placeholder="Write your review..."
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading || !form.rating}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowAddForm(false)} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 && <div className="text-gray-600">No reviews yet.</div>}
        {reviews.map((r) => (
          <div key={r._id} className="bg-white p-4 rounded shadow flex flex-col">
            <div className="flex items-center mb-1">
              <StarRating rating={r.rating} editable={false} />
              <span className="ml-2 text-gray-700 font-medium">{r.user?.name || 'User'}</span>
              <span className="ml-2 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            {editingId === r._id ? (
              <form onSubmit={e => handleEditSubmit(e, r._id)} className="space-y-2 mt-2">
                <StarRating rating={editForm.rating} setRating={r => setEditForm(f => ({ ...f, rating: r }))} editable />
                <textarea
                  name="review"
                  value={editForm.review}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading || !editForm.rating}>Save</button>
                  <button type="button" className="bg-gray-300 px-3 py-1 rounded" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-gray-700 mt-1">{r.review}</p>
                {user && r.user && (r.user._id === user._id || r.user._id === user.id) && (
                  <div className="flex gap-2 mt-2">
                    <button className="text-blue-600 underline" onClick={() => handleEdit(r)}>Edit</button>
                    <button className="text-red-600 underline" onClick={() => handleDelete(r._id)}>Delete</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerReview; 