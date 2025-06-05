"use client";

import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import AddToCartButton from "@/components/Button/AddToCart";
import AddToWishlistButton from "@/components/Button/AddToWishilist";
import { Loader2 } from "lucide-react";

export default function ProductList() {
  const { data: products, isLoading, error } = trpc.crud.getProducts.useQuery();

  if (isLoading) return (
    <div className="shadow-md rounded-lg overflow-hidden">
      <div className="p-4 flex items-center gap-2">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    </div>
  );
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="bg-white z-10 shadow-md">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Our Products</h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products?.map((product) => (
            <div key={product.id} className="group relative ">

              <Link href={`/products/${product.id}`} className="block sm:w-70 sm:h-70">
                <Image
                  alt={product.name}
                  src={product.imageUrl || "/no-product-image.png"}
                  className="aspect-square w-full rounded-md bg-gray-200 object-fit group-hover:opacity-75 lg:aspect-auto lg:h-80"
                  width={500}
                  height={500}
                />
              </Link>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link href={`/products/${product.id}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.category?.name || "Unknown"}</p>
                  <p className="mt-1 h-5 text-sm text-gray-500 flex items-center">
                    {product.brand?.imageUrl && (
                      <Image
                        src={product.brand.imageUrl}
                        alt={product.brand.name + ' logo'}
                        width={20}
                        height={20}
                        className="inline-block mr-2 rounded-full bg-gray-100 object-contain"
                      />
                    )}
                    {product.brand?.name || "Unknown"}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center mt-5 justify-between mb-2 z-10 relative">
                <AddToWishlistButton productId={product.id} />
                <AddToCartButton productId={product.id} />
              </div>
            </div>

          ))}
        </div>
      </div>
    </div>
  );
}