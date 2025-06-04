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
        <div className="main-section p-4">
            <h1 className="mb-5 font-bold">Order Overview</h1>
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
                </div>
            ) : (
                <div className="grid grid-cols-2 grid-rows-3 gap-2">
                    <div className="p-4 four-by-four-border rounded-tl-lg">
                        <p className="text-gray-600">Total Orders</p>
                        <h1 className="text-3xl font-bold">{stats.total}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-tr-lg">
                        <p className="text-gray-600">New Orders (last 30d)</p>
                        <h1 className="text-3xl font-bold">{stats.newOrders}</h1>
                    </div>
                    <div className="p-4 four-by-four-border">
                        <p className="text-gray-600">Completed Orders</p>
                        <h1 className="text-3xl font-bold">{stats.completedOrders}</h1>
                    </div>
                    <div className="p-4 four-by-four-border">
                        <p className="text-gray-600">Pending Orders</p>
                        <h1 className="text-3xl font-bold">{stats.pendingOrders}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-bl-lg">
                        <p className="text-gray-600">Total Revenue</p>
                        <h1 className="text-3xl font-bold">${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                    <div className="p-4 four-by-four-border rounded-br-lg">
                        <p className="text-gray-600">Avg. Order Value</p>
                        <h1 className="text-3xl font-bold">${stats.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
                    </div>
                </div>
            )}
        </div>
    );
}