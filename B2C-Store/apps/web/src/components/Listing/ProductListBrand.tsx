"use client";

import { trpc } from "@/app/_trpc/client";
import Listing from "@/components/ui/Listing";

export default function ProductListBrand({ brandId }: { brandId: string }) {
  const { data: products, isLoading, error } = trpc.crud.findProductByBrandId.useQuery(
    { brandId },
    { enabled: !!brandId }
  );

  return (
    <Listing
      products={
        (products || []).map((product) => ({
          ...product,
          brand: {
            ...product.brand,
            imageUrl: product.brand?.imageUrl === null ? undefined : product.brand?.imageUrl,
          },
        }))
      }
      isLoading={isLoading}
      error={error}
      title="Products by Brand"
    />
  );
}