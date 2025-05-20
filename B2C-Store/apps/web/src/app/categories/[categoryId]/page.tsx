"use client";

import React from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import ProductListCategory from "@/components/Listing/ProductListCategory";

export default function Category() {
    // Use useParams to get categoryId instead of receiving it via props
    const { categoryId } = useParams() as { categoryId: string };

    const { data: category, isLoading, error } = trpc.crud.findCategoryById.useQuery(
        { id: categoryId },
        { enabled: !!categoryId }
    );

    if (isLoading) return <div className="text-gray-500">Loading category...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;
    if (!category) return <div className="text-gray-500">Category not found.</div>;

    return (
        <div className="flex flex-col items-center space-y-6 mt-30">
            <div className="flex flex-col items-center gap-4">
                {category.imageUrl && (
                    <Image
                        src={category.imageUrl}
                        alt={category.name}
                        width={200}
                        height={200}
                        className="rounded"
                    />
                )}
                <h1 className="text-3xl font-bold">{category.name}</h1>
                {category.description && <p className="text-gray-700 text-center">{category.description}</p>}
            </div>
            <ProductListCategory categoryId={categoryId} />
        </div>
    );
}