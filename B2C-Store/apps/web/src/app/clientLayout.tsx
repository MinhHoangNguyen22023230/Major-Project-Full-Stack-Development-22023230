"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar/NavBar";
import Footer from "@/components/Footer/Footer";
import { trpc } from "@/app/_trpc/client";
import { ReactNode, createContext, useContext, useEffect } from "react";
import "./styles/globals.css";
import { Loader2 } from "lucide-react";

// Session context
// Accepts { userId: string | null }
const SessionContext = createContext<{ userId: string | null }>({ userId: null });
export function useSession() {
    return useContext(SessionContext);
}

export default function ClientLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const hideNavAndFooter = ["/login", "/signup"].includes(pathname);
    // Fetch session only once here
    const { data: sessionRaw, isLoading, error, refetch } = trpc.session.getSession.useQuery(undefined, { staleTime: 60 * 1000 });
    // Refetch session on route change (login/logout)
    useEffect(() => {
        refetch();
    }, [pathname, refetch]);
    // Defensive normalization for all possible shapes
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
    if (sessionRaw && typeof sessionRaw.userId === "string") {
        session = { userId: sessionRaw.userId };
    }
    return (
        <SessionContext.Provider value={session}>
            {!hideNavAndFooter && <Navbar />}
            {!hideNavAndFooter && <div className="h-34 w-full m-0 p-0"></div>}
            <main className="flex flex-col min-h-screen">
                <div className="flex-1 flex flex-col">
                    {children}
                </div>
                {!hideNavAndFooter && <Footer />}
            </main>
        </SessionContext.Provider>
    );
}