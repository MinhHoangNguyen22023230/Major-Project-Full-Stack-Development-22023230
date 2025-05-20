"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import LeftSide from "@/components/Product/LeftSide";
import RightSide from "@/components/Product/RightSide";
import Review from "@/components/Product/Review";
import { useState } from "react";


type ReviewType = {
  id: string;
  rating: number;
  comment: string;
  user?: { username: string; id?: string };
};

export default function Product() {
  const params = useParams();
  const productId = params.productId as string;

  // Fetch product details using tRPC
  const { data: product, isLoading, error } = trpc.crud.findProductById.useQuery({ id: productId });

  // Always call useState, even before product is loaded
  const [localReviews, setLocalReviews] = useState<ReviewType[]>([]);

  // Only access product fields after confirming product is loaded and not null
  let safeImageUrl: string | undefined,
    safeBrand: { name: string; imageUrl?: string } | undefined,
    safeRating: number | undefined,
    safeSalePrice: number | undefined,
    safeStock: number | undefined,
    safeDescription: string | undefined,
    safeReviews: ReviewType[];

  if (product) {
    safeImageUrl = product.imageUrl ?? undefined;
    safeBrand = product.brand
      ? {
        ...product.brand,
        imageUrl: product.brand.imageUrl ?? undefined,
      }
      : undefined;
    safeRating = product.rating ?? undefined;
    safeSalePrice = product.salePrice ?? undefined;
    safeStock = product.stock ?? undefined;
    safeDescription = product.description ?? undefined;
    // Fix: Map backend review type to ReviewType
    safeReviews =
      product.reviews?.map((review: {
        id: string;
        rating: number | null;
        comment: string | null;
        user?: { username?: string; id?: string };
      }) => ({
        id: review.id,
        rating: review.rating ?? 0,
        comment: review.comment ?? "",
        user: review.user
          ? { username: review.user.username ?? "Anonymous", id: review.user.id }
          : undefined,
      })) ?? [];
  } else {
    safeImageUrl = undefined;
    safeBrand = undefined;
    safeRating = undefined;
    safeSalePrice = undefined;
    safeStock = undefined;
    safeDescription = undefined;
    safeReviews = [];
  }

  // If localReviews is empty and product is loaded, initialize it
  if (product && localReviews.length === 0 && safeReviews.length > 0) {
    setLocalReviews(safeReviews);
  }

  // Calculate local average rating for RightSide
  const localAvgRating =
    localReviews.length
      ? localReviews.reduce((a, b) => a + (typeof b.rating === "number" ? b.rating : 0), 0) /
      localReviews.length
      : safeRating;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-xl font-semibold">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-xl text-red-600 font-semibold">Product not found.</span>
      </div>
    );
  }

  return (
    <div className="w-[80%] mx-auto h-full bg-white shadow-lg pt-30 pr-8 pl-8 pb-30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <LeftSide imageUrl={safeImageUrl} name={product.name} />
        <RightSide
          id={product.id}
          name={product.name}
          brand={safeBrand}
          rating={localAvgRating ? Number(localAvgRating.toFixed(1)) : safeRating}
          price={product.price}
          salePrice={safeSalePrice}
          stock={safeStock}
          description={safeDescription}
        />
      </div>
      <br />
      <hr />
      <Review
        reviews={localReviews}
        productId={product.id}
        onReviewAdded={setLocalReviews}
      />
    </div>
  );
}