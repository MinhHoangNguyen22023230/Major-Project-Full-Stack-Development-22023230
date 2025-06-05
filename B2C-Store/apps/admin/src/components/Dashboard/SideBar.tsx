"use client";

import { LogoutButton } from "../Login/LogoutButton";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSidebar } from '@/app/SidebarContext';
import { useMediaQuery } from 'react-responsive';
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";

export default function SideBar() {
    const { isOpen, setIsOpen } = useSidebar();
    const [isDataOpen, setIsDataOpen] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const pathname = usePathname();


    // Auto-close sidebar on mobile
    useEffect(() => {
        if (isMobile && isOpen) {
            setIsOpen(false);
        }
    }, [isMobile, isOpen, setIsOpen]);

    return (
        <>
            <div className={
                'w-70 block fixed top-0 left-0 h-screen z-40 transition-transform duration-300 border-r-2 ' +
                (isOpen ? 'translate-x-0' : '-translate-x-full') +
                ' border-[var(--ui-border-color)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]'
            }>
                <div className="w-full flex flex-row items-center justify-left gap-2 h-30 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]">
                    <Link href="/dashboard"><Image width={100} height={100} src="/logo.svg" alt="Logo" className="rounded" style={{ background: 'var(--sidebar-bg)' }} /></Link>
                    <h2 className="text-2xl font-bold tracking-tight block text-[var(--sidebar-text)]">B2C Store</h2>
                </div>
                <aside className="scrollable-sidebar h-[calc(100vh-100px)] w-full p-4 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]">
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/dashboard"
                                    className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname === '/dashboard' ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/saas"
                                    className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/saas') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    SaaS
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => setIsDataOpen(!isDataOpen)}
                                    className={`flex justify-between w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${isDataOpen ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    <p className="font-semibold">Data</p>
                                    <IoIosArrowDown className={`h-5 w-5 ${isDataOpen ? 'rotate-180' : ''} transition-transform duration-300 text-[var(--sidebar-text)]`} />
                                </button>
                            </li>
                            <li className={`ml-5 ${isDataOpen ? 'block' : 'hidden'}`}> {/* User */}
                                <Link
                                    href="/dashboard/user"
                                    className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/user') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    User
                                </Link>
                            </li>
                            <li className={`ml-5 ${isDataOpen ? 'block' : 'hidden'}`}> {/* Order */}
                                <Link
                                    href="/dashboard/order"
                                    className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/order') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    Order
                                </Link>
                            </li>
                            <li className={`ml-5 ${isDataOpen ? 'block' : 'hidden'}`}> {/* Order */}
                                <Link
                                    href="/dashboard/product"
                                    className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/product') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    Product
                                </Link>
                            </li>
                            <li className={`ml-5 ${isDataOpen ? 'block' : 'hidden'}`}> {/* Order */}
                                <Link
                                    href="/dashboard/brand"
                                    className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/brand') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    Brand
                                </Link>
                            </li>
                                                        <li className={`ml-5 ${isDataOpen ? 'block' : 'hidden'}`}> {/* Order */}
                                <Link
                                    href="/dashboard/category"
                                    className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/category') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    Category
                                </Link>
                            </li>
                            <li className={`ml-5 ${isDataOpen ? 'block' : 'hidden'}`}> {/* Order */}
                                <Link
                                    href="/dashboard/review"
                                    className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/review') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    Review
                                </Link>
                            </li>
                            <li className={`ml-5 ${isDataOpen ? 'block' : 'hidden'}`}> {/* Order */}
                                <Link
                                    href="/dashboard/admin"
                                    className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/admin') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                >
                                    Admin
                                </Link>
                            </li>

                            <li>
                                <LogoutButton
                                    className="block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]"
                                >
                                    Logout
                                </LogoutButton>
                            </li>
                        </ul>
                    </nav>
                </aside>
            </div>
        </>
    );
}