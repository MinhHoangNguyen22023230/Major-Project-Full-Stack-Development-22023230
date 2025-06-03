"use client";

import Provider from "@/app/_trpc/Provider";
import { SidebarProvider } from "./SidebarContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    // Hide sidebar on /login route (and optionally on / if you want)

    return (
        <SidebarProvider>
            <Provider>
                <div className="flex min-h-screen">
                    <main className="flex-1">{children}</main>
                </div>
            </Provider>
        </SidebarProvider>
    );
}