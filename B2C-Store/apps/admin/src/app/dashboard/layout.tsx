"use client";

import SideBar from '@/components/Dashboard/SideBar';
import dynamic from 'next/dynamic';
import { useSidebar } from '@/app/SidebarContext';
const NavBar = dynamic(() => import('@/components/Dashboard/NavBar'), { ssr: false });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

    const { isOpen } = useSidebar();

    return (
            <div className="flex w-full flex-row h-screen">
                <SideBar />
                <div className="flex-1 flex flex-col w-full">
                    <NavBar />
                    
                    <main className={`pt-10 pb-10 mt-20 flex flex-col transition-all duration-300 items-center ${isOpen ? "ml-70" : "ml-0"}`}>
                        {children}
                    </main>
                </div>
            </div>
    );
}