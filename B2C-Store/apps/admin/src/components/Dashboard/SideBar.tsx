"use client";

import { logout } from "@/components/Login/logoutAction";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSidebar } from '@/app/dashboard/SidebarContext';
import { useMediaQuery } from 'react-responsive';
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";

export default function SideBar() {
    const { isOpen, setIsOpen } = useSidebar();
    const [isDataOpen, setIsDataOpen] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });

    // Auto-close sidebar on mobile
    useEffect(() => {
        if (isMobile && isOpen) {
            setIsOpen(false);
        }
    }, [isMobile, isOpen, setIsOpen]);

    return (
        <>
            <div className={
                'w-70 block my-border-r ui-main shadow-amber-50 fixed top-0 left-0 h-screen z-40 transition-transform duration-300 ' +
                (isOpen ? 'translate-x-0' : '-translate-x-full')
            }>
                <div className="w-full flex flex-row items-center justify-left gap-2 h-30 shadow-amber-100">
                    <Image width={100} height={100} src="/logo.svg" alt="Logo" />
                    <h2 className="text-2xl font-bold tracking-tight block">B2C Store</h2>
                </div>
                <aside className="scrollable-sidebar h-screen w-full p-4">
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/dashboard/saas"
                                    className="block w-full text-left px-3 py-2 rounded cursor-pointer hover:text-blue-500 hover:bg-blue-100 transition-colors duration-150"
                                >
                                    SaaS
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => setIsDataOpen(!isDataOpen)}
                                    className={`${isDataOpen ? 'bg-blue-100 text-blue-500' : ''} flex justify-between w-full text-left px-3 py-2 rounded cursor-pointer hover:bg-blue-100 hover:text-blue-500 transition-colors duration-150`}
                                >
                                    <p className="font-semibold">Data</p>
                                    <IoIosArrowDown className={`h-5 w-5 ${isDataOpen ? 'rotate-180' : ''} transition-transform duration-300`} />
                                </button>
                            </li>
                            <li className={`${isDataOpen ? 'block' : 'hidden'}`}>
                                <Link
                                    href="/dashboard/user"
                                    className="block w-full text-left px-3 py-2 rounded cursor-pointer hover:bg-blue-100 hover:text-blue-500 transition-colors duration-150"
                                >
                                    User
                                </Link>
                            </li>
                            <li className={`${isDataOpen ? 'block' : 'hidden'}`}>
                                <Link
                                    href="/dashboard/order"
                                    className="block w-full text-left px-3 py-2 rounded cursor-pointer hover:bg-blue-100 transition-colors duration-150"
                                >
                                    Order
                                </Link>
                            </li>

                            <li><h1>Menu</h1></li>
                            <li>
                                <button
                                    onClick={async () => { await logout(); }}
                                    className="block w-full text-left px-3 py-2 rounded cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors duration-150"
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </nav>
                </aside>
            </div>
            <div className={'w-70 ' + (isOpen ? 'block' : 'hidden')}></div>
        </>
    );
}