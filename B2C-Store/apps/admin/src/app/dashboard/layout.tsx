"use client";

import SideBar from '@/components/Dashboard/SideBar';
import NavBar from '@/components/Dashboard/NavBar';
import { SidebarProvider } from './SidebarContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex w-full flex-row h-screen">
                <SideBar />
                <div className="flex-1 flex flex-col w-full">
                    <NavBar />

                    <main className="m-auto w-[90%] h-fit pt-10 pb-10 mt-20 flex flex-col justify-center">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}