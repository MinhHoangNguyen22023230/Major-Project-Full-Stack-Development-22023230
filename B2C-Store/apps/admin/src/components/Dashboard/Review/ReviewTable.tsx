"use client";

import React, { useState, useRef } from "react";
import { trpc } from "@/app/_trpc/client";
import { MdDeleteOutline } from "react-icons/md";
import { Loader2 } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/Table/Table";

export default function ReviewTable() {
    const utils = trpc.useUtils();
    const { data = [], isLoading } = trpc.crud.getReviews.useQuery();
    const deleteReview = trpc.crud.deleteReview.useMutation({
        onSuccess: () => utils.crud.getReviews.invalidate()
    });
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isSelectedAll = data.length > 0 && selected.length === data.length;
    const isIndeterminate = selected.length > 0 && selected.length < data.length;

    // Use normalizedData for select all
    const handleSelectAll = () => {
        if (isSelectedAll) {
            setSelected([]);
        } else {
            setSelected(normalizedData.map((review) => review.id));
        }
    };

    const handleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const handleDelete = async () => {
        if (selected.length === 0) {
            setAlert({ message: "You have to select at least one review to delete.", type: "warning" });
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
            return;
        }
        await Promise.all(selected.map((id) => deleteReview.mutateAsync({ id })));
        setAlert({ message: "Review(s) deleted successfully!", type: "success" });
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
        setSelected([]);
    };

    // Normalize reviews so rating is always a number
    type RawReview = typeof data extends (infer U)[] ? U : never;
    const normalizedData = data.map((review: RawReview) => ({
        ...review,
        rating: typeof review.rating === 'number' ? review.rating : 0,
        comment: typeof review.comment === 'string' ? review.comment : '',
        user: review.user ? {
            username: typeof review.user.username === 'string' ? review.user.username : undefined,
            id: typeof review.user.id === 'string' ? review.user.id : undefined,
        } : undefined,
        product: review.product ? {
            ...review.product,
            name: typeof review.product.name === 'string' ? review.product.name : undefined,
        } : undefined,
    }));

    // Filter and reorder reviews: matching reviews at the top, others below
    const filteredData: typeof normalizedData = search.trim() === ""
        ? normalizedData
        : [
            ...normalizedData.filter(
                (review) =>
                    review.id.toLowerCase().includes(search.toLowerCase()) ||
                    (review.user?.username?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
                    (review.product?.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
            ),
            ...normalizedData.filter(
                (review) =>
                    !(
                        review.id.toLowerCase().includes(search.toLowerCase()) ||
                        (review.user?.username?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
                        (review.product?.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
                    )
            ),
        ];

    return (
        <div className="main-section p-4 flex flex-col gap-10 min-w-[50px] bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            {alert && (
                <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
            )}
            <h1 className="font-bold text-[var(--card-title)]">Review Management</h1>
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    className="search-box rounded-md p-2 ml-2 text-[var(--foreground)] bg-[var(--gallery)] border border-[var(--ui-border-color)]"
                    placeholder="Search by ID, Username, or Product Name"
                    title="Search by ID, Username, or Product Name"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button
                    onClick={() => {
                        if (selected.length === 0) {
                            setAlert({ message: "You have to select at least one review to delete.", type: "warning" });
                            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
                            alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
                        } else {
                            handleDelete();
                        }
                    }}
                    title="delete selected review"
                    className="cursor-pointer h-fit w-fit p-1 flex rounded-lg disabled:opacity-50 transition-colors bg-[var(--gallery)] text-[var(--foreground)] hover:bg-[var(--hover-bg-color)]"
                >
                    <MdDeleteOutline className="h-6 w-6" />
                </button>
            </div>
            <div className="max-w-full overflow-x-auto overflow-y-auto max-h-150 min-w-0">
                <div className="min-w-[200px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex justify-center items-center h-40 text-lg">No review data</div>
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
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">User</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Product</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Rating</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Comment</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Created At</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Updated At</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((review) => (
                                    <TableRow key={review.id} className="bg-[var(--table-row-bg)] text-[var(--table-row-text)] border-b border-[var(--table-row-border)]">
                                        <TableCell className="px-4 py-2 font-medium text-start text-theme-xs">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5"
                                                checked={selected.includes(review.id)}
                                                onChange={() => handleSelect(review.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-start">{review.id}</TableCell>
                                        <TableCell className="px-4 py-2 text-start">{review.user?.username || review.user?.id || "-"}</TableCell>
                                        <TableCell className="px-4 py-2 text-start">{review.product?.name || review.product?.id || "-"}</TableCell>
                                        <TableCell className="px-4 py-2 text-start">{review.rating}</TableCell>
                                        <TableCell className="px-4 py-2 text-start">{review.comment}</TableCell>
                                        <TableCell className="px-4 py-2 text-start">{review.createdAt ? new Date(review.createdAt).toLocaleString() : "-"}</TableCell>
                                        <TableCell className="px-4 py-2 text-start">{review.updatedAt ? new Date(review.updatedAt).toLocaleString() : "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
