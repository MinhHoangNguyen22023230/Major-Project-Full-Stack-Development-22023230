'use client';

import { CgPushChevronLeftR } from "react-icons/cg";
import React from "react";
import { useSidebar } from '@/app/SidebarContext';
import { useMediaQuery } from 'react-responsive';
import Image from "next/image";


export default function NavBar() {
    const { isOpen, setIsOpen } = useSidebar();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
    const profileMenuRef = React.useRef<HTMLDivElement>(null);

    const handleToggleSidebar = () => {
        setIsOpen((prev) => !prev);
    };

    // Close menu on outside click
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        }
        if (profileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [profileMenuOpen]);

    return (
        <>
            <div
                className={`
                flex items-center my-border-b ui-main fixed justify-between h-20 top-0 left-0 z-30
                p-4 transition-all duration-300
                ${isOpen && !isMobile ? 'ml-70 w-[calc(100vw-280px)]' : 'ml-0 w-full'}
            `}
            >
                <div className="flex flex-row items-center gap-2 text-lg font-bold">
                    {!isMobile && (
                        <button
                            className={`hidden sm:block transition-transform duration-500 ${!isOpen ? 'rotate-180' : ''}`}
                            onClick={handleToggleSidebar}
                        >
                            <CgPushChevronLeftR className="h-10 w-10 hover-text cursor-pointer transition-colors duration-300 inline-block mr-1" title="close sidebar" />
                        </button>
                    )}
                    <h1>Admin Dashboard</h1>
                    <input type="text" className="search-box rounded-md p-2 ml-2" placeholder="Search..." />
                </div>
                <nav className="hidden sm:block space-x-4 relative">
                    <Image
                        src={"/logo.svg"} // fallback image or use a static placeholder
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full group cursor-pointer hover:opacity-80 transition-opacity duration-300"
                        onClick={() => setProfileMenuOpen((v) => !v)}
                    />
                    {profileMenuOpen && (
                        <div ref={profileMenuRef} className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                            <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => { setProfileMenuOpen(false); alert('Settings clicked!'); }}
                            >
                                Settings
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => { setProfileMenuOpen(false); alert('Logout clicked!'); }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
}