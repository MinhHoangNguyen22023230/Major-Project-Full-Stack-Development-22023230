"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import LeftSide from "@/components/Checkout/LeftSide";
import RightSide from "@/components/Checkout/RightSide";
import { useRouter } from "next/navigation";

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
    user?: { id: string };
    userId?: string;
    totalPrice?: number;
    cartItems: CartItem[];
};

export default function Checkout({ params }: { params: Promise<{ checkoutId: string }> }) {
    const router = useRouter();
    const [checkoutId, setCheckoutId] = useState<string | null>(null);

    // Unwrap params Promise safely
    useEffect(() => {
        let mounted = true;
        params.then((p) => {
            if (mounted) setCheckoutId(p.checkoutId);
        });
        return () => { mounted = false; };
    }, [params]);

    // Fetch cart by ID
    const { data: cart, isLoading, error } = trpc.crud.findCartById.useQuery(
        { id: checkoutId ?? "" },
        { enabled: !!checkoutId }
    );

    // Get trpc utils only once (outside of useEffect)
    const utils = trpc.useUtils();

    // State to hold cart with product details
    const [cartWithProducts, setCartWithProducts] = useState<Cart | null>(null);

    // Fetch product details for cart items if missing
    useEffect(() => {
        if (!cart || !cart.cartItems) return;

        const missingIds = cart.cartItems
            .filter((item: CartItem) => !item.product)
            .map((item: CartItem) => item.productId);

        if (missingIds.length === 0) {
            setCartWithProducts({
                ...cart,
                totalPrice: cart.totalPrice === null ? undefined : cart.totalPrice,
            });
            return;
        }

        Promise.all(
            missingIds.map((id: string) =>
                utils.crud.findProductById.fetch({ id }).catch(() => undefined)
            )
        ).then((products) => {
            const productsById: Record<string, Product> = {};
            products.forEach((product) => {
                if (product) productsById[product.id] = product;
            });

            const cartItemsWithProducts = cart.cartItems.map((item: CartItem) => {
                const product = productsById[item.productId];
                return product ? { ...item, product } : { ...item };
            });

            setCartWithProducts({
                ...cart,
                cartItems: cartItemsWithProducts,
                totalPrice: cart.totalPrice === null ? undefined : cart.totalPrice,
            });
        });
    }, [cart, utils]);

    // Mutation to create order
    const createOrder = trpc.crud.createOrder.useMutation();
    // Mutation to delete cart
    const deleteCart = trpc.crud.deleteCart.useMutation();
    // Mutation to delete all cart items for this cart
    const deleteCartItem = trpc.crud.deleteCartItem.useMutation();

    const [confirming, setConfirming] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!cartWithProducts || !cartWithProducts.cartItems || cartWithProducts.cartItems.length === 0) {
            setErrorMsg("Your cart is empty.");
            return;
        }
        const userId = cartWithProducts.user?.id || cartWithProducts.userId;
        if (!userId) {
            setErrorMsg("No user found for this cart.");
            return;
        }
        setErrorMsg(null);
        setConfirming(true);
        try {
            // Prepare order items from cart items
            const orderItems = cartWithProducts.cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                totalPrice:
                    typeof item.totalPrice === "number"
                        ? item.totalPrice
                        : (item.product && typeof item.product.price === "number"
                            ? item.product.price * item.quantity
                            : 0),
            }));

            // Create order
            const order = await createOrder.mutateAsync({
                userId,
                totalPrice:
                    cartWithProducts.totalPrice !== undefined
                        ? cartWithProducts.totalPrice
                        : orderItems.reduce((sum, oi) => sum + oi.totalPrice, 0),
                status: "pending",
                orderItems,
            });

            // Clear all cart items
            await Promise.all(
                cartWithProducts.cartItems.map((item) =>
                    deleteCartItem.mutateAsync({ id: item.id })
                )
            );
            // Delete the cart itself
            await deleteCart.mutateAsync({ id: cartWithProducts.id });

            // Invalidate cart queries so NavBar updates
            await utils.crud.getCarts.invalidate();
            await utils.crud.findCartById.invalidate();

            // Redirect to order detail page
            router.push(`/order/${order.id}`);
        } catch (err) {
            setErrorMsg(
                err instanceof Error
                    ? err.message
                    : "Failed to place order."
            );
        } finally {
            setConfirming(false);
        }
    };

    if (isLoading || !checkoutId) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
                <h1 className="text-3xl font-bold mb-4">Checkout</h1>
                <p>Loading cart...</p>
            </div>
        );
    }

    if (error || !cart) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
                <h1 className="text-3xl font-bold mb-4">Checkout</h1>
                <p className="text-red-500">Failed to load cart.</p>
            </div>
        );
    }

    if (!cartWithProducts) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
                <h1 className="text-3xl font-bold mb-4">Checkout</h1>
                <p>Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow flex flex-col md:flex-row gap-8">
            <div className="flex-1">
                <LeftSide cart={cartWithProducts} />
            </div>
            <div className="w-full md:w-96">
                <RightSide cart={cartWithProducts} />
                {errorMsg && <div className="text-red-500 mt-4">{errorMsg}</div>}
                <button
                    className="w-full mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                    onClick={handleConfirm}
                    disabled={confirming || !cartWithProducts.cartItems.length}
                >
                    {confirming ? "Placing Order..." : "Confirm & Place Order"}
                </button>
            </div>
        </div>
    );
}