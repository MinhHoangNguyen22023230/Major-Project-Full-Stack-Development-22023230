import ProductList from "@/components/ProductList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-center py-8">Our Products</h1>
      <ProductList />
    </div>
  );
}