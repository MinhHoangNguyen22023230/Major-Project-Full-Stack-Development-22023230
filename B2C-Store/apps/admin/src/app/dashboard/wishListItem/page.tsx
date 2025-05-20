"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function WishListItemPage() {
    const { data: wishListItems, isLoading, error } = trpc.crud.getWishListItems.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!wishListItems || wishListItems.length === 0) return <div className="p-8">No wishlist items found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Wishlist Items</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Product ID</th>
                            <th className="px-4 py-2 border">Wishlist ID</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wishListItems.map((item) => (
                            <tr key={item.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{item.id}</td>
                                <td className="px-4 py-2 border">{item.productId}</td>
                                <td className="px-4 py-2 border">{item.wishListId}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/wishlistitem/${item.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}