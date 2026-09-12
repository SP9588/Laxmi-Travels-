import React, { useState } from 'react';
import { Booking, BookingReview } from '../types';
import { 
  Star, 
  X, 
  CheckCircle2, 
  ThumbsUp, 
  ThumbsDown, 
  Car, 
  UserCheck, 
  Clock, 
  Wind, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Check
} from 'lucide-react';

interface BookingReviewModalProps {
  booking: Booking;
  existingReview?: BookingReview;
  onClose: () => void;
  onReviewSubmitted: (updatedBooking: Booking) => void;
}

const COMPLIMENT_TAGS = [
  'Polite & Safe Driving',
  'Spotless Clean Interior',
  'Punctual Pickup',
  'Chilled AC & Fresh Smell',
  'Peaceful & Quiet Ride',
  'Luggage Assistance',
  'Smooth Highway Cruising',
  'Route & Toll Transparency',
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Poor — Disappointed with the trip',
  2: 'Fair — Needs notable improvements',
  3: 'Good — Satisfactory travel experience',
  4: 'Very Good — Highly impressed!',
  5: 'Exceptional — Exceeded all expectations!',
};

export const BookingReviewModal: React.FC<BookingReviewModalProps> = ({
  booking,
  existingReview,
  onClose,
  onReviewSubmitted,
}) => {
  const [overallRating, setOverallRating] = useState<number>(
    existingReview?.rating || booking.rating || 5
  );
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Sub-category ratings
  const [driverRating, setDriverRating] = useState<number>(
    existingReview?.driverRating || 5
  );
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(
    existingReview?.vehicleCleanlinessRating || 5
  );
  const [punctualityRating, setPunctualityRating] = useState<number>(
    existingReview?.punctualityRating || 5
  );
  const [acRating, setAcRating] = useState<number>(
    existingReview?.acComfortRating || 5
  );

  // Tags & Comment
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingReview?.tags || ['Polite & Safe Driving', 'Spotless Clean Interior']
  );
  const [comment, setComment] = useState<string>(
    existingReview?.comment || booking.reviewComment || ''
  );
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(
    existingReview?.wouldRecommend !== undefined ? existingReview.wouldRecommend : true
  );
  const [markCompleted, setMarkCompleted] = useState<boolean>(
    booking.status !== 'TRIP_COMPLETED'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overallRating < 1) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        action: 'RATE',
        rating: overallRating,
        driverRating,
        vehicleCleanlinessRating: cleanlinessRating,
        punctualityRating,
        acComfortRating: acRating,
        reviewComment: comment,
        comment,
        tags: selectedTags,
        wouldRecommend,
        markCompleted,
        actorName: booking.customerName || 'Passenger',
        actorRole: 'CUSTOMER',
      };

      const res = await fetch(`/api/bookings/${booking.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setIsSuccess(true);
        setTimeout(() => {
          onReviewSubmitted(data.booking);
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      setErrorMessage('Network error while submitting feedback. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDisplayRating = hoveredStar !== null ? hoveredStar : overallRating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Trip Context */}
        <div className="bg-slate-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              {existingReview || booking.rating ? 'Update Travel Review' : 'Post-Booking Feedback'}
            </span>
            <span className="font-mono text-xs text-slate-400">
              {booking.id}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            How was your journey?
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {booking.pickup} ➔ {booking.destination} • {booking.vehicleModel} ({booking.vehicleNumber})
          </p>

          {booking.driver && (
            <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300">
                Chauffeur: <strong className="text-white font-semibold">{booking.driver.name}</strong>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                ★ {booking.driver.rating || '4.9'}
              </span>
            </div>
          )}
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your {overallRating}-star review for trip <strong>{booking.id}</strong> has been officially recorded. This helps us maintain top-tier chauffeur standards and commercial compliance across Laxmi Travels.
            </p>
            <div className="flex justify-center gap-1 text-amber-400 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 ${s <= overallRating ? 'fill-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* 1. Overall Star Rating */}
            <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Overall Experience Rating
              </label>

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeDisplayRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      id={`star-rating-btn-${star}`}
                      onClick={() => setOverallRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="p-1.5 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-9 h-9 transition-colors duration-150 ${
                          isFilled
                            ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                            : 'text-slate-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-semibold text-amber-700 h-5">
                {RATING_DESCRIPTIONS[activeDisplayRating] || 'Click to select stars'}
              </p>
            </div>

            {/* 2. Sub-Category Ratings */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                Detailed Aspect Ratings
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Driver Professionalism */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-700 font-medium">Chauffeur</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setDriverRating(s)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= driverRating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Cleanliness */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-700 font-medium">Cleanliness</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCleanlinessRating(s)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= cleanlinessRating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Punctuality */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-700 font-medium">Punctuality</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPunctualityRating(s)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= punctualityRating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* AC & Comfort */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-700 font-medium">AC Comfort</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAcRating(s)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= acRating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Quick Compliment Chips */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Trip Highlights & Compliments</span>
              </label>

              <div className="flex flex-wrap gap-1.5">
                {COMPLIMENT_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-semibold shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Detailed Written Review */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>Passenger Experience Comments</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {comment.length}/500 chars
                </span>
              </div>

              <textarea
                id="review-comment-input"
                rows={3}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share more details about your trip, route comfort, driver hospitality, or cleanliness..."
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {/* 5. Recommendation Switch & Mark Completed */}
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Would you recommend Laxmi Travels?
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Helps other commercial travelers choose verified fleets
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setWouldRecommend(true)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                      wouldRecommend
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Yes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldRecommend(false)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                      !wouldRecommend
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span>No</span>
                  </button>
                </div>
              </div>

              {booking.status !== 'TRIP_COMPLETED' && (
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markCompleted}
                    onChange={(e) => setMarkCompleted(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs font-medium text-amber-900">
                    Mark trip as completed with this review
                  </span>
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-review"
                disabled={isSubmitting || overallRating < 1}
                className="w-2/3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Recording Review...</span>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-slate-950" />
                    <span>{existingReview || booking.rating ? 'Update Review' : 'Submit Review'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
