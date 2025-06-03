"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "@/app/clientLayout";
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

export function Review({ reviews = [], productId, onReviewAdded }: ReviewProps) {
    const { userId } = useSession();
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");

    const { mutate: addReview } = trpc.crud.createReview.useMutation({
        onSuccess: (newReview) => {
            // Normalize newReview to match ReviewType
            const normalizedReview: ReviewType = {
                id: newReview.id,
                rating: typeof newReview.rating === "number" ? newReview.rating : 0,
                comment: newReview.comment ?? "",
                user: {
                    id: newReview.user?.id,
                    username: newReview.user?.username,
                },
            };
            onReviewAdded?.([...reviews, normalizedReview]);
            setNewRating(0);
            setNewComment("");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return; // Only allow logged-in users
        if (newRating && newComment) {
            addReview({ productId, userId, rating: newRating, comment: newComment });
        }
    };

    return (
        <div>
            <h2>Reviews</h2>
            {userId ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>
                            Rating:
                            <input
                                type="number"
                                value={newRating}
                                onChange={(e) => setNewRating(Number(e.target.value))}
                                min={1}
                                max={5}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Comment:
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <button type="submit">Add Review</button>
                </form>
            ) : (
                <div className="text-gray-600 mb-4">Please log in to add a review.</div>
            )}
            <div>
                {reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id}>
                            <p>
                                <strong>{review.user?.username || "Anonymous"}</strong> ({review.rating} stars)
                            </p>
                            <p>{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
