"use client";

import { trpc } from "@/app/_trpc/client";
import Listing from "@/components/ui/Listing";

export default function ProductListCategory({ categoryId }: { categoryId: string }) {
  const { data: products, isLoading, error } = trpc.crud.findProductByCategoryId.useQuery(
    { categoryId },
    { enabled: !!categoryId }
  );

  return (
    <Listing
      products={
        (products || []).map((product) => ({
          ...product,
          brand: {
            ...product.brand,
            imageUrl: product.brand.imageUrl === null ? undefined : product.brand.imageUrl,
          },
        }))
      }
      isLoading={isLoading}
      error={error}
      title="Products by Category"
    />
  );
}