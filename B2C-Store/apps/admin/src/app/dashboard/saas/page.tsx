"use client";

import OverviewSaaS from "@/components/Dashboard/SaaS/OverviewSaaS";
import ComponentCard from "@/components/ui/ComponentCard";
import { useSidebar } from "@/app/SidebarContext";
import Link from "next/link";
import RevenueGrowthChart from "@/components/Dashboard/SaaS/RevenueGrowthChart";
import RecentSignUp from "@/components/Dashboard/SaaS/RecentSignUp";

export default function SaaS() {
    const { isOpen } = useSidebar();

    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title="SaaS"
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href={`/dashboard/saas`} className="cursor-pointer hover:text-blue-500 transition-colors duration-100">saas</Link>
                </>
            }
        >
            <OverviewSaaS />
            <RevenueGrowthChart />
            <RecentSignUp />
        </ComponentCard>
    );
}