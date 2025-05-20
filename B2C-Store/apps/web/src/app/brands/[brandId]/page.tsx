"use client";
import React from "react";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import ProductListBrand from "@/components/Listing/ProductListBrand";

export default function Brand({ params }: { params: { brandId: string } }) {
    const { data: brand, isLoading, error } = trpc.crud.findBrandById.useQuery(
        { id: params.brandId },
        { enabled: !!params.brandId }
    );

    if (isLoading) return <div className="text-gray-500">Loading brand...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;
    if (!brand) return <div className="text-gray-500">Brand not found.</div>;

    return (
        <div className="flex flex-col items-center space-y-6 mt-30">
            <div className="flex flex-col items-center gap-4">
                {brand.imageUrl && (
                    <Image
                        src={brand.imageUrl}
                        alt={brand.name}
                        width={120}
                        height={120}
                        className="rounded"
                    />
                )}
                <h1 className="text-3xl font-bold">{brand.name}</h1>
                {brand.description && <p className="text-gray-700 text-center">{brand.description}</p>}
            </div>
            <ProductListBrand brandId={params.brandId} />
        </div>
    );
}