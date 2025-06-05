'use client';

import { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "@/app/clientLayout";

export type ReviewType = {
    id: string;
    rating: number;
    comment: string;
    user?: { username?: string; id?: string };
    userId?: string;
};

type ReviewProps = {
    reviews?: ReviewType[];
    productId: string;
    onReviewAdded?: (newReviews: ReviewType[]) => void;
};

// Helper to safely extract user info from unknown object
function extractUser(user: unknown): { username?: string; id?: string } | undefined {
    if (user && typeof user === 'object') {
        const u = user as Record<string, unknown>;
        return {
            username: typeof u.username === 'string' ? u.username : undefined,
            id: typeof u.id === 'string' ? u.id : undefined,
        };
    }
    return undefined;
}

// Accepts any review shape from backend and normalizes it
export function normalizeReview(r: Record<string, unknown>): ReviewType {
    return {
        id: String(r.id),
        rating: typeof r.rating === 'number' ? r.rating : (r.rating == null ? 0 : Number(r.rating)),
        comment: typeof r.comment === 'string' ? r.comment : '',
        user: extractUser(r.user),
        userId: typeof r.userId === 'string' ? r.userId : extractUser(r.user)?.id,
    };
}

export default function Review({ reviews = [], productId, onReviewAdded }: ReviewProps) {
    const session = useSession();
    const userId = session?.userId;
    const [localReviews, setLocalReviews] = useState<ReviewType[]>(reviews.map(normalizeReview));
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [anonymous, setAnonymous] = useState(false);
    const utils = trpc.useUtils();
    const createReview = trpc.crud.createReview.useMutation();

    useEffect(() => {
        let isSame = true;
        const norm = reviews.map(normalizeReview);
        if (norm.length !== localReviews.length) isSame = false;
        else {
            for (let i = 0; i < norm.length; i++) {
                if (norm[i].id !== localReviews[i]?.id) {
                    isSame = false;
                    break;
                }
            }
        }
        if (!isSame) setLocalReviews(norm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(reviews)]);

    const hasReviewed = localReviews.some(
        (review) => (review.user && review.user.id === userId) || review.userId === userId
    );
    const allRatings = localReviews.map(r => typeof r.rating === 'number' ? r.rating : 0);
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
            if (anonymous) {
                setError("Anonymous reviews are not supported by the backend.");
                setSubmitting(false);
                return;
            }
            const res = await createReview.mutateAsync({ userId, productId, rating, comment });
            const newReview: ReviewType = {
                id: String(res.id),
                rating: typeof res.rating === "number" ? res.rating : 0,
                comment: typeof res.comment === 'string' ? res.comment : '',
                user: undefined, // No res.user, so skip
                userId: anonymous ? undefined : (typeof res.userId === 'string' ? res.userId : userId),
            };
            const newReviews: ReviewType[] = [...localReviews, newReview];
            setComment("");
            setRating(5);
            setAnonymous(false);
            setLocalReviews(newReviews);
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
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                id="anonymous"
                                type="checkbox"
                                checked={anonymous}
                                onChange={e => setAnonymous(e.target.checked)}
                                className="accent-blue-600"
                            />
                            <label htmlFor="anonymous" className="text-sm select-none cursor-pointer">Submit as anonymous</label>
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
            {localReviews && localReviews.length > 0 ? (
                <ul className="space-y-4 mt-4">
                    {localReviews.map((review) => (
                        <li key={review.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-semibold text-blue-700 flex items-center gap-1">
                                    <svg className="w-5 h-5 text-yellow-400 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                                    {typeof review.rating === 'number' ? review.rating : 0}
                                </span>
                                <span className="text-gray-600 text-sm flex items-center gap-1">
                                    {review.user?.username
                                        ? review.user.username
                                        : review.userId
                                            ? <><svg className="w-4 h-4 text-green-600 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Anonymous</>
                                            : <><svg className="w-4 h-4 text-green-600 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Anonymous</>
                                    }
                                </span>
                            </div>
                            <p className="text-gray-800 whitespace-pre-line">{review.comment}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 mt-4">No reviews yet.</p>
            )}
        </div>
    );
}