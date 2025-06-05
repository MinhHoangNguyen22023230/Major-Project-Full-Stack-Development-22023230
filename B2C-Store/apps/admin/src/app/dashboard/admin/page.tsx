'use client';

import AdminTable from "@/components/Dashboard/Admin/AdminTable";
import { useSidebar } from "@/app/SidebarContext";
import ComponentCard from "@/components/ui/ComponentCard";
import Link from "next/link";

export default function Admin() {
    const { isOpen } = useSidebar();
    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title="Admin Management"
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/admin" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">admin</Link>
                </>
            }
        >
            <AdminTable />
        </ComponentCard>
    );
}