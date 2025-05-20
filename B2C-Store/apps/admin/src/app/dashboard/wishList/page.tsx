"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function WishListPage() {
    const { data: wishLists, isLoading, error } = trpc.crud.getWishLists.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!wishLists || wishLists.length === 0) return <div className="p-8">No wishlists found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Wishlists</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">User ID</th>
                            <th className="px-4 py-2 border">Created At</th>
                            <th className="px-4 py-2 border">Updated At</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wishLists.map((wishList) => (
                            <tr key={wishList.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{wishList.id}</td>
                                <td className="px-4 py-2 border">{wishList.userId}</td>
                                <td className="px-4 py-2 border">{wishList.createdAt}</td>
                                <td className="px-4 py-2 border">{wishList.updatedAt}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/wishlist/${wishList.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}