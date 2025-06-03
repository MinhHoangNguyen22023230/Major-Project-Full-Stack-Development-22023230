'use client';

import OverviewUser from "@/components/Dashboard/User/OverviewUser";
import UserTable from "@/components/Dashboard/User/UserTable";
import { useSidebar } from "@/app/SidebarContext";
import ComponentCard from "@/components/ui/ComponentCard";
import Link from "next/link";

export default function User() {
    const { isOpen } = useSidebar();
    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title="User Management"
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/user" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">user</Link>
                </>
            }
        >
            <OverviewUser />
            <UserTable />
        </ComponentCard>
    );
}