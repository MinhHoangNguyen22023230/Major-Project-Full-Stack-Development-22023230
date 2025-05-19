"use client";

import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";


export default function ProductList() {
  const { data: products, isLoading, error } = trpc.crud.getProducts.useQuery();

  if (isLoading) return 
  (<div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">...Loading</h2>
              <p className="text-gray-700 mb-2"></p>
              <p className="text-sm text-gray-500 mb-2">

              </p>
              <p className="text-sm text-gray-500 mb-4">
              </p>
              <p className="text-lg font-semibold text-blue-600">
              </p>
            </div>
          </div>);
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products?.map((product) => (
        <Link className="w-full" href={`/products/${product.id}`} key={product.id}>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="h-100">
            <Image
              width={500}
              height={500}
              src={product.imageUrl || "/no-product-image.png"} // Fallback image
              alt={product.name}
              className="w-full h-100 object-cover object-center"
            />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-700 mb-2">{product.description}</p>
              <p className="text-sm text-gray-500 mb-2">
                Category: {product.category?.name || "Unknown"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Brand: {product.brand?.name || "Unknown"}
              </p>
              <p className="text-lg font-semibold text-blue-600">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}