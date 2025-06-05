"use client";

import { trpc } from "@/app/_trpc/client";
import { useState, useRef } from "react";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import React from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/Table/Table";
import Alert from "@/components/ui/Alert";

export default function UserTable() {
    const utils = trpc.useUtils();
    const { data = [], isLoading } = trpc.crud.getUsers.useQuery();
    const deleteUser = trpc.crud.deleteUser.useMutation({
        onSuccess: () => utils.crud.getUsers.invalidate()
    });
    const deleteUserImage = trpc.s3.deleteUserImage.useMutation();
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [expanded, setExpanded] = useState<null | { type: "address" | "wishlist" | "cart" | "review", userId: string }>(null);

    const { data: addresses = [] } = trpc.crud.getAddresses.useQuery();
    const { data: wishlists = [] } = trpc.crud.getWishLists.useQuery();
    const { data: wishlistItems = [] } = trpc.crud.getWishListItems.useQuery();
    const { data: carts = [] } = trpc.crud.getCarts.useQuery();
    const { data: cartItems = [] } = trpc.crud.getCartItems.useQuery();
    const { data: reviews = [] } = trpc.crud.getReviews.useQuery();

    const isSelectedAll = data.length > 0 && selected.length === data.length;
    const isIndeterminate = selected.length > 0 && selected.length < data.length;

    const handleSelectAll = () => {
        if (isSelectedAll) {
            setSelected([]);
        } else {
            setSelected(data.map((user) => user.id));
        }
    };

    const handleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const handleDelete = async () => {
        if (selected.length === 0) {
            setAlert({ message: "You have to select at least one user to delete.", type: "warning" });
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
            return;
        }
        // Delete user images from S3 before deleting users
        await Promise.all(selected.map((id) =>
            deleteUserImage.mutateAsync({ userId: id })
        ));
        await Promise.all(selected.map((id) => deleteUser.mutateAsync({ id })));
        setAlert({ message: "User(s) deleted successfully!", type: "success" });
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
        setSelected([]);
    };

    // Filter and reorder users: matching users at the top, others below
    const filteredData = search.trim() === ""
        ? data
        : [
            ...data.filter(
                (user) =>
                    user.id.toLowerCase().includes(search.toLowerCase()) ||
                    user.username.toLowerCase().includes(search.toLowerCase()) ||
                    user.email.toLowerCase().includes(search.toLowerCase())
            ),
            ...data.filter(
                (user) =>
                    !(
                        user.id.toLowerCase().includes(search.toLowerCase()) ||
                        user.username.toLowerCase().includes(search.toLowerCase()) ||
                        user.email.toLowerCase().includes(search.toLowerCase())
                    )
            ),
        ];
    const handleEdit = () => {
        if (selected.length === 1) {
            const userId = selected[0];
            window.location.href = `/dashboard/user/edit/${userId}`;
        } else {
            setAlert({ message: "Please select exactly one user to edit.", type: "warning" });
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
        }
    };

    return (
        <div className="main-section p-4 flex flex-col gap-10 min-w-[50px] bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            {alert && (
                <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
            )}
            <h1 className="font-bold text-[var(--card-title)]">User Management</h1>
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    className="search-box rounded-md p-2 ml-2 text-[var(--foreground)] bg-[var(--gallery)] border border-[var(--ui-border-color)]"
                    placeholder="Search..."
                    title="Search by ID, Name, or Email"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="flex justify-between items-center gap-2">
                    <button
                        onClick={() => {
                            if (selected.length === 0) {
                                setAlert({ message: "Please select exactly one user to edit.", type: "warning" });
                                if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
                                alertTimeoutRef.current = setTimeout(() => setAlert(null), 10000);
                            } else {
                                handleEdit();
                            }
                        }}
                        title="edit selected users"
                        className="cursor-pointer h-fit w-fit p-1 flex rounded-lg transition-colors bg-[var(--gallery)] text-[var(--foreground)] hover:bg-[var(--hover-bg-color)]"
                    >
                        <MdOutlineEdit className="h-6 w-6" />
                    </button>
                    <button
                        onClick={() => {
                            if (selected.length === 0) {
                                setAlert({ message: "You have to select at least one user to delete.", type: "warning" });
                                if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
                                alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
                            } else {
                                handleDelete();
                            }
                        }}
                        title="delete selected users"
                        className="cursor-pointer h-fit w-fit p-1 flex rounded-lg disabled:opacity-50 transition-colors bg-[var(--gallery)] text-[var(--foreground)] hover:bg-[var(--hover-bg-color)]"
                    >
                        <MdDeleteOutline className="h-6 w-6" />
                    </button>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto overflow-y-auto max-h-150 min-h-0  min-w-0">
                <div className="min-w-[200px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex justify-center items-center h-40 text-lg">No user data</div>
                    ) : (
                        <Table className="overflow-x-auto min-w-[200px] max-w-full w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5"
                                            checked={isSelectedAll}
                                            ref={el => {
                                                if (el) el.indeterminate = isIndeterminate;
                                            }}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">ID</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Name</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Email</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Image</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Created At</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Updated At</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((user) => (
                                    <React.Fragment key={user.id}>
                                        <TableRow key={user.id} className="bg-[var(--table-row-bg)] text-[var(--table-row-text)] border-b border-[var(--table-row-border)]">
                                            <TableCell className="px-4 py-2 font-medium text-start text-theme-xs">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5"
                                                    checked={selected.includes(user.id)}
                                                    onChange={() => handleSelect(user.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-start">{user.id}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{user.username}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{user.email}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">
                                                {user.imgUrl ? (
                                                    <Image src={user.imgUrl} alt={user.username} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                                                ) : ""}
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-start">{user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ""}</TableCell>
                                        </TableRow>
                                        {/* Expandable Address Row */}
                                        <TableRow>
                                            <td colSpan={7} className="px-8 py-4 bg-[var(--table-row-alt-bg)] text-[var(--table-row-text)]">
                                                <div className="flex flex-row flex-wrap gap-4 items-center justify-start">
                                                    <button
                                                        className={`mr-2 px-5 py-2 rounded border font-semibold shadow-sm transition-colors duration-150 text-base bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)] hover:bg-[var(--hover-bg-color)] ${expanded?.type === "address" && expanded.userId === user.id ? 'ring-2' : ''}`}
                                                        onClick={() => setExpanded(expanded?.type === "address" && expanded.userId === user.id ? null : { type: "address", userId: user.id })}
                                                    >
                                                        {expanded?.type === "address" && expanded.userId === user.id ? "Hide Addresses" : "Show Addresses"}
                                                    </button>
                                                    <button
                                                        className={`mr-2 px-5 py-2 rounded border font-semibold shadow-sm transition-colors duration-150 text-base bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)] hover:bg-[var(--hover-bg-color)] ${expanded?.type === "wishlist" && expanded.userId === user.id ? 'ring-2' : ''}`}
                                                        onClick={() => setExpanded(expanded?.type === "wishlist" && expanded.userId === user.id ? null : { type: "wishlist", userId: user.id })}
                                                    >
                                                        {expanded?.type === "wishlist" && expanded.userId === user.id ? "Hide Wishlists" : "Show Wishlists"}
                                                    </button>
                                                    <button
                                                        className={`mr-2 px-5 py-2 rounded border font-semibold shadow-sm transition-colors duration-150 text-base bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)] hover:bg-[var(--hover-bg-color)] ${expanded?.type === "cart" && expanded.userId === user.id ? 'ring-2' : ''}`}
                                                        onClick={() => setExpanded(expanded?.type === "cart" && expanded.userId === user.id ? null : { type: "cart", userId: user.id })}
                                                    >
                                                        {expanded?.type === "cart" && expanded.userId === user.id ? "Hide Carts" : "Show Carts"}
                                                    </button>
                                                    <button
                                                        className={`px-5 py-2 rounded border font-semibold shadow-sm transition-colors duration-150 text-base bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)] hover:bg-[var(--hover-bg-color)] ${expanded?.type === "review" && expanded.userId === user.id ? 'ring-2' : ''}`}
                                                        onClick={() => setExpanded(expanded?.type === "review" && expanded.userId === user.id ? null : { type: "review", userId: user.id })}
                                                    >
                                                        {expanded?.type === "review" && expanded.userId === user.id ? "Hide Reviews" : "Show Reviews"}
                                                    </button>
                                                </div>
                                            </td>
                                        </TableRow>
                                        {/* Expanded Content */}
                                        {expanded?.userId === user.id && expanded.type === "address" && (
                                            <TableRow>
                                                <td colSpan={7} style={{ padding: 0, background: "none", border: "none" }}>
                                                    <div className="overflow-hidden rounded-b-lg">
                                                        <div className="bg-[var(--gallery)] border-l-4 border-[var(--yukon-gold)] px-8 py-4 shadow-inner transition-all duration-500 ease-in-out transform-gpu animate-slideDown text-[var(--foreground)]">
                                                            <Table className="min-w-[400px] w-full">
                                                                {addresses.filter(addr => addr.userId === user.id).length === 0 ? (
                                                                    <tbody>
                                                                        <tr>
                                                                            <td colSpan={6} className="text-center text-gray-500">No data</td>
                                                                        </tr>
                                                                    </tbody>
                                                                ) : (
                                                                    <>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">Address</TableCell>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">City</TableCell>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">State</TableCell>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">Country</TableCell>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">Zip Code</TableCell>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">Default</TableCell>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody className="divide-y divide-gray-200">
                                                                            {addresses.filter(addr => addr.userId === user.id).map(addr => (
                                                                                <TableRow key={addr.id}>
                                                                                    <TableCell className="px-4 py-2 text-start">{addr.address}</TableCell>
                                                                                    <TableCell className="px-4 py-2 text-start">{addr.city}</TableCell>
                                                                                    <TableCell className="px-4 py-2 text-start">{addr.state}</TableCell>
                                                                                    <TableCell className="px-4 py-2 text-start">{addr.country}</TableCell>
                                                                                    <TableCell className="px-4 py-2 text-start">{addr.zipCode}</TableCell>
                                                                                    <TableCell className="px-4 py-2 text-start">{typeof addr.default === 'boolean' ? (addr.default ? "Yes" : "No") : ""}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </>
                                                                )}
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </TableRow>
                                        )}
                                        {expanded?.userId === user.id && expanded.type === "wishlist" && (
                                            <TableRow>
                                                <td colSpan={7} style={{ padding: 0, background: "none", border: "none" }}>
                                                    <div className="overflow-hidden rounded-b-lg">
                                                        <div className="bg-[var(--gallery)] border-l-4 border-[var(--yukon-gold)] px-8 py-4 shadow-inner transition-all duration-500 ease-in-out transform-gpu animate-slideDown text-[var(--foreground)]">
                                                            <Table className="min-w-[400px] w-full">
                                                                {wishlists.filter(wl => wl.userId === user.id).flatMap(wl => wishlistItems.filter(item => item.wishListId === wl.id)).length === 0 ? (
                                                                    <tbody>
                                                                        <tr>
                                                                            <td colSpan={2} className="text-center text-gray-500">No data</td>
                                                                        </tr>
                                                                    </tbody>
                                                                ) : (
                                                                    <>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">Wishlist ID</TableCell>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">Product ID</TableCell>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody className="divide-y divide-gray-200">
                                                                            {wishlists.filter(wl => wl.userId === user.id).flatMap(wl =>
                                                                                wishlistItems.filter(item => item.wishListId === wl.id).map(item => (
                                                                                    <TableRow key={item.id}>
                                                                                        <TableCell className="px-4 py-2 text-start">{wl.id}</TableCell>
                                                                                        <TableCell className="px-4 py-2 text-start">{item.productId}</TableCell>
                                                                                    </TableRow>
                                                                                ))
                                                                            )}
                                                                        </TableBody>
                                                                    </>
                                                                )}
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </TableRow>
                                        )}
                                        {expanded?.userId === user.id && expanded.type === "cart" && (
                                            <TableRow>
                                                <td colSpan={7} style={{ padding: 0, background: "none", border: "none" }}>
                                                    <div className="overflow-hidden rounded-b-lg">
                                                        <div className="bg-[var(--gallery)] border-l-4 border-[var(--yukon-gold)] px-8 py-4 shadow-inner transition-all duration-500 ease-in-out transform-gpu animate-slideDown text-[var(--foreground)]">
                                                            <Table className="min-w-[400px] w-full">
                                                                {carts.filter(cart => cart.userId === user.id).flatMap(cart => cartItems.filter(item => item.cartId === cart.id)).length === 0 ? (
                                                                    <tbody>
                                                                        <tr>
                                                                            <td colSpan={3} className="text-center text-gray-500">No data</td>
                                                                        </tr>
                                                                    </tbody>
                                                                ) : (
                                                                    <>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">Cart ID</TableCell>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">Product ID</TableCell>
                                                                                <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs">Quantity</TableCell>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody className="divide-y divide-gray-200">
                                                                            {carts.filter(cart => cart.userId === user.id).flatMap(cart =>
                                                                                cartItems.filter(item => item.cartId === cart.id).map(item => (
                                                                                    <TableRow key={item.id}>
                                                                                        <TableCell className="px-4 py-2 text-start">{cart.id}</TableCell>
                                                                                        <TableCell className="px-4 py-2 text-start">{item.productId}</TableCell>
                                                                                        <TableCell className="px-4 py-2 text-start">{item.quantity}</TableCell>
                                                                                    </TableRow>
                                                                                ))
                                                                            )}
                                                                        </TableBody>
                                                                    </>
                                                                )}
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </TableRow>
                                        )}
                                        {expanded?.userId === user.id && expanded.type === "review" && (
                                            <TableRow>
                                                <td colSpan={7} style={{ padding: 0, background: "none", border: "none" }}>
                                                    <div className="overflow-hidden rounded-b-lg">
                                                        <div className="bg-[var(--gallery)] border-l-4 border-[var(--yukon-gold)] px-8 py-4 shadow-inner transition-all duration-500 ease-in-out transform-gpu animate-slideDown text-[var(--foreground)]">
                                                            <Table className="min-w-[400px] w-full">
                                                                {reviews.filter(r => r.userId === user.id).length === 0 ? (
                                                                    <tbody>
                                                                        <tr>
                                                                            <td colSpan={5} className="text-center text-gray-500">No data</td>
                                                                        </tr>
                                                                    </tbody>
                                                                ) : (
                                                                    <>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableCell isHeader>Review ID</TableCell>
                                                                                <TableCell isHeader>Product</TableCell>
                                                                                <TableCell isHeader>Rating</TableCell>
                                                                                <TableCell isHeader>Comment</TableCell>
                                                                                <TableCell isHeader>Created At</TableCell>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody className="divide-y divide-gray-200">
                                                                            {reviews.filter(r => r.userId === user.id).map(r => (
                                                                                <TableRow key={r.id}>
                                                                                    <TableCell>{r.id}</TableCell>
                                                                                    <TableCell>{r.productId}</TableCell>
                                                                                    <TableCell>{r.rating}</TableCell>
                                                                                    <TableCell>{r.comment}</TableCell>
                                                                                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </>
                                                                )}
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
            <div className="mt-4">
                <Link href="/dashboard/user/create" className="bg-[var(--button-primary)] text-[var(--foreground)] px-4 py-2 rounded hover:bg-[var(--button-primary-hover)]">
                    Add User
                </Link>
            </div>
        </div>
    );
}