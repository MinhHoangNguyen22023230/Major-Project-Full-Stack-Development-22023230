"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function OrderItemPage() {
    const { data: orderItems, isLoading, error } = trpc.crud.getOrderItems.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!orderItems || orderItems.length === 0) return <div className="p-8">No order items found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Order Items</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Order ID</th>
                            <th className="px-4 py-2 border">Product ID</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Total Price</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderItems.map((item) => (
                            <tr key={item.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{item.id}</td>
                                <td className="px-4 py-2 border">{item.orderId}</td>
                                <td className="px-4 py-2 border">{item.productId}</td>
                                <td className="px-4 py-2 border">{item.quantity}</td>
                                <td className="px-4 py-2 border">{item.totalPrice}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/orderitem/${item.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}