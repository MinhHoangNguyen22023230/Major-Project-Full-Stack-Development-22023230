'use client';

import { useSidebar } from "@/app/SidebarContext";
import ComponentCard from "@/components/ui/ComponentCard";
import OverviewReview from "@/components/Dashboard/Review/OverviewReview";
import ReviewTable from "@/components/Dashboard/Review/ReviewTable";
import Link from "next/link";

export default function Review() {
    const { isOpen } = useSidebar();
    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title="Review Management"
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/review" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">review</Link>
                </>
            }
        >
            <OverviewReview />
            <ReviewTable/>
        </ComponentCard>
    );
}