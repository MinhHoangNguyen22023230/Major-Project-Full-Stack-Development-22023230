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
    stock?: number; // Add stock property for type safety
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

    // Fetch missing product data for cart items if not present
    const [productsById, setProductsById] = useState<Record<string, Product>>({});
    useEffect(() => {
        const fetchMissingProducts = async () => {
            const missing = cart.cartItems.filter((item: CartItem) => !item.product && item.id);
            if (missing.length === 0) return;
            const promises = missing.map(async (item: CartItem) => {
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

    // Local state for input values
    const [inputQuantities, setInputQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        // Sync inputQuantities with cart items on cart change
        setInputQuantities(
            cart.cartItems.reduce((acc, item) => {
                acc[item.id] = item.quantity;
                return acc;
            }, {} as Record<string, number>)
        );
    }, [cart.cartItems]);

    const handleQuantityChange = async (
        cartItemId: string,
        newQuantity: number
    ) => {
        if (newQuantity < 1) return;
        setLoadingId(cartItemId);
        try {
            // Find the product for this cart item
            const item = cart.cartItems.find(i => i.id === cartItemId);
            const product = item?.product || productsById[item?.productId || ''];
            if (!product) {
                alert('Product not found.');
                return;
            }
            // Check stock
            if (typeof product.stock === 'number' && newQuantity > product.stock) {
                alert(`Only ${product.stock} in stock.`);
                setInputQuantities(q => ({ ...q, [cartItemId]: item?.quantity ?? 1 }));
                return;
            }
            // Only update quantity, backend will handle totalPrice and cart total
            await updateCartItem.mutateAsync({
                id: cartItemId,
                data: {
                    quantity: newQuantity,
                },
            });
            await utils.crud.findCartById.invalidate({ id: cart.id });
            await utils.crud.getCarts.invalidate();
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (cartItemId: string) => {
        setLoadingId(cartItemId);
        try {
            await deleteCartItem.mutateAsync({ id: cartItemId });
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
            <ul className="space-y-4 overflow-y-auto h-[100vh]">
                {cart.cartItems.map((item) => {
                    const product = item.product || productsById[item.productId] || {};
                    return (
                        <li key={item.id} className="flex gap-4 items-center border-b pb-4">
                            <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded">
                                <Link href={`/products/${product.id || ''}`} className="block">
                                    <Image
                                        src={product.imageUrl || "/no product image.png"}
                                        alt={product.name || "Product"}
                                        width={80}
                                        height={80}
                                        className="rounded object-contain mx-auto"
                                        style={{ display: 'block', margin: 'auto' }}
                                    />
                                </Link>
                            </div>
                            <div className="flex-1">
                                <Link href={`/products/${product.id || ''}`} className="font-semibold hover:underline">
                                    {product.name || 'Unknown Product'}
                                </Link>
                                <div className="text-gray-600 text-sm line-clamp-2">{product.description || 'No description'}</div>
                                <div className="text-gray-800 mt-1">Price: ${product.price?.toFixed(2) || '0.00'}</div>
                                <div className="text-gray-800 mt-1">Item Total: ${(item.totalPrice || ((product.price || 0) * item.quantity)).toFixed(2)}</div>
                                <div className="flex items-center mt-2 gap-2">
                                    <input
                                        type="number"
                                        min={1}
                                        step={1}
                                        pattern="[0-9]*"
                                        className="w-16 px-2 py-1 border rounded text-center"
                                        value={inputQuantities[item.id] ?? item.quantity}
                                        onChange={e => {
                                            const val = parseInt(e.target.value, 10);
                                            setInputQuantities(q => ({ ...q, [item.id]: isNaN(val) ? 1 : val }));
                                        }}
                                        onBlur={e => {
                                            const val = parseInt(e.target.value, 10);
                                            if (!isNaN(val) && val > 0 && val !== item.quantity) {
                                                handleQuantityChange(item.id, val);
                                            } else if (val <= 0 || isNaN(val)) {
                                                setInputQuantities(q => ({ ...q, [item.id]: item.quantity }));
                                            }
                                        }}
                                        disabled={loadingId === item.id}
                                    />
                                    <button
                                        className="ml-4 px-2 py-1 cursor-pointer hover:bg-red-800 transition-color duration-100 bg-red-500 text-white rounded"
                                        onClick={() => handleDelete(item.id)}
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