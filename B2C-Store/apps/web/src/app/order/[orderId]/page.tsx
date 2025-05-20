"use client";

import React, { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import Image from "next/image";

type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
};

type OrderItem = {
    id: string;
    quantity: number;
    productId: string;
    product?: Product;
    totalPrice?: number;
};

type Order = {
    id: string;
    totalPrice?: number | null;
    status?: string;
    orderItems?: OrderItem[];
    createdAt?: string;
    updatedAt?: string;
};

export default function Order({ params }: { params: Promise<{ orderId: string }> }) {
    // Unwrap params using React.use()
    const { orderId } = React.use(params);

    const { data: order, isLoading, error, refetch } = trpc.crud.findOrderById.useQuery(
        { id: orderId },
        { enabled: !!orderId }
    );

    // State to hold order with product details
    const [orderWithProducts, setOrderWithProducts] = useState<Order | null>(null);

    // Get trpc utils only once
    const utils = trpc.useUtils();

    // Mutation for updating order status
    const updateOrder = trpc.crud.updateOrder.useMutation();

    // Fetch product details for order items if missing
    useEffect(() => {
        if (!order || !order.orderItems) return;

        // Fix: Use correct type for orderItems
        const missingIds = order.orderItems
            .filter((item: OrderItem) => !("product" in item) || !item.product)
            .map((item: OrderItem) => item.productId);

        if (missingIds.length === 0) {
            setOrderWithProducts(order);
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

            const orderItemsWithProducts = order.orderItems.map((item: OrderItem) => {
                const product = productsById[item.productId];
                return product ? { ...item, product } : { ...item };
            });

            setOrderWithProducts({
                ...order,
                orderItems: orderItemsWithProducts,
            });
        });
    }, [order, utils]);

    const displayOrder = orderWithProducts || order;

    const [canceling, setCanceling] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleCancel = async () => {
        if (!displayOrder) return;
        setCanceling(true);
        setErrorMsg(null);
        try {
            // Fix: Use correct mutation input shape
            await updateOrder.mutateAsync({
                id: displayOrder.id,
                data: { status: "cancelled" }
            });
            await refetch();
        } catch (err) {
            setErrorMsg(
                err instanceof Error ? err.message : "Failed to cancel order."
            );
        } finally {
            setCanceling(false);
        }
    };

    if (isLoading) return <div className="text-gray-500">Loading order...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;
    if (!displayOrder) return <div className="text-gray-500">Order not found.</div>;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow space-y-8">
            <h1 className="text-2xl font-bold mb-4">Order Detail</h1>
            <div>
                <div><b>Order ID:</b> {displayOrder.id}</div>
                <div><b>Status:</b> {displayOrder.status}</div>
                <div><b>Total:</b> ${displayOrder.totalPrice?.toFixed(2)}</div>
                <div><b>Created:</b> {displayOrder.createdAt && new Date(displayOrder.createdAt).toLocaleString()}</div>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Items</h2>
                {displayOrder.orderItems && displayOrder.orderItems.length > 0 ? (
                    <ul className="space-y-2">
                        {displayOrder.orderItems.map((item: OrderItem) => (
                            <li key={item.id} className="border rounded p-3 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        {item.product?.imageUrl && (
                                            <Image
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                width={64}
                                                height={64}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div>
                                            <b>Product:</b>{" "}
                                            {item.product ? (
                                                <Link href={`/products/${item.product.id}`} className="text-blue-600 hover:underline">
                                                    {item.product.name}
                                                </Link>
                                            ) : (
                                                "Unknown"
                                            )}
                                        </div>
                                    </div>
                                    <div><b>Description:</b> {item.product?.description ?? "No description"}</div>
                                    <div><b>Quantity:</b> {item.quantity}</div>
                                    <div>
                                        <b>Price:</b> ${item.product?.price?.toFixed(2) ?? "N/A"}
                                    </div>
                                    <div>
                                        <b>Item Total:</b> ${item.totalPrice?.toFixed(2) ?? ((item.product?.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-500">No items in this order.</div>
                )}
            </div>
            {errorMsg && <div className="text-red-500">{errorMsg}</div>}
            {displayOrder.status !== "cancelled" && (
                <button
                    className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                    onClick={handleCancel}
                    disabled={canceling}
                >
                    {canceling ? "Cancelling..." : "Cancel Order"}
                </button>
            )}
        </div>
    );
}