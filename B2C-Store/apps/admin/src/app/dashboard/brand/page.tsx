"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function BrandPage() {
    const { data: brands, isLoading, error } = trpc.crud.getBrands.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!brands || brands.length === 0) return <div className="p-8">No brands found.</div>;

    return (
        <div className="p-8 w-full" style={{ overflowX: "auto", boxSizing: "border-box" }}>
            <h1 className="text-2xl font-bold mb-4">Brands</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">Description</th>
                            <th className="px-4 py-2 border">Image URL</th>
                            <th className="px-4 py-2 border">Created At</th>
                            <th className="px-4 py-2 border">Updated At</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map((brand) => (
                            <tr key={brand.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{brand.id}</td>
                                <td className="px-4 py-2 border">{brand.name}</td>
                                <td className="px-4 py-2 border">{brand.description}</td>
                                <td className="px-4 py-2 border">{brand.imageUrl}</td>
                                <td className="px-4 py-2 border">{brand.createdAt}</td>
                                <td className="px-4 py-2 border">{brand.updatedAt}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/brand/${brand.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}