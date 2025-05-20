import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";

// --- Types ---
type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
};

type CartItem = {
    id: string;
    productId: string;
    product?: Product;
    quantity: number;
    totalPrice?: number;
};

type Cart = {
    id: string;
    totalPrice?: number;
    cartItems: CartItem[];
};

export default function LeftSide({ cart }: { cart: Cart }) {
    const [productsById, setProductsById] = useState<Record<string, Product>>({});

    // Fetch missing product data for cart items if not present
    useEffect(() => {
        const missingIds = cart.cartItems
            .filter((item) => !item.product)
            .map((item) => item.productId);

        if (missingIds.length === 0) return;

        // Use trpc query client directly for fetching product data
        const fetchProducts = async () => {
            const utils = trpc.useUtils();
            const products = await Promise.all(
                missingIds.map(async (id) => {
                    try {
                        // Use the query client to fetch product data
                        const product = await utils.crud.findProductById.fetch({ id });
                        return product as Product | undefined;
                    } catch {
                        return undefined;
                    }
                })
            );
            const newProducts: Record<string, Product> = {};
            products.forEach((product) => {
                if (product) newProducts[product.id] = product;
            });
            setProductsById((prev) => ({ ...prev, ...newProducts }));
        };

        fetchProducts();
    }, [cart.cartItems]);

    if (!cart.cartItems || cart.cartItems.length === 0) {
        return <div className="text-gray-500">Your cart is empty.</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Cart Items</h2>
            <ul className="space-y-4">
                {cart.cartItems.map((item) => {
                    const product: Product | undefined = item.product || productsById[item.productId];
                    return (
                        <li key={item.id} className="flex gap-4 items-center border-b pb-4">
                            <Link href={`/products/${product?.id || ""}`} className="block">
                                <Image
                                    src={product?.imageUrl || "/no-product-image.png"}
                                    alt={product?.name || "Product"}
                                    width={80}
                                    height={80}
                                    className="rounded"
                                />
                            </Link>
                            <div className="flex-1">
                                <Link href={`/products/${product?.id || ""}`} className="font-semibold hover:underline">
                                    {product?.name || "Unknown Product"}
                                </Link>
                                <div className="text-gray-600 text-sm">{product?.description || "No description"}</div>
                                <div className="text-gray-800 mt-1">Price: ${product?.price?.toFixed(2) || "0.00"}</div>
                                <div className="text-gray-800 mt-1">
                                    Quantity: {item.quantity}
                                </div>
                                <div className="text-gray-800 mt-1">
                                    Item Total: {(item.totalPrice !== undefined
                                        ? item.totalPrice
                                        : (product?.price || 0) * item.quantity
                                    ).toFixed(2)}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}