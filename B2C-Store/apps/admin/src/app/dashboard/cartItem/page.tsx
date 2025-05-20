"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function CartItemPage() {
    const { data: cartItems, isLoading, error } = trpc.crud.getCartItems.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!cartItems || cartItems.length === 0) return <div className="p-8">No cart items found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Cart Items</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Cart ID</th>
                            <th className="px-4 py-2 border">Product ID</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Total Price</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item) => (
                            <tr key={item.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{item.id}</td>
                                <td className="px-4 py-2 border">{item.cartId}</td>
                                <td className="px-4 py-2 border">{item.productId}</td>
                                <td className="px-4 py-2 border">{item.quantity}</td>
                                <td className="px-4 py-2 border">{item.totalPrice}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/cartitem/${item.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}