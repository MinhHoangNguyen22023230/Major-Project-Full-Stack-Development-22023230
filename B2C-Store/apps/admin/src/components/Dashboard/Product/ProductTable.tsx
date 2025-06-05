"use client";

import React, { useState, useRef } from "react";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { Loader2 } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/Table/Table";
import Image from "next/image";

type Brand = { id: string; name: string };
type Category = { id: string; name: string };
type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    brandId?: string;
    categoryId?: string;
    createdAt?: string;
    updatedAt?: string;
    stock?: number;
};

export default function ProductTable() {
    const utils = trpc.useUtils();
    const { data = [], isLoading } = trpc.crud.getProducts.useQuery();
    const { data: brands = [] } = trpc.crud.getBrands.useQuery();
    const { data: categories = [] } = trpc.crud.getCategories.useQuery();
    const deleteProduct = trpc.crud.deleteProduct.useMutation({
        onSuccess: () => utils.crud.getProducts.invalidate()
    });
    const deleteProductImage = trpc.s3.deleteProductImage.useMutation();
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isSelectedAll = data.length > 0 && selected.length === data.length;
    const isIndeterminate = selected.length > 0 && selected.length < data.length;

    const handleSelectAll = () => {
        if (isSelectedAll) {
            setSelected([]);
        } else {
            setSelected(data.map((product) => product.id));
        }
    };

    const handleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const handleDelete = async () => {
        if (selected.length === 0) {
            setAlert({ message: "You have to select at least one product to delete.", type: "warning" });
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
            return;
        }
        // Delete product images from S3 before deleting products
        await Promise.all(selected.map((id) =>
            deleteProductImage.mutateAsync({ productId: id })
        ));
        await Promise.all(selected.map((id) => deleteProduct.mutateAsync({ id })));
        setAlert({ message: "Product(s) deleted successfully!", type: "success" });
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
        setSelected([]);
    };

    // Filter and reorder products: matching products at the top, others below
    const filteredData: Product[] = search.trim() === ""
        ? data
        : [
            ...data.filter(
                (product) =>
                    product.id.toLowerCase().includes(search.toLowerCase()) ||
                    product.name.toLowerCase().includes(search.toLowerCase())
            ),
            ...data.filter(
                (product) =>
                    !(
                        product.id.toLowerCase().includes(search.toLowerCase()) ||
                        product.name.toLowerCase().includes(search.toLowerCase())
                    )
            ),
        ];
    const handleEdit = () => {
        if (selected.length === 1) {
            const productId = selected[0];
            window.location.href = `/dashboard/product/edit/${productId}`;
        } else {
            setAlert({ message: "Please select exactly one product to edit.", type: "warning" });
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
        }
    };

    return (
        <div className="main-section p-4 flex flex-col gap-10 min-w-[50px] bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            {alert && (
                <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
            )}
            <h1 className="font-bold text-[var(--card-title)]">Product Management</h1>
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    className="search-box rounded-md p-2 ml-2 text-[var(--foreground)] bg-[var(--gallery)] border border-[var(--ui-border-color)]"
                    placeholder="Search..."
                    title="Search by ID or Name"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="flex justify-between items-center gap-2">
                    <button
                        onClick={() => {
                            if (selected.length === 0) {
                                setAlert({ message: "Please select exactly one product to edit.", type: "warning" });
                                if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
                                alertTimeoutRef.current = setTimeout(() => setAlert(null), 10000);
                            } else {
                                handleEdit();
                            }
                        }}
                        title="edit selected product"
                        className="cursor-pointer h-fit w-fit p-1 flex rounded-lg transition-colors bg-[var(--gallery)] text-[var(--foreground)] hover:bg-[var(--hover-bg-color)]"
                    >
                        <MdOutlineEdit className="h-6 w-6" />
                    </button>
                    <button
                        onClick={() => {
                            if (selected.length === 0) {
                                setAlert({ message: "You have to select at least one product to delete.", type: "warning" });
                                if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
                                alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
                            } else {
                                handleDelete();
                            }
                        }}
                        title="delete selected product"
                        className="cursor-pointer h-fit w-fit p-1 flex rounded-lg disabled:opacity-50 transition-colors bg-[var(--gallery)] text-[var(--foreground)] hover:bg-[var(--hover-bg-color)]"
                    >
                        <MdDeleteOutline className="h-6 w-6" />
                    </button>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto overflow-y-auto max-h-150 min-w-0">
                <div className="min-w-[200px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex justify-center items-center h-40 text-lg">No product data</div>
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
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Price</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Image</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Brand</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Category</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Created At</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Updated At</TableCell>
                                    <TableCell isHeader className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Stock</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((product: Product) => {
                                    const brand = brands.find((b: Brand) => b.id === product.brandId);
                                    const category = categories.find((c: Category) => c.id === product.categoryId);
                                    return (
                                        <TableRow key={product.id} className="bg-[var(--table-row-bg)] text-[var(--table-row-text)] border-b border-[var(--table-row-border)]">
                                            <TableCell className="px-4 py-2 font-medium text-start text-theme-xs">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5"
                                                    checked={selected.includes(product.id)}
                                                    onChange={() => handleSelect(product.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-start">{product.id}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{product.name}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">${product.price}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">
                                                {product.imageUrl ? (
                                                    <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="w-12 h-12 object-cover rounded" />
                                                ) : (
                                                    <span className="text-xs text-gray-400">No image</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-start">{brand ? brand.name : <span className="text-xs text-gray-400">-</span>}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{category ? category.name : <span className="text-xs text-gray-400">-</span>}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{product.stock ?? <span className="text-xs text-gray-400">-</span>}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{product.createdAt ? new Date(product.createdAt).toLocaleString() : "-"}</TableCell>
                                            <TableCell className="px-4 py-2 text-start">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "-"}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
            <div className="mt-4">
                <Link href="/dashboard/product/create" className="bg-[var(--button-primary)] text-[var(--foreground)] px-4 py-2 rounded hover:bg-[var(--button-primary-hover)]">
                    Add Product
                </Link>
            </div>
        </div>
    );
}
