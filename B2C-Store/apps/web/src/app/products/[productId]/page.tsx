"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type ReviewType = {
  id: string;
  rating: number;
  comment: string;
  user?: { username?: string; id?: string };
};

type ReviewProps = {
  reviews?: ReviewType[];
  productId: string;
  onReviewAdded?: (newReviews: ReviewType[]) => void;
};

export default function Review({ reviews = [], productId, onReviewAdded }: ReviewProps) {
  const userId = useCurrentUser();
  const hasReviewed = reviews.some(
    (review) => review.user && review.user.id === userId
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const utils = trpc.useUtils();
  const createReview = trpc.crud.createReview.useMutation();
  const updateProduct = trpc.crud.updateProduct.useMutation();

  // Calculate average rating
  const allRatings = reviews.map(r => r.rating);
  const avgRating = allRatings.length ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) : 0;
  const avgRatingFixed = avgRating.toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (!userId) {
        setError("You must be logged in to submit a review.");
        setSubmitting(false);
        return;
      }
      if (rating < 1 || rating > 5) {
        setError("Rating must be between 1 and 5.");
        setSubmitting(false);
        return;
      }
      if (hasReviewed) {
        setError("You have already reviewed this product.");
        setSubmitting(false);
        return;
      }
      const res = await createReview.mutateAsync({ userId, productId, rating, comment });
      // Add new review to list, ensuring rating is a number and comment is a string
      const newReview: ReviewType = {
        id: res.id,
        rating: typeof res.rating === "number" ? res.rating : 0,
        comment: res.comment ?? "",
        user: { username: res.user?.username || "You", id: userId }
      };
      const newReviews: ReviewType[] = [...reviews, newReview];
      // Recalculate average
      const newAvg = (
        newReviews.reduce((a, b) => a + (typeof b.rating === "number" ? b.rating : 0), 0) /
        newReviews.length
      ).toFixed(1);
      // Update product rating
      await updateProduct.mutateAsync({ id: productId, data: { rating: Number(newAvg) } });
      setComment("");
      setRating(5);
      if (onReviewAdded) onReviewAdded(newReviews);
      if (utils.crud.findProductById.invalidate) utils.crud.findProductById.invalidate({ id: productId });
    } catch (err) {
      setError((err as Error)?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-2">Reviews</h2>
      <div className="mb-4">
        <span className="font-semibold">Average Rating: </span>
        <span className="text-yellow-500">★ {avgRatingFixed}</span>
      </div>
      {userId ? (
        hasReviewed ? (
          <div className="mb-6 text-green-600 font-semibold">
            You have already reviewed this product.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded shadow">
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="rating" className="font-semibold">Your Rating:</label>
              <select id="rating" value={rating} onChange={e => setRating(Number(e.target.value))} className="border rounded px-2 py-1">
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <textarea
              className="w-full border rounded p-2 mb-2"
              rows={3}
              placeholder="Write your review..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
            />
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )
      ) : (
        <div className="mb-6 text-gray-600">Please log in to submit a review.</div>
      )}
      {reviews && reviews.length > 0 ? (
        <ul className="space-y-2">
          {reviews.map((review) => (
            <li key={review.id} className="border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{review.user?.username || "Anonymous"}:</span>
                <span className="text-yellow-500">★ {review.rating}</span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}
    </div>
  );
}