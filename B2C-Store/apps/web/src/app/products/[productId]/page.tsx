'use client'

import { trpc } from "@/app/_trpc/client";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AddToCartButton from "@/components/Button/AddToCart";
import Image from "next/image";

export default function Product() {
  const params = useParams();
  const productId = typeof params.productId === "string" ? params.productId : Array.isArray(params.productId) ? params.productId[0] : undefined;

  // Only run the query if productId is defined
  const { data: product, isLoading, error } = trpc.crud.findProductById.useQuery(
    { id: productId as string },
    { enabled: !!productId }
  );

  if (!productId) return <div>Product not found.</div>;
  if (isLoading) return <div className="w-full h-full flex items-center"><Loader2 className="animate-spin duration-100" /></div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="w-full flex justify-center pt-10 pb-10">
      <div className="grid grid-cols sm:grid-cols-[2fr_1fr] px-2 xl:w-[calc(100vw-20rem)] lg:w-[calc(100vw-15rem)] md:w-[calc(100vw-10rem)] w-full sm:w-full gap-4">
        <div className="flex flex-col bg-blue-400 h-fit w-full">
          <div className="w-full h-full flex items-center mb-10 justify-center">
          <Image src={product.imageUrl} alt={product.name} width={500} height={500} className="object-fit" />
          </div>
          <p className="text-lg text-gray-700">{product.description}</p>
        </div>
        <div className="hidden sm:flex flex-row bg-amber-400 h-100 w-full">
          <h1 className="text-5xl">Hello</h1>
        </div>
      </div>
      <div className="sm:hidden fixed left-0 bottom-0 w-full h-24 bg-[var(--rangoon-green)] text-[var(--gallery)] flex items-center justify-between px-5 z-50">
        <h1 className="text-2xl font-bold">$ {product.price.toFixed(2)}</h1>
        <AddToCartButton productId={product.id} />
      </div>
    </div>
  );
}