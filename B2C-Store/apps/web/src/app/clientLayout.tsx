"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar/NavBar";
import Footer from "@/components/Footer/Footer";
import { ReactNode } from "react";
import "./styles/globals.css";

export default function ClientLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const hideNavAndFooter = ["/login", "/signup"].includes(pathname);
    return (
        <>
            {!hideNavAndFooter && <Navbar />}
            {!hideNavAndFooter && <div className="h-34 w-full m-0 p-0"></div>}
            {children}
            {!hideNavAndFooter && <Footer />}
        </>
    );
}