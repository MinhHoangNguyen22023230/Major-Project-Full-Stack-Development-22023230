import Image from "next/image";
import Link from "next/link";
import { prisma } from "@repo/db";

export default async function ProductList() {
  // Fetch products from the database
  const products = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
    },
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <Link href={`/products/${product.id}`} key={product.id}>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <Image
              width={500}
              height={500}
              src={product.imageUrl || "/no-product-image.png"} // Fallback image
              alt={product.name}
              className="w-full h-48 object-cover"
            />
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