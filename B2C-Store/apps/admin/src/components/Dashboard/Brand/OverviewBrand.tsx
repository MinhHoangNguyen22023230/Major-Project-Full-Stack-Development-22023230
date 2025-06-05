import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

// Define a Brand type for type safety
interface Product {
    id: string;
    rating?: number | null;
}
interface Brand {
    id: string;
    name: string;
    imageUrl?: string | null;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
    products?: Product[];
}

export default function OverviewBrand() {
    const { data: brandsRaw = [], isLoading } = trpc.crud.getBrands.useQuery();
    const brands: Brand[] = brandsRaw;
    const stats = useMemo((): {
        total: number;
        newBrands: number;
        mostProductsBrand: Brand | null;
        mostProductsCount: number;
        highestAvgRatingBrand: Brand | null;
        highestAvgRating: number;
        brandsWithNoProducts: number;
        mostRecentBrand: Brand | null;
        mostRecentDate: Date | null;
    } => {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const total = brands.length;
        const newBrands = brands.filter(b => b.createdAt && new Date(b.createdAt) > oneMonthAgo).length;
        let mostProductsBrand: Brand | null = null;
        let mostProductsCount = 0;
        let highestAvgRatingBrand: Brand | null = null;
        let highestAvgRating = -1;
        let mostRecentBrand: Brand | null = null;
        let mostRecentDate: Date | null = null;
        const brandsWithNoProducts = brands.filter(b => !b.products || b.products.length === 0).length;
        brands.forEach(b => {
            const prodCount = b.products ? b.products.length : 0;
            if (prodCount > mostProductsCount) {
                mostProductsCount = prodCount;
                mostProductsBrand = b;
            }
            if (b.products && b.products.length > 0) {
                const avg = b.products.reduce((sum, p) => sum + (typeof p.rating === "number" ? p.rating : 0), 0) / b.products.length;
                if (avg > highestAvgRating) {
                    highestAvgRating = avg;
                    highestAvgRatingBrand = b;
                }
            }
            if (b.createdAt) {
                const created = new Date(b.createdAt);
                if (!mostRecentDate || created > mostRecentDate) {
                    mostRecentDate = created;
                    mostRecentBrand = b;
                }
            }
        });
        return {
            total,
            newBrands,
            mostProductsBrand,
            mostProductsCount,
            highestAvgRatingBrand,
            highestAvgRating,
            brandsWithNoProducts,
            mostRecentBrand,
            mostRecentDate,
        };
    }, [brands]);

    return (
        <div className="main-section p-4 bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            <h1 className="mb-5 font-bold text-[var(--card-title)]">Brand Overview</h1>
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 grid-rows-3 gap-2">
                    <div className="p-4 four-by-four-border rounded-tl-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Total Brands</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.total}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-tr-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>New Brands (last 30d)</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.newBrands}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Brand with Most Products</p>
                        <h1 className="text-lg font-bold text-[var(--card-title)]">
                            {stats.mostProductsBrand ? `${stats.mostProductsBrand.name} (${stats.mostProductsCount})` : "-"}
                        </h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Brand with Highest Avg. Product Rating</p>
                        <h1 className="text-lg font-bold text-[var(--card-title)]">
                            {stats.highestAvgRatingBrand ? `${stats.highestAvgRatingBrand.name} (${stats.highestAvgRating.toLocaleString(undefined, { maximumFractionDigits: 2 })})` : "-"}
                        </h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-bl-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Brands with No Products</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.brandsWithNoProducts}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-br-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Most Recently Created Brand</p>
                        <h1 className="text-lg font-bold text-[var(--card-title)]">
                            {stats.mostRecentBrand ? `${stats.mostRecentBrand.name} (${stats.mostRecentDate?.toLocaleDateString()})` : "-"}
                        </h1>
                    </div>
                </div>
            )}
        </div>
    );
}
