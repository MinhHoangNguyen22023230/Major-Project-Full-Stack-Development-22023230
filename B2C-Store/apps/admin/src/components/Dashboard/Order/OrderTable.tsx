"use client";

import { trpc } from "@/app/_trpc/client";
import { useState, useRef } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { Loader2 } from "lucide-react";
import Alert from "@/components/ui/Alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/Table/Table";
import React from "react";

type Product = { id: string; name?: string; price?: number };
type OrderItem = {
    id: string;
    productId: string;
    quantity: number;
    totalPrice?: number;
    product?: Product | null;
};

export default function OrderTable() {
    const utils = trpc.useUtils();
    const { data = [], isLoading } = trpc.crud.getOrders.useQuery();
    const deleteOrder = trpc.crud.deleteOrder.useMutation({
        onSuccess: () => utils.crud.getOrders.invalidate()
    });
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const [expanded, setExpanded] = useState<string[]>([]);
    const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isSelectedAll = data.length > 0 && selected.length === data.length;
    const isIndeterminate = selected.length > 0 && selected.length < data.length;

    const handleSelectAll = () => {
        if (isSelectedAll) {
            setSelected([]);
        } else {
            setSelected(data.map((order) => order.id));
        }
    };

    const handleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const handleDelete = async () => {
        if (selected.length === 0) {
            setAlert({ message: "You have to select at least one order to delete.", type: "warning" });
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
            return;
        }
        await Promise.all(selected.map((id) => deleteOrder.mutateAsync({ id })));
        setAlert({ message: "Order(s) deleted successfully!", type: "success" });
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
        setSelected([]);
    };

    // Filter and reorder orders: matching orders at the top, others below
    const filteredData = search.trim() === ""
        ? data
        : [
            ...data.filter(
                (order) =>
                    order.id.toLowerCase().includes(search.toLowerCase()) ||
                    (order.user?.username?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
                    (order.user?.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
            ),
            ...data.filter(
                (order) =>
                    !(
                        order.id.toLowerCase().includes(search.toLowerCase()) ||
                        (order.user?.username?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
                        (order.user?.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
                    )
            ),
        ];

    const handleExpand = (id: string) => {
        setExpanded((prev) =>
            prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
        );
    };

    return (
        <div className="main-section p-4 flex flex-col gap-10 min-w-[50px] bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            {alert && (
                <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
            )}
            <h1 className="font-bold text-[var(--card-title)]">Order Management</h1>
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    className="search-box rounded-md p-2 ml-2 text-[var(--foreground)] bg-[var(--gallery)] border border-[var(--ui-border-color)]"
                    placeholder="Search..."
                    title="Search by ID, User, or Email"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="flex justify-between items-center gap-2">
                    <button
                        onClick={() => {
                            if (selected.length === 0) {
                                setAlert({ message: "You have to select at least one order to delete.", type: "warning" });
                                if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
                                alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
                            } else {
                                handleDelete();
                            }
                        }}
                        title="delete selected orders"
                        className="cursor-pointer h-fit w-fit p-1 flex rounded-lg disabled:opacity-50 transition-colors bg-[var(--gallery)] text-[var(--foreground)] border border-[var(--ui-border-color)] hover:bg-[var(--hover-bg-color)]"
                    >
                        <MdDeleteOutline className="h-6 w-6" />
                    </button>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto min-w-0 overflow-y-auto max-h-150">
                <div className="min-w-[200px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex justify-center items-center h-40 text-lg">No order data</div>
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
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Order ID</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">User</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var,--card-title)] border-b border-[var(--ui-border-color)]">Email</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Items</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Total Price</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Status</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Created At</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Updated At</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((order) => (
                                    <React.Fragment key={order.id}>
                                        <TableRow key={order.id} className="bg-[var(--table-row-bg)] text-[var(--table-row-text)] border-b border-[var(--table-row-border)]">
                                            <TableCell className="px-4 py-2 font-medium text-start text-theme-xs">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5"
                                                    checked={selected.includes(order.id)}
                                                    onChange={() => handleSelect(order.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-start">{order.id}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{order.user?.username || "-"}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{order.user?.email || "-"}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{order.itemsCount}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">${typeof order.totalPrice === "number" ? order.totalPrice.toFixed(2) : "-"}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{order.status}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : ""}</TableCell>
                                        </TableRow>
                                        {/* Expandable Order Items Row */}
                                        <TableRow>
                                            <td colSpan={9} className={`px-8 py-4 bg-[var(--table-row-alt-bg)] text-[var(--table-row-text)]`}>
                                                <button
                                                    className={`mr-2 px-5 py-2 rounded border font-semibold shadow-sm transition-colors duration-150 text-base bg-[var(--gallery)] text-[var(--foreground)] border-[var(--ui-border-color)] hover:bg-[var(--hover-bg-color)] ${expanded.includes(order.id) ? 'ring-2' : ''}`}
                                                    onClick={() => handleExpand(order.id)}
                                                >
                                                    {expanded.includes(order.id) ? "Hide Order Items" : "Show Order Items"}
                                                </button>
                                            </td>
                                        </TableRow>
                                        {/* Expanded Content */}
                                        {expanded.includes(order.id) && order.orderItems && order.orderItems.length > 0 && (
                                            <TableRow key={order.id + "-items"}>
                                                <td colSpan={9} style={{ padding: 0, background: 'none', border: 'none' }}>
                                                    <div className="overflow-hidden rounded-b-lg">
                                                        <div className="bg-[var(--gallery)] border-l-4 border-[var(--yukon-gold)] px-8 py-4 shadow-inner transition-all duration-500 ease-in-out transform-gpu animate-slideDown text-[var(--foreground)]">
                                                            <Table className="min-w-[400px] w-full">
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">OrderItem ID</TableCell>
                                                                        <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Product</TableCell>
                                                                        <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Product Price</TableCell>
                                                                        <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Quantity</TableCell>
                                                                        <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Total Price</TableCell>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {order.orderItems.map((item: OrderItem) => (
                                                                        <TableRow key={item.id} className="bg-[var(--table-row-bg)] text-[var(--table-row-text)] border-b border-[var(--table-row-border)]">
                                                                            <TableCell className="px-4 py-2 text-start">{item.id}</TableCell>
                                                                            <TableCell className="px-4 py-2 text-start">
                                                                                {item.product?.name ? `${item.productId} - ${item.product.name}` : item.productId}
                                                                            </TableCell>
                                                                            <TableCell className="px-4 py-2 text-start">
                                                                                {typeof item.product?.price === 'number' ? `$${item.product.price.toFixed(2)}` : '-'}
                                                                            </TableCell>
                                                                            <TableCell className="px-4 py-2 text-start">{item.quantity}</TableCell>
                                                                            <TableCell className="px-4 py-2 text-start">${typeof item.totalPrice === "number" ? item.totalPrice.toFixed(2) : "-"}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
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
        </div>
    );
}
