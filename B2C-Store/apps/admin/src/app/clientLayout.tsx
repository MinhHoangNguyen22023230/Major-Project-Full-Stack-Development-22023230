"use client";


import Provider from "@/app/_trpc/Provider";
import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import React, { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "./SidebarContext";


const AdminSessionContext = createContext<{ userId: string | null }>({ userId: null });
export function useAdminSession() {
    return useContext(AdminSessionContext);
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Optionally hide sidebar on /login route
    // const hideSidebar = ["/login"].includes(pathname);

    // Fetch admin session
    const { data: sessionRaw, isLoading, error, refetch } = trpc.adminSession.getAdminSession.useQuery(undefined, { staleTime: 60 * 1000 });
    useEffect(() => { refetch(); }, [pathname, refetch]);

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="animate-spin w-10 h-10 text-yellow-500" />
            </div>
        );
    }
    if (error) {
        return <div className="w-full h-20 flex items-center justify-center text-red-600">Session error: {error.message}</div>;
    }
    let session: { userId: string | null } = { userId: null };
    if (sessionRaw && typeof sessionRaw.userId === "string" && sessionRaw.userId) {
        session = { userId: sessionRaw.userId };
    }
    return (
        <AdminSessionContext.Provider value={session}>
            <SidebarProvider>
                <Provider>
                    <div className="flex min-h-screen">
                        <main className="flex-1">{children}</main>
                    </div>
                </Provider>
            </SidebarProvider>
        </AdminSessionContext.Provider>
    );
}