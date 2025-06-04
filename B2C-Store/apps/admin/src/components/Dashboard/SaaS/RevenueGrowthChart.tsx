import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

export default function RevenueGrowthChart() {
    const { data: orders = [], isLoading } = trpc.crud.getOrders.useQuery();

    // Group orders by month and sum revenue
    const chartData = useMemo(() => {
        const map = new Map<string, number>();
        orders.forEach(order => {
            if (!order.createdAt || typeof order.totalPrice !== "number") return;
            const date = new Date(order.createdAt);
            const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
            map.set(key, (map.get(key) || 0) + order.totalPrice);
        });
        // Sort by month ascending
        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, revenue]) => ({ month, revenue }));
    }, [orders]);

    return (
        <div className="bg-[var(--navbar-and-sidebar-bg)] main-section p-4">
            <h2 className="mb-4 font-bold text-[var(--card-title)]">Revenue Growth (Monthly)</h2>
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                </div>
            ) : chartData.length === 0 ? (
                <div className="text-center py-8 text-[var(--foreground)]">No revenue data available.</div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="var(--ui-border-color)" strokeDasharray="3 3" />
                        <XAxis dataKey="month" stroke="var(--foreground)" tick={{ fill: 'var(--foreground)' }} />
                        <YAxis tickFormatter={v => `$${v}`} stroke="var(--foreground)" tick={{ fill: 'var(--foreground)' }} />
                        <Tooltip
                            contentStyle={{ background: 'var(--gallery)', color: 'var(--foreground)', borderColor: 'var(--ui-border-color)' }}
                            itemStyle={{ color: 'var(--foreground)' }}
                            labelStyle={{ color: 'var(--card-title)' }}
                            formatter={v => `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="var(--card-title)" strokeWidth={2} dot={{ r: 4, stroke: 'var(--card-title)', fill: 'var(--gallery)' }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
