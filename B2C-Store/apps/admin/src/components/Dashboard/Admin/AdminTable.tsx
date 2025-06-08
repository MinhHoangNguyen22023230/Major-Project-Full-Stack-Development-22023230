"use client";

import { useState, useRef } from "react";
import { trpc } from "@/app/_trpc/client";
import Alert from "@/components/ui/Alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { useAdminSession } from "@/app/clientLayout";
import Image from "next/image";

export default function AdminTable() {
    const utils = trpc.useUtils();
    const { data = [], isLoading } = trpc.crud.getAdmins.useQuery();
    const deleteAdmin = trpc.crud.deleteAdmin.useMutation({
        onSuccess: () => utils.crud.getAdmins.invalidate()
    });
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { userId } = useAdminSession();
    const { data: sessionAdmin } = trpc.crud.findAdminById.useQuery({ id: userId || "" }, { enabled: !!userId });
    const isSuperAdmin = sessionAdmin?.role === "SuperAdmin";

    const isSelectedAll = data.length > 0 && selected.length === data.length;

    const handleSelectAll = () => {
        if (isSelectedAll) {
            setSelected([]);
        } else {
            setSelected(data.map((admin) => admin.id));
        }
    };

    const handleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const handleDelete = async () => {
        if (selected.length === 0) {
            setAlert({ message: "You have to select at least one admin to delete.", type: "warning" });
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
            return;
        }
        await Promise.all(selected.map((id) => deleteAdmin.mutateAsync({ id })));
        setAlert({ message: "Admin(s) deleted successfully!", type: "success" });
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
        setSelected([]);
    };

    const filteredData = search.trim() === ""
        ? data
        : [
            ...data.filter(
                (admin) =>
                    admin.id.toLowerCase().includes(search.toLowerCase()) ||
                    admin.username.toLowerCase().includes(search.toLowerCase()) ||
                    admin.email.toLowerCase().includes(search.toLowerCase())
            ),
            ...data.filter(
                (admin) =>
                    !(
                        admin.id.toLowerCase().includes(search.toLowerCase()) ||
                        admin.username.toLowerCase().includes(search.toLowerCase()) ||
                        admin.email.toLowerCase().includes(search.toLowerCase())
                    )
            ),
        ];

    const handleEdit = () => {
        if (selected.length === 1) {
            const adminId = selected[0];
            window.location.href = `/dashboard/admin/edit/${adminId}`;
        } else {
            setAlert({ message: "Please select exactly one admin to edit.", type: "warning" });
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
        }
    };

    return (
        <div className="main-section p-4 flex flex-col gap-10 min-w-[50px] bg-[var(--navbar-and-sidebar-bg)] text-[var(--foreground)]">
            {alert && (
                <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
            )}
            <h1 className="font-bold text-[var(--card-title)]">Admin Management</h1>
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    className="search-box rounded-md p-2 ml-2 text-[var(--foreground)] bg-[var(--gallery)] border border-[var(--ui-border-color)]"
                    placeholder="Search by ID, Name, or Email"
                    title="Search by ID, Name, or Email"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {isSuperAdmin && (
                    <div className="flex justify-between items-center gap-2">
                        <button
                            onClick={handleEdit}
                            title="edit selected admins"
                            className="cursor-pointer h-fit w-fit p-1 flex rounded-lg transition-colors bg-[var(--gallery)] text-[var(--foreground)] hover:bg-[var(--hover-bg-color)]"
                        >
                            <MdOutlineEdit className="h-6 w-6" />
                        </button>
                        <button
                            onClick={handleDelete}
                            title="delete selected admins"
                            className="cursor-pointer h-fit w-fit p-1 flex rounded-lg disabled:opacity-50 transition-colors bg-[var(--gallery)] text-[var(--foreground)] hover:bg-[var(--hover-bg-color)]"
                        >
                            <MdDeleteOutline className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </div>
            <div className="max-w-full overflow-x-auto overflow-y-auto max-h-150 min-h-0  min-w-0">
                <div className="min-w-[200px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin w-10 h-10 text-[var(--card-title)]" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex justify-center items-center h-40 text-lg">No admin data</div>
                    ) : (
                        <table className="overflow-x-auto min-w-[200px] max-w-full w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5"
                                            checked={isSelectedAll}
                                            onChange={handleSelectAll}
                                            disabled={!isSuperAdmin}
                                        />
                                    </th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">ID</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Name</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Email</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Role</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">First Name</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Last Name</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Phone</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Image</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Last Login</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Created At</th>
                                    <th className="px-4 py-2 font-medium text-start text-theme-xs bg-[var(--gallery)] text-[var(--card-title)] border-b border-[var(--ui-border-color)]">Updated At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((admin) => (
                                    <tr key={admin.id} className="border-b border-[var(--ui-border-color)]">
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5"
                                                checked={selected.includes(admin.id)}
                                                onChange={() => handleSelect(admin.id)}
                                                disabled={!isSuperAdmin}
                                            />
                                        </td>
                                        <td className="px-4 py-2">{admin.id}</td>
                                        <td className="px-4 py-2">{admin.username}</td>
                                        <td className="px-4 py-2">{admin.email}</td>
                                        <td className="px-4 py-2">{admin.role}</td>
                                        <td className="px-4 py-2">{admin.firstName || '-'}</td>
                                        <td className="px-4 py-2">{admin.lastName || '-'}</td>
                                        <td className="px-4 py-2">{admin.phoneNumber || '-'}</td>
                                        <td className="px-4 py-2">{admin.imageUrl ? <Image src={admin.imageUrl} alt="admin" width={40} height={40} className="w-10 h-10 object-cover rounded-full" /> : '-'}</td>
                                        <td className="px-4 py-2">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : '-'}</td>
                                        <td className="px-4 py-2">{admin.createdAt ? new Date(admin.createdAt).toLocaleString() : "-"}</td>
                                        <td className="px-4 py-2">{admin.updatedAt ? new Date(admin.updatedAt).toLocaleString() : "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {isSuperAdmin && (
                <div className="mt-4">
                    <Link href="/dashboard/admin/create" className="bg-[var(--button-primary)] text-[var(--foreground)] px-4 py-2 rounded hover:bg-[var(--button-primary-hover)]">
                        Add Admin
                    </Link>
                </div>
            )}
        </div>
    );
}
