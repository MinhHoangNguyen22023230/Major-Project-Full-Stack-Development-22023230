"use client";

import React, { useState, useRef } from "react";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import Link from "next/link";
import { UploadButton } from "@uploadthing/react";

// --- Types ---
type WishListItem = {
    id: string;
    WishList?: { id: string; createdAt: string; updatedAt: string; userId: string } | null;
    product: {
        id: string;
        name: string;
        imageUrl?: string;
        price: number;
    };
};

type Address = {
    id: string;
    street?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    zipCode?: string;
    country?: string;
    default?: boolean;
};

type Review = {
    id: string;
    productId: string;
    rating: number | null;
    comment?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

type OrderItem = {
    id: string;
    productId?: string;
    product?: {
        name?: string;
        price?: number;
    };
    quantity?: number;
};

type Order = {
    id: string;
    totalPrice?: number | null;
    status?: string;
    orderItems?: OrderItem[];
};

export default function Profile({ params }: { params: Promise<{ profile: string }> }) {
    // Unwrap params using React.use()
    const { profile } = React.use(params);

    const { data: user, isLoading, error, refetch } = trpc.crud.findUserById.useQuery(
        { id: profile },
        { enabled: !!profile }
    );

    // Fetch wishlist items (with products) for this user
    const { data: wishListItems } = trpc.crud.getWishListItems.useQuery(undefined, {
        enabled: !!user,
    });

    // Add address mutation
    const addAddress = trpc.crud.createAddress.useMutation();
    // Delete address mutation
    const deleteAddress = trpc.crud.deleteAddress.useMutation();
    // Update address mutation
    const updateAddress = trpc.crud.updateAddress.useMutation();
    const uploadUserImage = trpc.s3.useMutation(['uploadUserImage']);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [form, setForm] = useState({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        default: false,
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // --- Add product data to orders ---
    const [ordersWithProducts, setOrdersWithProducts] = useState<Order[] | null>(null);
    const utils = trpc.useUtils();

    React.useEffect(() => {
        if (!user?.orders || user.orders.length === 0) {
            setOrdersWithProducts(user?.orders ?? []);
            return;
        }
        // Find all missing productIds
        const missingProductIds = user.orders.flatMap((order: Order) =>
            (order.orderItems ?? [])
                .filter((item: OrderItem) => !item.product && item.productId)
                .map((item: OrderItem) => item.productId as string)
        );
        // Remove duplicates
        const uniqueProductIds = Array.from(new Set(missingProductIds));
        if (uniqueProductIds.length === 0) {
            setOrdersWithProducts(user.orders.map((order: Order) => ({
                ...order,
                orderItems: order.orderItems ?? [],
            })));
            return;
        }
        Promise.all(
            uniqueProductIds.map((id: string) =>
                utils.crud.findProductById.fetch({ id }).catch(() => undefined)
            )
        ).then(products => {
            const productsById: Record<string, { id: string; name?: string; price?: number }> = {};
            products.forEach(product => {
                if (product) productsById[product.id] = product;
            });
            // Attach product data to each orderItem
            const orders = user.orders.map((order: Order) => ({
                ...order,
                orderItems: (order.orderItems ?? []).map((item: OrderItem) => ({
                    ...item,
                    product: item.product || (item.productId ? productsById[item.productId] : undefined),
                })),
            }));
            setOrdersWithProducts(orders);
        });
    }, [user, utils]);
    // --- End add product data to orders ---

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!form.street || !form.city || !form.state || !form.zip || !form.country) {
            setFormError("All fields are required.");
            return;
        }
        if (!user) {
            setFormError("User not loaded.");
            return;
        }
        try {
            await addAddress.mutateAsync({
                userId: user.id,
                address: form.street,
                city: form.city,
                state: form.state,
                country: form.country,
                zipCode: form.zip,
                default: form.default,
            });
            setShowAddForm(false);
            setForm({ street: "", city: "", state: "", zip: "", country: "", default: false });
            refetch();
        } catch (err: unknown) {
            if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
                setFormError((err as { message: string }).message);
            } else {
                setFormError("Failed to add address.");
            }
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        setDeleteError(null);
        try {
            await deleteAddress.mutateAsync({ id: addressId });
            refetch();
        } catch (err: unknown) {
            if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
                setDeleteError((err as { message: string }).message);
            } else {
                setDeleteError("Failed to delete address.");
            }
        }
    };

    const handleSetDefaultAddress = async (addressId: string) => {
        setDeleteError(null);
        try {
            await updateAddress.mutateAsync({
                id: addressId,
                data: { default: true },
            });
            refetch();
        } catch (err: unknown) {
            if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
                setDeleteError((err as { message: string }).message);
            } else {
                setDeleteError("Failed to set default address.");
            }
        }
    };

    // Handler for UploadThing
    const handleImageUpload = async (files: File[]) => {
        if (!user || !files.length) return;
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        await uploadUserImage.mutateAsync({
            userId: user.id,
            filename: file.name,
            body: new Uint8Array(arrayBuffer),
            contentType: file.type,
        });
        refetch();
    };

    // Handler for file input upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            await uploadUserImage.mutateAsync({
                userId: user.id,
                filename: file.name,
                body: new Uint8Array(arrayBuffer),
                contentType: file.type,
            });
            refetch();
        } catch (err: any) {
            setUploadError(err?.message || "Failed to upload image");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (isLoading) return <div className="text-gray-500">Loading profile...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;
    if (!user) return <div className="text-gray-500">User not found.</div>;

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow space-y-10">
            {/* Profile Header */}
            <div className="flex flex-col items-center gap-4">
                {user.imgUrl && (
                    <img
                        src={user.imgUrl}
                        alt={user.username}
                        width={120}
                        height={120}
                        className="rounded-full"
                    />
                )}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="mb-2"
                />
                {uploading && <div className="text-blue-600">Uploading...</div>}
                {uploadError && <div className="text-red-500">{uploadError}</div>}
                <h1 className="text-3xl font-bold">{user.username}</h1>
                <p className="text-gray-700">{user.email}</p>
            </div>

            {/* User Details */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Details</h2>
                <ul className="list-disc list-inside space-y-1">
                    <li><b>User ID:</b> {user.id}</li>
                    {user.cart && <li><b>Cart ID:</b> {user.cart.id}</li>}
                    <li><b>Orders:</b> {user.orders?.length ?? 0}</li>
                    <li><b>Addresses:</b> {user.addresses?.length ?? 0}</li>
                    <li><b>Wish List:</b> {wishListItems && wishListItems.length > 0 ? "Yes" : "No"}</li>
                    <li><b>Reviews:</b> {user.reviews?.length ?? 0}</li>
                </ul>
            </div>

            {/* Wish List Products */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Wish List Products</h2>
                {wishListItems && wishListItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {wishListItems
                            .filter((item: WishListItem) => item.WishList?.userId === user.id && item.product)
                            .map((item: WishListItem) => (
                                <div key={item.id} className="flex items-center gap-4 p-2 border rounded hover:bg-gray-50">
                                    <Link href={`/products/${item.product.id}`} className="flex items-center gap-4">
                                        <Image
                                            src={item.product.imageUrl || "/no-product-image.png"}
                                            alt={item.product.name}
                                            width={60}
                                            height={60}
                                            className="rounded"
                                        />
                                        <div>
                                            <div className="font-semibold">{item.product.name}</div>
                                            <div className="text-sm text-gray-600">${item.product.price?.toFixed(2)}</div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-gray-500">No products in wish list.</div>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Orders</h2>
                {(ordersWithProducts ?? user.orders)?.length ? (
                    <div className="space-y-4">
                        {(ordersWithProducts ?? user.orders)?.map((order: Order) => (
                            <Link key={order.id} href={`/order/${order.id}`} className="block hover:bg-gray-50">
                                <div key={order.id} className="border rounded p-4">
                                    <div className="font-semibold">Order ID: {order.id}</div>
                                    <div className="text-sm text-gray-600">Total: ${order.totalPrice?.toFixed(2)}</div>
                                    <div className="text-sm text-gray-600">Status: {order.status}</div>
                                    <div className="mt-2">
                                        <div className="font-medium">Products:</div>
                                        <ul className="list-disc list-inside ml-4">
                                            {(order.orderItems ?? []).map((item: OrderItem) => (
                                                <li key={item.id}>
                                                    {item.product?.name ?? "Unknown"} x{item.quantity ?? 0} (${item.product?.price?.toFixed(2) ?? "N/A"})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500">No orders placed.</div>
                )}
            </div>
            {/* Reviews */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Reviews</h2>
                {user.reviews && user.reviews.length > 0 ? (
                    <ul className="space-y-4">
                        {user.reviews.map((review: Review) => (
                            <Link key={review.id} href={`/products/${review.productId}`} className="font-semibold hover:underline">
                                <li className="border rounded p-4">

                                    <div className="font-semibold">Product ID: {review.productId}</div>
                                    <div className="text-yellow-600">Rating: {review.rating} / 5</div>
                                    {review.comment && (
                                        <div className="text-gray-700 mt-2">{review.comment}</div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2">
                                        {review.createdAt && (
                                            <>Reviewed on {new Date(review.createdAt).toLocaleDateString()}</>
                                        )}
                                    </div>
                                </li>
                            </Link>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-500">No reviews found.</div>
                )}
            </div>
            {/* Addresses */}
            <div>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold mb-2">Addresses</h2>
                    <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => setShowAddForm((v: boolean) => !v)}
                    >
                        {showAddForm ? "Cancel" : "Add Address"}
                    </button>
                </div>
                {showAddForm && (
                    <form onSubmit={handleAddAddress} className="mb-4 space-y-2 bg-gray-50 p-4 rounded">
                        <div>
                            <label className="block font-medium mb-1">Street</label>
                            <input
                                type="text"
                                className="w-full border rounded px-2 py-1"
                                value={form.street}
                                onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">City</label>
                            <input
                                type="text"
                                className="w-full border rounded px-2 py-1"
                                value={form.city}
                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">State</label>
                            <input
                                type="text"
                                className="w-full border rounded px-2 py-1"
                                value={form.state}
                                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Zip</label>
                            <input
                                type="text"
                                className="w-full border rounded px-2 py-1"
                                value={form.zip}
                                onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Country</label>
                            <input
                                type="text"
                                className="w-full border rounded px-2 py-1"
                                value={form.country}
                                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="default"
                                checked={form.default}
                                onChange={e => setForm(f => ({ ...f, default: e.target.checked }))}
                            />
                            <label htmlFor="default" className="text-sm">Set as default</label>
                        </div>
                        {formError && <div className="text-red-500">{formError}</div>}
                        <button
                            type="submit"
                            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Add Address
                        </button>
                    </form>
                )}
                {deleteError && <div className="text-red-500">{deleteError}</div>}
                {user.addresses?.length ? (
                    <ul className="space-y-2">
                        {user.addresses.map((address: Address) => {
                            // Collect non-empty fields in order
                            const fields = [
                                address.street || address.address,
                                address.city,
                                address.state,
                                address.zipCode || address.zip,
                                address.country,
                            ].filter(Boolean);
                            return (
                                <li key={address.id} className="border rounded p-3 flex items-center justify-between">
                                    <div>
                                        {fields.join(", ")}
                                        {address.default ? (
                                            <span className="text-xs text-green-600 ml-2">(Default)</span>
                                        ) : (
                                            <button
                                                className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                                                onClick={() => handleSetDefaultAddress(address.id)}
                                                type="button"
                                            >
                                                Set as default
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        className="ml-4 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                        onClick={() => handleDeleteAddress(address.id)}
                                        type="button"
                                    >
                                        Delete
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-gray-500">No addresses found.</div>
                )}
            </div>
        </div >
    );
}