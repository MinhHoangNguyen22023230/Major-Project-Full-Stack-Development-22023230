import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function OverviewReview() {
    const { data: reviews = [], isLoading } = trpc.crud.getReviews.useQuery();
    // Optionally, get products and users for richer stats
    const { data: products = [] } = trpc.crud.getProducts.useQuery();
    const { data: users = [] } = trpc.crud.getUsers.useQuery();

    const stats = useMemo(() => {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const newReviews = reviews.filter(r => r.createdAt && new Date(r.createdAt) > oneMonthAgo).length;
        const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (typeof r.rating === "number" ? r.rating : 0), 0) / reviews.length : 0;
        const withComment = reviews.filter(r => r.comment && r.comment.trim().length > 0).length;
        const anonymous = reviews.filter(r => r.user === null || r.user === undefined).length;
        // Distribution by rating (1-5)
        const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            if (typeof r.rating === "number" && r.rating >= 1 && r.rating <= 5) {
                ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1;
            }
        });
        // Most reviewed product
        let mostReviewedProduct = null;
        if (products.length > 0) {
            const productReviewCounts: Record<string, number> = {};
            reviews.forEach(r => {
                if (r.productId) productReviewCounts[r.productId] = (productReviewCounts[r.productId] || 0) + 1;
            });
            const top = Object.entries(productReviewCounts).sort((a, b) => b[1] - a[1])[0];
            if (top) {
                const prod = products.find(p => p.id === top[0]);
                mostReviewedProduct = prod ? `${prod.name} (${top[1]})` : `ID: ${top[0]} (${top[1]})`;
            }
        }
        // Most active reviewer
        let mostActiveUser = null;
        if (users.length > 0) {
            const userReviewCounts: Record<string, number> = {};
            reviews.forEach(r => {
                if (r.userId) userReviewCounts[r.userId] = (userReviewCounts[r.userId] || 0) + 1;
            });
            const top = Object.entries(userReviewCounts).sort((a, b) => b[1] - a[1])[0];
            if (top) {
                const user = users.find(u => u.id === top[0]);
                mostActiveUser = user ? `${user.username} (${top[1]})` : `ID: ${top[0]} (${top[1]})`;
            }
        }
        return {
            total: reviews.length,
            newReviews,
            avgRating,
            withComment,
            anonymous,
            ratingDist,
            mostReviewedProduct,
            mostActiveUser,
        };
    }, [reviews, products, users]);

    return (
        <div className="main-section p-4 bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            <h1 className="mb-5 font-bold text-[var(--card-title)]">Review Overview</h1>
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 grid-rows-4 gap-2">
                    <div className="p-4 four-by-four-border rounded-tl-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Total Reviews</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.total}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-tr-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>New Reviews (last 30d)</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.newReviews}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Avg. Rating</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.avgRating.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Reviews with Comment</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.withComment}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Anonymous Reviews</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.anonymous}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Most Reviewed Product</p>
                        <h1 className="text-lg font-bold text-[var(--card-title)]">{stats.mostReviewedProduct || '-'}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Most Active Reviewer</p>
                        <h1 className="text-lg font-bold text-[var(--card-title)]">{stats.mostActiveUser || '-'}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-br-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Rating Distribution</p>
                        <div className="flex gap-2 mt-2">
                            {Object.entries(stats.ratingDist).map(([star, count]) => (
                                <div key={star} className="flex flex-col items-center">
                                    <span className="text-xs">{star}★</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
