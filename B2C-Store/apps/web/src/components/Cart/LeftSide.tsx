import Image from "next/image";
import { trpc } from "@/app/_trpc/client";
import { useEffect, useState } from "react";
import Link from "next/link";

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
    const utils = trpc.useUtils();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Mutations
    const updateCartItem = trpc.crud.updateCartItem.useMutation();
    const deleteCartItem = trpc.crud.deleteCartItem.useMutation();
    const updateCart = trpc.crud.updateCart.useMutation();

    // Fetch missing product data for cart items if not present
    const [productsById, setProductsById] = useState<Record<string, Product>>({});
    useEffect(() => {
        const fetchMissingProducts = async () => {
            const missing = cart.cartItems.filter((item) => !item.product && item.id);
            if (missing.length === 0) return;
            const promises = missing.map(async (item) => {
                try {
                    // Fetch product by cartItemId with fetch
                    const products: Product[] = await utils.crud.findProductByCartItemId.fetch({ cartItemId: item.id });
                    const product = products.length > 0 ? products[0] : undefined;
                    return { id: item.productId, product };
                } catch {
                    return { id: item.productId, product: undefined };
                }
            });
            const productResults = await Promise.all(promises);
            setProductsById((prev) => {
                const next = { ...prev };
                for (const { id, product } of productResults) {
                    if (product) next[id] = product;
                }
                return next;
            });
        };
        fetchMissingProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart.cartItems]);

    const handleQuantityChange = async (
        cartItemId: string,
        newQuantity: number,
        product: Product,
        currentQuantity: number
    ) => {
        if (newQuantity < 1) return;
        setLoadingId(cartItemId);
        try {
            // Calculate price increment or decrement
            const price = product?.price || 0;
            const priceDiff = newQuantity > currentQuantity ? price : -price;
            // Calculate new cart item total price by adding/subtracting one unit price
            const oldItemTotal = (product?.price || 0) * currentQuantity;
            const newCartItemTotalPrice = oldItemTotal + priceDiff;
            // Update cart item
            await updateCartItem.mutateAsync({
                id: cartItemId,
                data: {
                    quantity: newQuantity,
                    totalPrice: newCartItemTotalPrice,
                },
            });
            // Update cart total price by adding/subtracting the price difference
            const newCartTotal = (typeof cart.totalPrice === 'number' ? cart.totalPrice : 0) + priceDiff;
            await updateCart.mutateAsync({ id: cart.id, data: { totalPrice: newCartTotal } });
            await utils.crud.findCartById.invalidate({ id: cart.id });
            await utils.crud.getCarts.invalidate();
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (cartItemId: string, cartItemTotalPrice: number) => {
        setLoadingId(cartItemId);
        try {
            await deleteCartItem.mutateAsync({ id: cartItemId });
            // Subtract the deleted item's total price from cart total
            const newCartTotal = (typeof cart.totalPrice === 'number' ? cart.totalPrice : 0) - (cartItemTotalPrice || 0);
            await updateCart.mutateAsync({ id: cart.id, data: { totalPrice: Math.max(newCartTotal, 0) } });
            await utils.crud.findCartById.invalidate({ id: cart.id });
            await utils.crud.getCarts.invalidate();
        } finally {
            setLoadingId(null);
        }
    };

    if (!cart.cartItems || cart.cartItems.length === 0) {
        return <div className="text-gray-500">Your cart is empty.</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Cart Items</h2>
            <ul className="space-y-4">
                {cart.cartItems.map((item) => {
                    const product = item.product || productsById[item.productId] || {};
                    return (
                        <li key={item.id} className="flex gap-4 items-center border-b pb-4">
                            <Link href={`/products/${product.id || ''}`} className="block">
                                <Image
                                    src={product.imageUrl || "/no product image.png"}
                                    alt={product.name || "Product"}
                                    width={80}
                                    height={80}
                                    className="rounded"
                                />
                            </Link>
                            <div className="flex-1">
                                <Link href={`/products/${product.id || ''}`} className="font-semibold hover:underline">
                                    {product.name || 'Unknown Product'}
                                </Link>
                                <div className="text-gray-600 text-sm">{product.description || 'No description'}</div>
                                <div className="text-gray-800 mt-1">Price: ${product.price?.toFixed(2) || '0.00'}</div>
                                <div className="text-gray-800 mt-1">Item Total: ${(item.totalPrice || ((product.price || 0) * item.quantity)).toFixed(2)}</div>
                                <div className="flex items-center mt-2 gap-2">
                                    <button
                                        className="px-2 py-1 bg-gray-200 rounded"
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, product as Product, item.quantity)}
                                        disabled={loadingId === item.id || item.quantity <= 1}
                                    >-</button>
                                    <span className="px-2">{item.quantity}</span>
                                    <button
                                        className="px-2 py-1 bg-gray-200 rounded"
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1, product as Product, item.quantity)}
                                        disabled={loadingId === item.id}
                                    >+</button>
                                    <button
                                        className="ml-4 px-2 py-1 bg-red-500 text-white rounded"
                                        onClick={() => handleDelete(item.id, item.totalPrice || ((product.price || 0) * item.quantity))}
                                        disabled={loadingId === item.id}
                                    >Delete</button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}