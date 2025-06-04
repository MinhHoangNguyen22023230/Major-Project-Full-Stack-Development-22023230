import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function OverviewSaaS() {
    // Example: you may want to add more queries for subscriptions, churn, etc.
    const { data: users = [], isLoading: loadingUsers } = trpc.crud.getUsers.useQuery();
    const { data: orders = [], isLoading: loadingOrders } = trpc.crud.getOrders.useQuery();

    // Simulate SaaS metrics (replace with real queries if you have them)
    const stats = useMemo(() => {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const activeUsers = users.filter(u => u.updatedAt && new Date(u.updatedAt) > oneMonthAgo).length;
        const newUsers = users.filter(u => u.createdAt && new Date(u.createdAt) > oneMonthAgo).length;
        const totalRevenue = orders.reduce((sum, o) => sum + (typeof o.totalPrice === "number" ? o.totalPrice : 0), 0);
        const mrr = totalRevenue / 12; // Example: fake MRR as 1/12 of total revenue
        const churnRate = users.length > 0 ? Math.round((users.length - activeUsers) / users.length * 100) : 0;
        const arpu = users.length > 0 ? totalRevenue / users.length : 0;
        return {
            totalUsers: users.length,
            activeUsers,
            newUsers,
            totalRevenue,
            mrr,
            churnRate,
            arpu,
        };
    }, [users, orders]);

    const isLoading = loadingUsers || loadingOrders;

    return (
        <div className="main-section p-4 bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            <h1 className="mb-5 font-bold text-[var(--card-title)]">SaaS Overview</h1>
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 grid-rows-4 gap-2">
                    <div className="p-4 four-by-four-border rounded-tl-lg bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Total Users</p>
                        <h1 className="text-3xl font-bold">{stats.totalUsers}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-tr-lg bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Active Users (30d)</p>
                        <h1 className="text-3xl font-bold">{stats.activeUsers}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>New Users (30d)</p>
                        <h1 className="text-3xl font-bold">{stats.newUsers}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Churn Rate</p>
                        <h1 className="text-3xl font-bold">{stats.churnRate}%</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Total Revenue</p>
                        <h1 className="text-3xl font-bold">${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                    <div className="p-4 four-by-four-border bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>MRR (est.)</p>
                        <h1 className="text-3xl font-bold">${stats.mrr.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-bl-lg bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>ARPU</p>
                        <h1 className="text-3xl font-bold">${stats.arpu.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-br-lg bg-[var(--gallery)] text-[var(--foreground)]">
                        <p>Orders</p>
                        <h1 className="text-3xl font-bold">{orders.length}</h1>
                    </div>
                </div>
            )}
        </div>
    );
}