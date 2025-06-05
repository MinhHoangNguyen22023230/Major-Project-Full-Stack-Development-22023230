import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function OverviewProduct() {
    const { data: products = [], isLoading } = trpc.crud.getProducts.useQuery();
    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const newProducts = products.filter(p => p.createdAt && new Date(p.createdAt) > oneMonthAgo).length;
        const outOfStock = products.filter(p => typeof p.stock === "number" && p.stock <= 0).length;
        const inStock = products.filter(p => typeof p.stock === "number" && p.stock > 0).length;
        const avgPrice = products.length > 0 ? products.reduce((sum, p) => sum + (typeof p.price === "number" ? p.price : 0), 0) / products.length : 0;
        const avgRating = products.length > 0 ? products.reduce((sum, p) => sum + (typeof p.rating === "number" ? p.rating : 0), 0) / products.length : 0;
        return {
            total: products.length,
            newProducts,
            outOfStock,
            inStock,
            avgPrice,
            avgRating,
        };
    }, [products]);

    return (
        <div className="main-section p-4 bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            <h1 className="mb-5 font-bold text-[var(--card-title)]">Product Overview</h1>
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 grid-rows-3 gap-2">
                    <div className="p-4 four-by-four-border rounded-tl-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Total Products</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.total}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-tr-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>New Products (last 30d)</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.newProducts}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>In Stock</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.inStock}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Out of Stock</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.outOfStock}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-bl-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Avg. Price</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">${stats.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-br-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Avg. Rating</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.avgRating.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                </div>
            )}
        </div>
    );
}
