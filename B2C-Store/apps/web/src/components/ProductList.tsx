import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Product 1",
    description: "This is a sample product description.",
    price: 29.99,
    imageUrl: "/no product image.png", // Replace with actual image URLs later
  },
  {
    id: "2",
    name: "Product 2",
    description: "This is another sample product description.",
    price: 49.99,
    imageUrl: "/no product image.png", // Replace with actual image URLs later
  },
  {
    id: "3",
    name: "Product 3",
    description: "This is yet another sample product description.",
    price: 19.99,
    imageUrl: "/no product image.png", // Replace with actual image URLs later
  },
  {
    id: "4",
    name: "Product 4",
    description: "This is a different sample product description.",
    price: 39.99,
    imageUrl: "/no product image.png", // Replace with actual image URLs later
  },
  {
    id: "5",
    name: "Product 5",
    description: "This is a unique sample product description.",
    price: 59.99,
    imageUrl: "/no product image.png", // Replace with actual image URLs later
  }

];

export default function ProductList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {sampleProducts.map((product) => (
        <Link href={`/products/${product.id}`} key={product.id}>
          <div
            key={product.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <Image
              width={500}
              height={500}
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-700 mb-4">{product.description}</p>
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