import React, { useEffect, useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function FeedbackSection({ storeType = 'all' }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedNote, setSubmittedNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    async function loadApprovedFeedback() {
      setLoading(true);
      let query = supabase
        .from('feedback')
        .select('id, customer_name, store_type, rating, comment, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (storeType === 'candles' || storeType === 'crochet') {
        query = query.in('store_type', [storeType, 'all']);
      }

      const { data, error } = await query;
      if (!active) return;

      if (!error) {
        setReviews(data ?? []);
      }
      setLoading(false);
    }

    loadApprovedFeedback();
    return () => {
      active = false;
    };
  }, [storeType]);

  async function handleSubmitReview(e) {
    e.preventDefault();
    setErrorMsg('');
    setSubmittedNote('');

    if (!customerName.trim() || !comment.trim()) {
      setErrorMsg('Please enter your name and review.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('feedback').insert([
      {
        customer_name: customerName.trim(),
        store_type:
          storeType === 'candles' || storeType === 'crochet' ? storeType : 'all',
        rating,
        comment: comment.trim(),
        status: 'pending',
      },
    ]);
    setSubmitting(false);

    if (error) {
      setErrorMsg(`Could not submit review: ${error.message}`);
      return;
    }

    setCustomerName('');
    setRating(5);
    setComment('');
    setSubmittedNote('Thank you! Your feedback has been submitted.');
  }

  return (
    <section className="max-w-6xl w-full mx-auto px-4 pb-14 pt-4">
      <div className="rounded-3xl bg-white/90 border border-[#C8A262]/50 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#C8A262]/30">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#B8335A]">
              Customer Love
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2D2226] mt-1">
              Reviews &amp; Feedback
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#5A4A4F]">
            Hear from our community or share your experience with Kirei Collection.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Approved Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {loading ? (
              <p className="text-sm text-[#5A4A4F]">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="rounded-2xl bg-[#FDF6F5] border border-[#C8A262]/40 p-6 text-sm text-[#5A4A4F]">
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="rounded-2xl bg-[#FDF6F5] border border-[#C8A262]/45 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#2D2226]">
                        {rev.customer_name}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F7E4E2] text-[#5A4A4F] border border-[#C8A262]/35">
                        {rev.store_type === 'all' ? 'Kirei' : rev.store_type}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`${rev.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating
                              ? 'fill-[#C8A262] text-[#C8A262]'
                              : 'text-[#C8A262]/35'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-[#2D2226]/90 leading-relaxed">
                    “{rev.comment}”
                  </p>
                </article>
              ))
            )}
          </div>

          {/* Leave a Review Form */}
          <div className="lg:col-span-5 rounded-2xl bg-[#FDF6F5] border border-[#C8A262]/50 p-5 h-fit">
            <h3 className="text-base font-bold text-[#2D2226] mb-3">
              Write a Review
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ananya Sharma"
                  className="w-full rounded-lg bg-white border border-[#C8A262]/60 px-3 py-2 text-sm text-[#2D2226] focus:outline-none focus:border-[#B8335A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className="p-1 rounded-md hover:bg-[#F7E4E2] transition-colors"
                      aria-label={`Rate ${num} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= rating
                            ? 'fill-[#C8A262] text-[#C8A262]'
                            : 'text-[#5A4A4F]/35'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                  Your Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell others about the fragrance, stitching, or packaging..."
                  className="w-full rounded-lg bg-white border border-[#C8A262]/60 px-3 py-2 text-sm text-[#2D2226] focus:outline-none focus:border-[#B8335A]"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  {errorMsg}
                </p>
              )}

              {submittedNote && (
                <div className="flex items-start gap-2 text-xs text-[#2D2226] bg-[#F7E4E2] border border-[#C8A262]/70 rounded-lg p-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B8335A] shrink-0 mt-0.5" />
                  <span>{submittedNote}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#B8335A] hover:bg-[#9E2448] disabled:opacity-50 text-[#FDF6F5] border border-[#C8A262]/60 font-semibold py-2.5 text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}