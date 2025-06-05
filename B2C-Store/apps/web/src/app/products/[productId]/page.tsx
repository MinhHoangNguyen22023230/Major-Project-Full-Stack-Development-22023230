'use client'

import { trpc } from "@/app/_trpc/client";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AddToCartButton from "@/components/Button/AddToCart";
import AddToWishlist from "@/components/Button/AddToWishilist";
import Image from "next/image";
import { useState } from "react"
import Review, { normalizeReview, ReviewType } from "@/components/Product/Review";

export default function Product() {
  const params = useParams();
  const productId = typeof params.productId === "string" ? params.productId : Array.isArray(params.productId) ? params.productId[0] : undefined;

  // Fetch all reviews, then filter for this product
  const { data: allReviewsData = [] } = trpc.crud.getReviews.useQuery();
  const reviews: ReviewType[] = Array.isArray(allReviewsData)
    ? allReviewsData
      .filter(r => r.productId === productId)
      .map(r => normalizeReview(r as Record<string, unknown>))
    : [];
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

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
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] px-2 xl:w-[calc(100vw-20rem)] lg:w-[calc(100vw-15rem)] md:w-[calc(100vw-10rem)] w-full gap-8">
        {/* Product Image and Description */}
        <div className="flex flex-col bg-white rounded-lg shadow-lg h-fit w-full p-6">
          <div className="w-full lg:w-100 h-100 flex items-center mb-8 justify-center">
            <Image src={product.stock <= 0 ? "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/out-of-stock.png" : product.imageUrl} alt={product.name} width={1000} height={1000} className="rounded-lg border border-gray-200 bg-[var(--gallery)]" />
          </div>
          <AddToWishlist productId={product.id} className="sm:hidden my-5" />
          <button className="w-full h-14 bg-[var(--rangoon-green)] hover:bg-[var(--supernova)] text-center text-[var(--gallery)] hover:text-[var(--rangoon-green)] font-semibold text-xl rounded transition-colors mb-4" onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}>
            {isDescriptionOpen ? "Hide Description" : "Show Description"}
          </button>
          {isDescriptionOpen && <p className="text-base text-gray-700 bg-[var(--gallery)] rounded p-4 border border-gray-200 mt-2">{product.description}</p>}
          <Review productId={product.id} reviews={reviews} />
        </div>
        {/* Product Name and price Section */}
        <div className="p-6 hidden sm:flex shadow-xl flex-col bg-white h-fit w-full rounded-lg border border-gray-100">
          <div className="flex flex-row justify-start items-center gap-4 mb-4">
            <Image src={product.brand.imageUrl ?? "/placeholder.png"} alt={product.brand.name} width={60} height={60} className="object-contain" />
            <p className="text-lg font-semibold text-gray-800">{product.brand.name}</p>
          </div>
          <p className="text-base font-semibold text-[var(--supernova)] mb-2">
            {typeof product.rating === "number" && product.rating > 0
              ? `${product.rating.toFixed(1)} / 5`
              : "No Rating"}
          </p>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">{product.name}</h1>
          <h2 className="text-xl font-semibold mt-2 text-gray-700">$ {product.price.toFixed(2)}</h2>
          <div className="flex flex-row mt-10 justify-between items-center gap-4 px-2">
            <AddToWishlist productId={product.id} />
            <AddToCartButton productId={product.id} className="w-full" disabled={product.stock <= 0} />
          </div>
        </div>
      </div>
      {/* Mobile Bottom Bar */}
      <div className="sm:hidden fixed left-0 bottom-0 w-full h-20 bg-[var(--rangoon-green)] text-[var(--gallery)] flex items-center justify-between px-6 z-20 shadow-2xl rounded-t-lg">
        <h1 className="text-xl font-bold">$ {product.price.toFixed(2)}</h1>
        <AddToCartButton productId={product.id} className="w-36" disabled={product.stock <= 0} />
      </div>
    </div>
  );
}