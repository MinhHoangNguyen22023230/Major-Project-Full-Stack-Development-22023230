'use client';

import { CgPushChevronLeftR } from "react-icons/cg";
import React from "react";
import { useSidebar } from '@/app/SidebarContext';
import { useMediaQuery } from 'react-responsive';
import Image from "next/image";
import ThemeSwitch from "@/components/ThemeSwitch";


export default function NavBar() {
    const { isOpen, setIsOpen } = useSidebar();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
    const profileMenuRef = React.useRef<HTMLDivElement>(null);

    return (
        <>
            <div
                className={`
                    flex items-center fixed justify-between h-20 top-0 left-0 z-30
                    p-4 transition-all duration-300 border-b-2
                    ${isOpen && !isMobile ? 'ml-70 w-[calc(100vw-280px)]' : 'ml-0 w-full'}
                    border-[var(--ui-border-color)]
                    bg-[var(--navbar-bg)] text-[var(--navbar-text)]
                `}
            >
                <div className="flex flex-row items-center gap-2 text-lg font-bold text-[var(--navbar-text)]">
                    {!isMobile && (
                        <button
                            className={`hidden sm:block transition-transform duration-500 ${!isOpen ? 'rotate-180' : ''} text-[var(--navbar-text)] bg-[var(--navbar-bg)] border border-[var(--ui-border-color)] rounded`}
                            onClick={() => setIsOpen((prev) => !prev)}
                        >
                            <CgPushChevronLeftR className="h-10 w-10 cursor-pointer transition-colors duration-300 inline-block mr-1" title="close sidebar" />
                        </button>
                    )}
                    <h1 className="text-[var(--navbar-text)]">Admin Dashboard</h1>
                    <input type="text" className="search-box rounded-md p-2 ml-2 text-[var(--navbar-text)] bg-[var(--gallery)] border border-[var(--ui-border-color)]" placeholder="Search..." />
                </div>
                <div className="hidden sm:flex space-x-4 relative items-center">
                    {/* Use ThemeSwitch for theme toggling */}
                    <ThemeSwitch />
                    <Image
                        src={"/logo.svg"}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full group cursor-pointer hover:opacity-80 transition-opacity duration-300 border border-[var(--ui-border-color)] bg-[var(--navbar-bg)]"
                        onClick={() => setProfileMenuOpen((v) => !v)}
                    />
                    {profileMenuOpen && (
                        <div ref={profileMenuRef} className="absolute right-0 mt-2 w-40 rounded shadow-lg z-50 bg-[var(--popover-bg)] text-[var(--popover-text)] border border-[var(--popover-border)]">
                            <button
                                className="block w-full text-left px-4 py-2 text-sm hover:font-semibold text-[var(--popover-text)] bg-[var(--popover-bg)] hover:bg-[var(--hover-bg-color)]"
                                onClick={() => { setProfileMenuOpen(false); alert('Settings clicked!'); }}
                            >
                                Settings
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 text-sm hover:font-semibold text-[var(--popover-text)] bg-[var(--popover-bg)] hover:bg-[var(--hover-bg-color)]"
                                onClick={() => { setProfileMenuOpen(false); alert('Logout clicked!'); }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}