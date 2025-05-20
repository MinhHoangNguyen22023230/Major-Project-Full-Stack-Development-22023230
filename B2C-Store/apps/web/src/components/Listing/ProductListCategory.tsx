"use client";

import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import AddToCartButton from "@/components/Button/AddToCart";
import AddToWishlistButton from "@/components/Button/AddToWishilist";

export default function ProductListCategory({ categoryId }: { categoryId: string }) {
  const { data: products, isLoading, error } = trpc.crud.findProductByCategoryId.useQuery(
    { categoryId },
    { enabled: !!categoryId }
  );

  if (isLoading) return (
    <div className="shadow-md rounded-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">...Loading</h2>
      </div>
    </div>
  );
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <h1 className=" text-4xl font-bold text-center py-8">Products by Category</h1>
      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pl-6 pr-6 pt-30 pb-30">
        {products?.map((product) => (
          <div className="block w-full shadow-xl" key={product.id}>
            <Link href={`/products/${product.id}`}>
              <div className="bg-[var(--gallery)] overflow-hidden">
                <div className="bg-[var(--gallery)] h-100">
                  <Image
                    width={500}
                    height={500}
                    src={product.imageUrl || "/no-product-image.png"}
                    alt={product.name}
                    className="w-full h-100 object-cover object-center"
                  />
                </div>
                <div className="bg-[var(--gallery)] p-4">
                  <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                  <p className="text-gray-700 mb-2">{product.description}</p>
                  <p className="text-lg font-semibold text-blue-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
            <div className="flex items-center bg-[var(--gallery)] justify-between px-4 pb-4">
              <AddToWishlistButton productId={product.id} />
              <AddToCartButton productId={product.id} productPrice={product.price} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}