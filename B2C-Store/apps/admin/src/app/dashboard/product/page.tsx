"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function ProductPage() {
    const { data: products, isLoading, error } = trpc.crud.getProducts.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!products || products.length === 0) return <div className="p-8">No products found.</div>;
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Products</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">Price</th>
                            <th className="px-4 py-2 border">Description</th>
                            <th className="px-4 py-2 border">Image</th>
                            <th className="px-4 py-2 border">Stock</th>
                            <th className="px-4 py-2 border">Sale Price</th>
                            <th className="px-4 py-2 border">Release Date</th>
                            <th className="px-4 py-2 border">Rating</th>
                            <th className="px-4 py-2 border">Category ID</th>
                            <th className="px-4 py-2 border">Brand ID</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.map((product) => (
                            <tr key={product.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{product.id}</td>
                                <td className="px-4 py-2 border">{product.name}</td>
                                <td className="px-4 py-2 border">{product.price}</td>
                                <td className="px-4 py-2 border">{product.description}</td>
                                <td className="px-4 py-2 border">{product.imageUrl}</td>
                                <td className="px-4 py-2 border">{product.stock}</td>
                                <td className="px-4 py-2 border">{product.salePrice}</td>
                                <td className="px-4 py-2 border">{product.releaseDate}</td>
                                <td className="px-4 py-2 border">{product.rating}</td>
                                <td className="px-4 py-2 border">{product.categoryId}</td>
                                <td className="px-4 py-2 border">{product.brandId}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/product/${product.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}