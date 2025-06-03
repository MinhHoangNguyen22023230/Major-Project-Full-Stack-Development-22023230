"use client";

import OverviewSaaS from "@/components/Dashboard/SaaS/OverviewSaaS";
import ComponentCard from "@/components/ui/ComponentCard";
import OrderTable from "@/components/Dashboard/Order/OrderTable";
import { useSidebar } from "@/app/SidebarContext";
import Link from "next/link";

export default function Order() {
    const { isOpen } = useSidebar();

    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title="Order"
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/order" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">order</Link>
                </>
            }
        >
            <OverviewSaaS />
            <OrderTable />
        </ComponentCard>
    );
}