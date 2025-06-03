"use client";

import Provider from "@/app/_trpc/Provider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    // Hide sidebar on /login route (and optionally on / if you want)

    return (
        <Provider>
            <div className="flex min-h-screen">
                <main className="flex-1">{children}</main>
            </div>
        </Provider>
    );
}