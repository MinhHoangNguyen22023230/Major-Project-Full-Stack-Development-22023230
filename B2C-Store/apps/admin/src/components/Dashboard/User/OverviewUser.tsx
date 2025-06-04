import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function OverviewUser() {
    const { data: users = [], isLoading } = trpc.crud.getUsers.useQuery();
    const { data: addresses = [] } = trpc.crud.getAddresses.useQuery();
    const { data: reviews = [] } = trpc.crud.getReviews.useQuery();
    const { data: wishlists = [] } = trpc.crud.getWishLists.useQuery();
    const { data: carts = [] } = trpc.crud.getCarts.useQuery();

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const newUsers = users.filter(u => u.createdAt && new Date(u.createdAt) > oneMonthAgo).length;
        const activeUsers = users.filter(u => u.updatedAt && new Date(u.updatedAt) > oneMonthAgo).length;
        return {
            total: users.length,
            newUsers,
            activeUsers,
            withAddress: users.filter(u => addresses.some(a => a.userId === u.id)).length,
            withReview: users.filter(u => reviews.some(r => r.userId === u.id)).length,
            withWishlist: users.filter(u => wishlists.some(w => w.userId === u.id)).length,
            withCart: users.filter(u => carts.some(c => c.userId === u.id)).length,
        };
    }, [users, addresses, reviews, wishlists, carts]);

    return (
        <div className="main-section p-4 bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            <h1 className="mb-5 font-bold text-[var(--card-title)]">User Overview</h1>
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 grid-rows-3 gap-2">
                    <div className="p-4 four-by-four-border rounded-tl-lg bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Total Users</p>
                        <h1 className="text-3xl font-bold">{stats.total}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-tr-lg bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>New Users (last 30d)</p>
                        <h1 className="text-3xl font-bold">{stats.newUsers}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Active Users (last 30d)</p>
                        <h1 className="text-3xl font-bold">{stats.activeUsers}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Users with Address</p>
                        <h1 className="text-3xl font-bold">{stats.withAddress}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-bl-lg bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Users with Wishlist</p>
                        <h1 className="text-3xl font-bold">{stats.withWishlist}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-br-lg bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Users with Cart</p>
                        <h1 className="text-3xl font-bold">{stats.withCart}</h1>
                    </div>
                </div>
            )}
        </div>
    );
}