"use client";

import { LogoutButton } from "../Login/LogoutButton";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useMediaQuery } from 'react-responsive';
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";

export default function MobileSideBar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
    const [isDataOpen, setIsDataOpen] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const pathname = usePathname();

    // Auto-close sidebar on mobile when not open
    useEffect(() => {
        if (!isMobile && isOpen) {
            setIsOpen(false);
        }
    }, [isMobile, isOpen, setIsOpen]);

    if (!isMobile) return null;

    return (
        <div
            className={
                'fixed top-0 left-0 h-screen w-full z-50 transition-transform duration-300 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]' +
                (isOpen ? ' translate-x-0' : ' -translate-x-full')
            }
            style={{ maxWidth: '100vw' }}
        >
            <div className="flex flex-row items-center justify-between p-4 border-b border-[var(--ui-border-color)]">
                <div className="flex flex-row items-center gap-2">
                    <Link href="/dashboard"><Image width={40} height={40} src="/logo.svg" alt="Logo" className="rounded" style={{ background: 'var(--sidebar-bg)' }} /></Link>
                    <h2 className="text-xl font-bold tracking-tight text-[var(--sidebar-text)]">B2C Store</h2>
                </div>
                <button
                    className="text-2xl text-[var(--sidebar-text)] hover:text-[var(--button-primary)] p-2 rounded focus:outline-none"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close sidebar"
                >
                    &times;
                </button>
            </div>
            <aside className="h-[calc(100vh-64px)] w-full p-4 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] overflow-y-auto">
                <nav>
                    <ul className="space-y-2">
                        <li>
                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname === '/dashboard' ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard/saas"
                                onClick={() => setIsOpen(false)}
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
                        {isDataOpen && (
                            <>
                                <li className="ml-5">
                                    <Link
                                        href="/dashboard/user"
                                        onClick={() => setIsOpen(false)}
                                        className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/user') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                    >
                                        User
                                    </Link>
                                </li>
                                <li className="ml-5">
                                    <Link
                                        href="/dashboard/order"
                                        onClick={() => setIsOpen(false)}
                                        className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/order') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                    >
                                        Order
                                    </Link>
                                </li>
                                <li className="ml-5">
                                    <Link
                                        href="/dashboard/product"
                                        onClick={() => setIsOpen(false)}
                                        className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/product') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                    >
                                        Product
                                    </Link>
                                </li>
                                <li className="ml-5">
                                    <Link
                                        href="/dashboard/brand"
                                        onClick={() => setIsOpen(false)}
                                        className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/brand') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                    >
                                        Brand
                                    </Link>
                                </li>
                                <li className="ml-5">
                                    <Link
                                        href="/dashboard/category"
                                        onClick={() => setIsOpen(false)}
                                        className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/category') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                    >
                                        Category
                                    </Link>
                                </li>
                                <li className="ml-5">
                                    <Link
                                        href="/dashboard/review"
                                        onClick={() => setIsOpen(false)}
                                        className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/review') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                    >
                                        Review
                                    </Link>
                                </li>
                                <li className="ml-5">
                                    <Link
                                        href="/dashboard/admin"
                                        onClick={() => setIsOpen(false)}
                                        className={`block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] ${pathname.startsWith('/dashboard/admin') ? 'bg-[var(--sidebar-active-bg)] font-semibold border border-[var(--ui-border-color)]' : 'bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]'}`}
                                    >
                                        Admin
                                    </Link>
                                </li>
                            </>
                        )}
                        <li>
                            <div onClick={() => setIsOpen(false)}>
                                <LogoutButton
                                    className="block w-full text-left px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-[var(--sidebar-text)] bg-[var(--sidebar-bg)] hover:bg-[var(--hover-bg-color)]"

                                >
                                    Logout
                                </LogoutButton>
                            </div>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    );
}