'use client';

import BrandTable from "@/components/Dashboard/Brand/BrandTable";
import OverviewBrand from "@/components/Dashboard/Brand/OverviewBrand";
import { useSidebar } from "@/app/SidebarContext";
import ComponentCard from "@/components/ui/ComponentCard";
import Link from "next/link";

export default function Brand() {
    const { isOpen } = useSidebar();
    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title="Brand Management"
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/brand" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">brand</Link>
                </>
            }
        >
            <OverviewBrand />
            <BrandTable />
        </ComponentCard>
    );
}