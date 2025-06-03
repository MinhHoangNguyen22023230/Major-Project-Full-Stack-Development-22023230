import { CgPushChevronLeftR } from "react-icons/cg";
import React from "react";
import { useSidebar } from '@/app/dashboard/SidebarContext';
import { useMediaQuery } from 'react-responsive';


export default function NavBar() {
    const { isOpen, setIsOpen } = useSidebar();
    const isMobile = useMediaQuery({ maxWidth: 767 });

    const handleToggleSidebar = () => {
        setIsOpen((prev) => !prev);
    };

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
                            className={`hidden sm:block hover:text-gray-300 transition-transform duration-500 ${!isOpen ? 'rotate-180' : ''}`}
                            onClick={handleToggleSidebar}
                        >
                            <CgPushChevronLeftR className="h-10 w-10 cursor-pointer inline-block mr-1" title="close sidebar" />
                        </button>
                    )}
                    <h1>Admin Dashboard</h1>
                    <input type="text" className="search-box rounded-md p-2 ml-2" placeholder="Search..." />
                </div>
                <nav className="space-x-4">
                    <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
                    <a href="/products" className="hover:text-gray-300">Products</a>
                    <a href="/orders" className="hover:text-gray-300">Orders</a>
                    <a href="/users" className="hover:text-gray-300">Users</a>
                </nav>
            </div>
        </>
    );
}