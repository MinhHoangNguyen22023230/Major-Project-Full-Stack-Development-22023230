import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

interface Product { id: string; }
interface Category {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
    products?: Product[];
}

export default function OverviewCategory() {
    const { data: categoriesRaw = [], isLoading } = trpc.crud.getCategories.useQuery();
    const categories: Category[] = categoriesRaw;
    const stats = useMemo((): {
        total: number;
        newCategories: number;
        mostProductsCategory: Category | null;
        mostProductsCount: number;
        categoriesWithNoProducts: number;
        mostRecentCategory: Category | null;
        mostRecentDate: Date | null;
        avgProductsPerCategory: number;
    } => {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const total = categories.length;
        const newCategories = categories.filter(c => c.createdAt && new Date(c.createdAt) > oneMonthAgo).length;
        let mostProductsCategory: Category | null = null;
        let mostProductsCount = 0;
        let mostRecentCategory: Category | null = null;
        let mostRecentDate: Date | null = null;
        let totalProducts = 0;
        const categoriesWithNoProducts = categories.filter(c => !c.products || c.products.length === 0).length;
        categories.forEach(c => {
            const prodCount = c.products ? c.products.length : 0;
            totalProducts += prodCount;
            if (prodCount > mostProductsCount) {
                mostProductsCount = prodCount;
                mostProductsCategory = c;
            }
            if (c.createdAt) {
                const created = new Date(c.createdAt);
                if (!mostRecentDate || created > mostRecentDate) {
                    mostRecentDate = created;
                    mostRecentCategory = c;
                }
            }
        });
        const avgProductsPerCategory = total > 0 ? totalProducts / total : 0;
        return {
            total,
            newCategories,
            mostProductsCategory,
            mostProductsCount,
            categoriesWithNoProducts,
            mostRecentCategory,
            mostRecentDate,
            avgProductsPerCategory,
        };
    }, [categories]);

    return (
        <div className="main-section p-4 bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            <h1 className="mb-5 font-bold text-[var(--card-title)]">Category Overview</h1>
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 grid-rows-3 gap-2">
                    <div className="p-4 four-by-four-border rounded-tl-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Total Categories</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.total}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-tr-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>New Categories (last 30d)</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.newCategories}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Category with Most Products</p>
                        <h1 className="text-lg font-bold text-[var(--card-title)]">
                            {stats.mostProductsCategory ? `${stats.mostProductsCategory.name} (${stats.mostProductsCount})` : "-"}
                        </h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Categories with No Products</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.categoriesWithNoProducts}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-bl-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Most Recently Created Category</p>
                        <h1 className="text-lg font-bold text-[var(--card-title)]">
                            {stats.mostRecentCategory ? `${stats.mostRecentCategory.name} (${stats.mostRecentDate?.toLocaleDateString()})` : "-"}
                        </h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-br-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Avg. Products per Category</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.avgProductsPerCategory.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                </div>
            )}
        </div>
    );
}