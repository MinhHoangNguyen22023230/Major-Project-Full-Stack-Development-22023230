"use client";

import { usePathname } from "next/navigation";
import SideBar from "@/components/SideBar";
import Provider from "@/app/_trpc/Provider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide sidebar on /login route (and optionally on / if you want)
    const hideSidebar = pathname === "/";

    return (
        <Provider>
            <div className="flex min-h-screen">
                {!hideSidebar && <SideBar />}
                <main className="flex-1">{children}</main>
            </div>
        </Provider>
    );
}