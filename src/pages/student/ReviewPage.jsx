import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Edit,
  Trash2,
  Filter,
  Clock,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { reviewApi } from "../../api/reviewApi";
import { useAuth } from "../../context/AuthContext";

const ReviewPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [reviewsData, summaryData, myReviewData] = await Promise.all([
        reviewApi.getCourseReviews(courseId, { page: 0, size: 20 }),
        reviewApi.getRatingSummary(courseId),
        reviewApi.getMyReview(courseId).catch(() => null),
      ]);

      if (reviewsData?.content) {
        setReviews(reviewsData.content);
      }

      if (summaryData) {
        setRatingSummary(summaryData);
      }

      if (myReviewData?.data) {
        setMyReview(myReviewData.data);
        setFormData({
          rating: myReviewData.data.rating || 5,
          comment: myReviewData.data.comment || "",
        });
      }
    } catch (err) {
      console.error("[ReviewPage] Failed to load reviews", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (myReview) {
        await reviewApi.updateReview(myReview.id, formData);
        toast.success("Review updated!");
      } else {
        await reviewApi.createReview({
          courseId: parseInt(courseId),
          rating: formData.rating,
          comment: formData.comment,
        });
        toast.success("Review submitted!");
      }
      setShowForm(false);
      await fetchReviews();
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await reviewApi.deleteReview(reviewId);
      toast.success("Review deleted!");
      await fetchReviews();
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const handleEditReview = () => {
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-slate-900 mb-2">Course Reviews</h1>
          <p className="text-slate-500">
            See what students are saying about this course
          </p>
        </motion.div>

        {/* Rating Summary */}
        {ratingSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-5xl font-black text-slate-900">
                  {ratingSummary.averageRating?.toFixed(1) || "4.5"}
                </div>
                <div className="flex items-center justify-center gap-1 text-amber-400 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      fill={star <= Math.round(ratingSummary.averageRating || 4.5) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-500">
                  {ratingSummary.totalReviews || 0} reviews
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingSummary.ratingDistribution?.[star] || 0;
                  const percentage = ratingSummary.totalReviews ? (count / ratingSummary.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 w-8">{star} star</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-500 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* My Review Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Your Review</h3>
            {myReview && !showForm && (
              <button
                onClick={handleEditReview}
                className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>

          <AnimatePresence>
            {showForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className={`p-2 rounded-lg transition ${
                            formData.rating >= star
                              ? "text-amber-400"
                              : "text-slate-300 hover:text-amber-400"
                          }`}
                        >
                          <Star size={24} fill={formData.rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Share your experience with this course..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          {myReview ? "Update" : "Submit"} Review
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <>
                {myReview ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={star <= myReview.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-500">
                        {new Date(myReview.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700">{myReview.comment}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-orange-500 hover:text-orange-600 font-medium transition"
                  >
                    Write a Review
                  </button>
                )}
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* All Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="font-bold text-slate-900">All Reviews ({reviews.length})</h3>

          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold">
                    {review.studentName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{review.studentName || "Student"}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={14} />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {review.studentId === user?.id && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>

              <p className="text-slate-700">{review.comment}</p>

              {review.instructorResponse && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-700 mb-1">Instructor Response</p>
                  <p className="text-sm text-indigo-900">{review.instructorResponse}</p>
                </div>
              )}
            </motion.div>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Star size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Reviews Yet</h3>
              <p className="text-slate-500">Be the first to review this course!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewPage;
