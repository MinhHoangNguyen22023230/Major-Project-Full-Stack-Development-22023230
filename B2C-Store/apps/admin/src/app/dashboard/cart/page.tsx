"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function CartPage() {
    const { data: carts, isLoading, error } = trpc.crud.getCarts.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!carts || carts.length === 0) return <div className="p-8">No carts found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Carts</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">User ID</th>
                            <th className="px-4 py-2 border">Total Price</th>
                            <th className="px-4 py-2 border">Created At</th>
                            <th className="px-4 py-2 border">Updated At</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carts.map((cart) => (
                            <tr key={cart.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{cart.id}</td>
                                <td className="px-4 py-2 border">{cart.userId}</td>
                                <td className="px-4 py-2 border">{cart.totalPrice}</td>
                                <td className="px-4 py-2 border">{cart.createdAt}</td>
                                <td className="px-4 py-2 border">{cart.updatedAt}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/cart/${cart.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}