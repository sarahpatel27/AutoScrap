import { useState, useEffect } from 'react';
import {
  fetchAdminReviews,
  createAdminReview,
  updateAdminReview,
  toggleAdminReviewVisibility,
  deleteAdminReview,
} from '../../services/adminStore';
import { showToast } from './ToastContainer';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function ReviewsManagementSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'visible' | 'hidden'
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    vehicle: '',
    date: '',
    text: '',
    isVisible: true,
  });

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminReviews();
      if (data && data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Error loading admin reviews:', err);
      showToast(err.message || 'Failed to load reviews.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const getTodayFormattedDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      rating: 5,
      vehicle: '',
      date: getTodayFormattedDate(),
      text: '',
      isVisible: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (review) => {
    setIsEditing(true);
    setEditingId(review.id);
    setFormData({
      name: review.name || '',
      rating: review.rating || 5,
      vehicle: review.vehicle || '',
      date: review.date || getTodayFormattedDate(),
      text: review.text || '',
      isVisible: review.isVisible !== false,
    });
    setModalOpen(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter the reviewer name.', 'warning');
      return;
    }
    if (!formData.text.trim()) {
      showToast('Please enter the review text.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await updateAdminReview(editingId, formData);
        showToast('Review updated successfully!', 'success');
        setReviews((prev) =>
          prev.map((r) => (r.id === editingId ? res.review : r))
        );
      } else {
        const res = await createAdminReview(formData);
        showToast('New review added successfully!', 'success');
        if (res.review) {
          setReviews((prev) => [res.review, ...prev]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save review error:', err);
      showToast(err.message || 'Failed to save review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (review) => {
    const newStatus = !review.isVisible;
    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, isVisible: newStatus } : r))
    );

    try {
      await toggleAdminReviewVisibility(review.id, newStatus);
      showToast(
        `Review marked as ${newStatus ? 'Visible' : 'Hidden'}.`,
        'success'
      );
    } catch (err) {
      console.error('Toggle visibility error:', err);
      // Revert optimistic update
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, isVisible: !newStatus } : r))
      );
      showToast(err.message || 'Failed to update visibility.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await deleteAdminReview(reviewToDelete.id);
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      showToast('Review deleted permanently.', 'success');
    } catch (err) {
      console.error('Delete review error:', err);
      showToast(err.message || 'Failed to delete review.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  // Metrics computation
  const totalCount = reviews.length;
  const visibleCount = reviews.filter((r) => r.isVisible).length;
  const hiddenCount = totalCount - visibleCount;
  const visibleReviews = reviews.filter((r) => r.isVisible);
  const avgRating =
    visibleReviews.length > 0
      ? (
          visibleReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) /
          visibleReviews.length
        ).toFixed(1)
      : '4.8';

  // Filter & search
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'visible' && !r.isVisible) return false;
    if (activeFilter === 'hidden' && r.isVisible) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name?.toLowerCase().includes(q);
      const matchText = r.text?.toLowerCase().includes(q);
      const matchVehicle = r.vehicle?.toLowerCase().includes(q);
      return matchName || matchText || matchVehicle;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Reviews</span>
            <span className="text-base">💬</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-['Manrope']">
            {totalCount}
          </p>
          <span className="text-[11px] text-gray-400 font-medium">All recorded reviews</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>Visible Online</span>
            <span className="text-base">🟢</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#0f7b4f] font-['Manrope']">
            {visibleCount}
          </p>
          <span className="text-[11px] text-emerald-700/80 font-medium">Shown on homepage</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
            <span>Hidden</span>
            <span className="text-base">⚪</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-700 font-['Manrope']">
            {hiddenCount}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Temporarily inactive</span>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase tracking-wider">
            <span>Overall Score</span>
            <span className="text-base">⭐</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <p className="text-2xl sm:text-3xl font-black text-amber-900 font-['Manrope']">
              {avgRating}
            </p>
            <span className="text-xs text-amber-700 font-bold">/ 5.0</span>
          </div>
          <span className="text-[11px] text-amber-800/80 font-medium">Calculated from live reviews</span>
        </div>
      </div>

      {/* Control Bar: Filters, Search, and + Add Review Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#0f7b4f] text-white shadow-xs'
                : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('visible')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeFilter === 'visible'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
            }`}
          >
            Visible ({visibleCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('hidden')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeFilter === 'hidden'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
            }`}
          >
            Hidden ({hiddenCount})
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[190px] sm:w-64">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 pl-8 text-xs font-medium text-slate-900 focus:border-[#0f7b4f] focus:bg-white focus:outline-none"
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-gray-400">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-xs text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0f7b4f] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#095737] hover:scale-102 active:scale-95 shrink-0"
          >
            <span>+</span>
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-xs text-gray-400 font-semibold">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#0f7b4f] border-t-transparent mb-2" />
          <p>Loading customer reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center space-y-3">
          <span className="text-3xl">⭐</span>
          <p className="text-sm font-bold text-slate-700">No reviews found</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery
              ? `No reviews matched "${searchQuery}". Try changing your search query.`
              : 'There are no reviews matching this filter. Click "+ Add Review" to add your first customer review.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-2 inline-flex items-center gap-1 rounded-xl bg-[#0f7b4f] px-4 py-2 text-xs font-black text-white hover:bg-[#095737] transition cursor-pointer"
            >
              + Add Customer Review
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReviews.map((review) => {
            const initials = review.name
              ? review.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '??';

            return (
              <div
                key={review.id}
                className={`group relative rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md ${
                  review.isVisible ? 'border-gray-200/90' : 'border-slate-200 bg-slate-50/50 opacity-85'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Avatar, Name, Rating & Quote */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100/80 font-['Manrope'] text-xs font-black text-[#0f7b4f]">
                      {initials}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-['Manrope'] text-sm sm:text-base font-black text-slate-900">
                          {review.name}
                        </h3>

                        {/* Stars */}
                        <div className="flex items-center text-amber-400 text-sm tracking-[1px]">
                          {'★'.repeat(review.rating || 5)}
                          <span className="text-gray-300">
                            {'☆'.repeat(Math.max(0, 5 - (review.rating || 5)))}
                          </span>
                          <span className="ml-1 text-xs font-black text-slate-700">
                            ({review.rating}/5)
                          </span>
                        </div>

                        {/* Visibility Pill Badge */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            review.isVisible
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              review.isVisible ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                          {review.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>

                      {/* Vehicle & Date metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                        {review.vehicle && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                            🚗 {review.vehicle}
                          </span>
                        )}
                        {review.date && (
                          <span className="text-gray-400">📅 {review.date}</span>
                        )}
                      </div>

                      {/* Review Text Body */}
                      <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                        "{review.text}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Controls & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(review)}
                      title={`Click to ${review.isVisible ? 'hide from' : 'show on'} website`}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer border ${
                        review.isVisible
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span className="text-[11px]">{review.isVisible ? '👁️ Shown' : '🚫 Hidden'}</span>
                      <span className="text-[10px] underline font-bold opacity-75">Toggle</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(review)}
                        title="Edit Review"
                        className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-700 shadow-2xs hover:border-[#0f7b4f] hover:text-[#0f7b4f] transition cursor-pointer"
                      >
                        ✏️ Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setReviewToDelete(review);
                          setDeleteModalOpen(true);
                        }}
                        title="Delete Review"
                        className="rounded-xl border border-red-200 bg-red-50/50 px-2.5 py-1.5 text-xs font-black text-red-600 shadow-2xs hover:bg-red-100 transition cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Review Modal */}
      {modalOpen && (
        <div
          onClick={() => !submitting && setModalOpen(false)}
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl space-y-5 cursor-default max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-lg text-[#0f7b4f]">
                  ⭐
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Manrope']">
                    {isEditing ? 'Edit Customer Review' : 'Add New Customer Review'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {isEditing
                      ? 'Update review details, rating, or visibility.'
                      : 'Enter customer feedback to publish on the website.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 hover:bg-gray-200 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4">
              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Customer / Reviewer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. James W. or Sarah K."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-[#0f7b4f] focus:ring-1 focus:ring-[#0f7b4f] focus:outline-none"
                />
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Rating (out of 5) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: starValue })}
                        className="text-2xl transition hover:scale-120 cursor-pointer focus:outline-none"
                        title={`${starValue} Stars`}
                      >
                        <span
                          className={
                            starValue <= formData.rating
                              ? 'text-amber-400'
                              : 'text-gray-300'
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-black text-slate-800 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                    {formData.rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Vehicle & Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Vehicle Model <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ford Focus 2012"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0f7b4f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Display Date <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12 July 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0f7b4f] focus:outline-none"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Customer Review Quote <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Very straightforward. I received a fair estimate, the collection was arranged quickly, and the driver was professional."
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs font-normal text-slate-900 focus:border-[#0f7b4f] focus:ring-1 focus:ring-[#0f7b4f] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Visible on Website Checkbox */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/80 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="h-4 w-4 rounded text-[#0f7b4f] focus:ring-[#0f7b4f] cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Show immediately on Homepage
                  </span>
                  <span className="text-gray-500 font-normal">
                    If checked, this review will be active and visible to public website visitors.
                  </span>
                </div>
              </label>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0f7b4f] px-5 py-2.5 text-xs font-black text-white shadow-sm hover:bg-[#095737] transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Save Changes' : 'Add Review'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        title="Delete Customer Review?"
        subtitle={reviewToDelete ? `Review by ${reviewToDelete.name}` : 'Delete Confirmation'}
        warningText={
          reviewToDelete
            ? `Are you sure you want to permanently delete the review from "${reviewToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to permanently delete this review?'
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
