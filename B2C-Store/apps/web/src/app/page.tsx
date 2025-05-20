"use client";
import { logout } from "@/components/Login/logoutAction";
import ProductList from "@/components/Listing/ProductList";
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <ProductList />
    </div>
  );
}