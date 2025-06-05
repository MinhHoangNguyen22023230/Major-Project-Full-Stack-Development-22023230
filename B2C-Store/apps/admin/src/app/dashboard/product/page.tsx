'use client';

import ProductTable from "@/components/Dashboard/Product/ProductTable";
import OverviewProduct from "@/components/Dashboard/Product/OverviewProduct";
import { useSidebar } from "@/app/SidebarContext";
import ComponentCard from "@/components/ui/ComponentCard";
import Link from "next/link";

export default function Product() {
    const { isOpen } = useSidebar();
    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title="Product Management"
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/product" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">product</Link>
                </>
            }
        >
            <OverviewProduct />
            <ProductTable />
        </ComponentCard>
    );
}