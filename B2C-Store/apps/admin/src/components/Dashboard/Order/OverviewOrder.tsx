import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function OverviewOrder() {
    const { data: orders = [], isLoading } = trpc.crud.getOrders.useQuery();
    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const newOrders = orders.filter(o => o.createdAt && new Date(o.createdAt) > oneMonthAgo).length;
        // Fix: status may be lower/upper/mixed case, so normalize for comparison
        const completedOrders = orders.filter(o => {
            const status = (o.status || "").toString().toUpperCase();
            return status === "COMPLETED" || status === "DELIVERED";
        }).length;
        const pendingOrders = orders.filter(o => {
            const status = (o.status || "").toString().toUpperCase();
            return status === "PENDING" || status === "PROCESSING";
        }).length;
        const totalRevenue = orders.reduce((sum, o) => sum + (typeof o.totalPrice === "number" ? o.totalPrice : 0), 0);
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        return {
            total: orders.length,
            newOrders,
            completedOrders,
            pendingOrders,
            totalRevenue,
            avgOrderValue,
        };
    }, [orders]);

    return (
        <div className="main-section p-4 bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            <h1 className="mb-5 font-bold text-[var(--card-title)]">Order Overview</h1>
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 grid-rows-3 gap-2">
                    <div className="p-4 four-by-four-border rounded-tl-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Total Orders</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.total}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-tr-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>New Orders (last 30d)</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.newOrders}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Completed Orders</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.completedOrders}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Pending Orders</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">{stats.pendingOrders}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-bl-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Total Revenue</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-br-lg bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)]">
                        <p>Avg. Order Value</p>
                        <h1 className="text-3xl font-bold text-[var(--card-title)]">${stats.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                </div>
            )}
        </div>
    );
}