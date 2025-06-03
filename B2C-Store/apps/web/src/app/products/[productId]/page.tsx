import { Review } from "@/components/Review";
import { trpc } from "@/app/_trpc/client";

export default function ProductPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  const { data: product } = trpc.crud.findProductById.useQuery({ id: productId });

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      {/* ...other product details... */}
      <Review
        reviews={product.reviews?.map(r => ({
          ...r,
          rating: r.rating ?? 0, // or choose a default value appropriate for your app
        }))}
        productId={productId}
      />
    </div>
  );
}