'use client';

import CategoryTable from "@/components/Dashboard/Category/CategoryTable";
import { useSidebar } from "@/app/SidebarContext";
import ComponentCard from "@/components/ui/ComponentCard";
import Link from "next/link";

export default function Brand() {
    const { isOpen } = useSidebar();
    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title="Category Management"
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/category" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">category</Link>
                </>
            }
        >
            <CategoryTable />
        </ComponentCard>
    );
}