"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function CategoryPage() {
    const { data: categories, isLoading, error } = trpc.crud.getCategories.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!categories || categories.length === 0) return <div className="p-8">No categories found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Categories</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">Description</th>
                            <th className="px-4 py-2 border">Image URL</th>
                            <th className="px-4 py-2 border">Image URL</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{cat.id}</td>
                                <td className="px-4 py-2 border">{cat.name}</td>
                                <td className="px-4 py-2 border">{cat.description}</td>
                                <td className="px-4 py-2 border">{cat.imageUrl}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/category/${cat.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}