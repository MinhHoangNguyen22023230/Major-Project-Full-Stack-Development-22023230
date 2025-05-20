"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function ReviewPage() {
    const { data: reviews, isLoading, error } = trpc.crud.getReviews.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!reviews || reviews.length === 0) return <div className="p-8">No reviews found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Reviews</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">User ID</th>
                            <th className="px-4 py-2 border">Product ID</th>
                            <th className="px-4 py-2 border">Rating</th>
                            <th className="px-4 py-2 border">Comment</th>
                            <th className="px-4 py-2 border">Created At</th>
                            <th className="px-4 py-2 border">Updated At</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{review.id}</td>
                                <td className="px-4 py-2 border">{review.userId}</td>
                                <td className="px-4 py-2 border">{review.productId}</td>
                                <td className="px-4 py-2 border">{review.rating}</td>
                                <td className="px-4 py-2 border">{review.comment}</td>
                                <td className="px-4 py-2 border">{review.createdAt}</td>
                                <td className="px-4 py-2 border">{review.updatedAt}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/review/${review.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}