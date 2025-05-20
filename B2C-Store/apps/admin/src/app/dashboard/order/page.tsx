"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function OrderPage() {
    const { data: orders, isLoading, error } = trpc.crud.getOrders.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!orders || orders.length === 0) return <div className="p-8">No orders found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Orders</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">User ID</th>
                            <th className="px-4 py-2 border">Total Price</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Created At</th>
                            <th className="px-4 py-2 border">Updated At</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{order.id}</td>
                                <td className="px-4 py-2 border">{order.userId}</td>
                                <td className="px-4 py-2 border">{order.totalPrice}</td>
                                <td className="px-4 py-2 border">{order.status}</td>
                                <td className="px-4 py-2 border">{order.createdAt}</td>
                                <td className="px-4 py-2 border">{order.updatedAt}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/order/${order.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}