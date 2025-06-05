import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";

export default function TopCustomers() {
    const { data: users = [], isLoading: loadingUsers } = trpc.crud.getUsers.useQuery();
    const { data: orders = [], isLoading: loadingOrders } = trpc.crud.getOrders.useQuery();

    // Calculate total order value per user
    const userTotals = users.map(user => {
        const userOrders = orders.filter(o => o.userId === user.id);
        const totalSpent = userOrders.reduce((sum, o) => sum + (typeof o.totalPrice === "number" ? o.totalPrice : 0), 0);
        return { ...user, totalSpent };
    });
    // Sort by totalSpent descending and take top 5
    const topCustomers = userTotals
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

    const isLoading = loadingUsers || loadingOrders;

    return (
        <div className="main-section p-4 bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            <h2 className="mb-4 font-bold text-[var(--card-title)]">Top Customers</h2>
            {isLoading ? (
                <div className="flex justify-center items-center h-20">
                    <Loader2 className="animate-spin w-8 h-8 text-[var(--card-title)]" />
                </div>
            ) : (
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-sm text-[var(--card-title)]">
                            <th className="px-2 py-1">Username</th>
                            <th className="px-2 py-1">Email</th>
                            <th className="px-2 py-1">Total Spent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topCustomers.map(u => (
                            <tr key={u.id} className="rounded shadow-sm bg-[var(--gallery)] text-[var(--foreground)]">
                                <td className="px-2 py-1 font-medium">{u.username || "-"}</td>
                                <td className="px-2 py-1">{u.email || "-"}</td>
                                <td className="px-2 py-1 text-xs">${u.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
