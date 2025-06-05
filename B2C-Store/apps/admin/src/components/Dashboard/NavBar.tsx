'use client';

import { CgPushChevronLeftR } from "react-icons/cg";
import React from "react";
import { useSidebar } from '@/app/SidebarContext';
import { useMediaQuery } from 'react-responsive';
import Image from "next/image";
import ThemeSwitch from "@/components/ThemeSwitch";
import { trpc } from "@/app/_trpc/client";
import { useAdminSession } from '@/app/clientLayout';
import { LogoutButton } from "../Login/LogoutButton";
import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import MobileSideBar from "./MobileSideBar";


export default function NavBar() {
    const { isOpen, setIsOpen } = useSidebar();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
    const profileMenuRef = React.useRef<HTMLDivElement>(null);
    const { userId } = useAdminSession();
    // Only fetch admin if userId is available and is a string
    const enabled = typeof userId === 'string' && !!userId;
    const { data: adminData, isLoading, error } = trpc.crud.findAdminById.useQuery(
        enabled ? { id: userId } : { id: '' },
        { enabled }
    );

    // Always call useEffect for outside click detection
    React.useEffect(() => {
        if (!profileMenuOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileMenuOpen]);

    if (isLoading) {
        return (
            <div className="h-10 w-full flex justify-center items-center bg-[var(--supernova)] font-semibold">
                Loading...
            </div>
        );
    }
    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <>
            <MobileSideBar isOpen={mobileSidebarOpen} setIsOpen={setMobileSidebarOpen} />
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
                            className={`hidden sm:block transition-transform duration-500 ${!isOpen ? 'rotate-180' : ''} text-[var(--navbar-text)] bg-[var(--navbar-bg)] rounded`}
                            onClick={() => setIsOpen((prev) => !prev)}
                        >
                            <CgPushChevronLeftR className="h-10 w-10 cursor-pointer transition-colors duration-300 inline-block mr-1" title="close sidebar" />
                        </button>
                    )}
                    <h1 className="text-[var(--navbar-text)]">Admin Dashboard</h1>
                </div>
                <div className="flex space-x-4 relative items-center">
                    {/* Use ThemeSwitch for theme toggling */}
                    <div className="w-fit cursor-pointer items-center flex hover:opacity-80 opacity-100 transition-opacity duration-100 h-fit">
                        <ThemeSwitch />
                    </div>
                    {/* Profile Image and Menu */}
                    <Image
                        src={adminData?.imageUrl || "/logo.svg"}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full group mr-2 cursor-pointer hover:opacity-80 transition-opacity duration-300 border border-[var(--ui-border-color)] bg-[var(--navbar-bg)]"
                        onClick={() => setProfileMenuOpen((v) => !v)}
                    />
                    {/* Burger menu button for mobile */}
                    <button onClick={() => setMobileSidebarOpen(true)} className="block sm:hidden">
                        <GiHamburgerMenu className="h-6 w-6" />
                    </button>
                    {profileMenuOpen && (
                        <div ref={profileMenuRef} className="absolute right-2 top-12 w-40 rounded shadow-lg z-50 bg-[var(--popover-bg)] text-[var(--popover-text)] border border-[var(--popover-border)]">
                            <Link
                                href={`/profile/${adminData?.id}`}
                                className="block w-full text-left px-4 py-2 text-sm hover:font-semibold text-[var(--popover-text)] bg-[var(--popover-bg)] hover:bg-[var(--hover-bg-color)]"
                            >
                                Profile
                            </Link>
                            <LogoutButton
                                className="block w-full text-left px-4 py-2 text-sm cursor-pointer hover:font-semibold text-[var(--popover-text)] bg-[var(--popover-bg)] hover:bg-[var(--hover-bg-color)]"
                            >
                                Logout
                            </LogoutButton>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}