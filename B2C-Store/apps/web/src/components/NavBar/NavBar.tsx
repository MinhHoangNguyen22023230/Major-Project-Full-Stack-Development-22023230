"use client";

import { useShowCategoriesNavbar, useTopNavBar } from "@/hooks/useNavbar";
import Link from "next/link";
import Image from "next/image";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { LogoutButton } from "@/components/Login/LogoutButton";
import { trpc } from "@/app/_trpc/client";
import React, { useState } from "react";
import SearchBar from "@/components/SearchBar/SearchBar";
import { useSession } from "@/app/clientLayout";

export default function Navbar() {
    const { menuOpen, toggleMenu, closeMenu } = useTopNavBar();
    const { showCategories } = useShowCategoriesNavbar();

    // Use session from context
    const session = useSession();
    console.log("Session in Navbar:", session);
    const userId = session?.userId;

    // Only fetch user if userId is available
    const { data: users, isLoading, error } = trpc.crud.getUsers.useQuery(undefined, { enabled: !!userId });
    const user = users?.find(u => u.id === userId);

    const { data: carts } = trpc.crud.getCarts.useQuery(undefined, { enabled: !!userId });
    const userCart = carts?.find((c) => c.userId === userId);

    // Use itemsCount directly from cart
    const cartItemCount = userCart?.itemsCount || 0;

    // Fetch categories and brands using tRPC
    const { data: brands, isLoading: brandsLoading, error: brandsError } = trpc.crud.getBrands.useQuery();
    const { data: categories, isLoading: categoriesLoading, error: categoriesError } = trpc.crud.getCategories.useQuery();

    // Local state to ensure consistent rendering
    const [isClient, setIsClient] = useState(false);
    // State for dropdowns
    const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    React.useEffect(() => setIsClient(true), []);

    // Handle loading and error states
    if (!isClient || brandsLoading || categoriesLoading || isLoading) {
        return (
            <div className="h-10 w-full flex justify-center items-center bg-[var(--supernova)] font-semibold">
                Loading...
            </div>
        );
    }
    if (brandsError || categoriesError || error) {
        return <p>Error: {brandsError?.message || categoriesError?.message || error?.message}</p>;
    }

    return (
        <header className={`${showCategories ? "sm:h-34" : ""} bg-[var(--gallery)] shadow-xl fixed w-full h-24 z-50`}>
            <nav className="w-full h-24">
                <div className="bg-[var(--gallery)] flex justify-between items-center h-full w-full px-2 2xl:px-16">
                    <ul className="flex items-center">
                        <div className="item-center flex-row justify-center gap-3 sm:flex">
                            <li className="text-xl flex items-center h-20 w-30"><Link href="/">
                                <Image
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={200}
                                    height={200}
                                    className="cursor-pointer"
                                />
                            </Link></li>
                            <li className="hidden sm:flex l-10 text-xl items-center"><SearchBar /></li>
                        </div>
                    </ul>
                    {/* Desktop Navigation Links */}
                    <div className="hidden sm:flex">
                        <ul className="hidden sm:flex items-center">
                            {user ? (
                                <>
                                    {/* Desktop Cart Link: Only show if user has a cart */}
                                    {userCart?.id && (
                                        <li className="ml-10 text-xl uppercase hover:border-b flex items-center">
                                            {/* Cart item count badge */}
                                            <span className="mr-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold w-6 h-6">
                                                {cartItemCount}
                                            </span>
                                            <Link href={`/cart/${userCart.id}`}>Cart</Link>
                                        </li>
                                    )}
                                    <li className="ml-10 text-xl uppercase hover:border-b">
                                        <Link href={`/profile/${user.id}`}>{user.username}</Link>
                                    </li>
                                    <LogoutButton

                                        className="shadow-xl p-3 mx-10 text-xl cursor-pointer uppercase transition-colors bg-[var(--supernova)] hover:bg-[var(--yukon-gold)] text-[var(--rangoon-green)] rounded"
                                    >
                                        Logout
                                    </LogoutButton>
                                </>
                            ) : (
                                <>
                                    <li className="ml-10 text-xl uppercase hover:border-b">
                                        <Link href="/signup">Sign Up</Link>
                                    </li>
                                    <li className="mx-10 text-xl uppercase hover:border-b">
                                        <Link href="/login">Login</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                    {/* Hamburger Icon */}
                    
                    <div onClick={toggleMenu} className="sm:hidden relative cursor-pointer">
                        <AiOutlineMenu size={25} />
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={
                            menuOpen
                                ? "fixed left-0 top-0 w-full h-screen sm:hidden bg-[#ecf0f3] p-10 ease-in duration-500"
                                : "fixed left-[-100%] top-0 p-10 ease-in duration-500"
                        }
                    >
                        <div className="flex w-full items-center justify-end">
                            <div onClick={toggleMenu} className="cursor-pointer">
                                <AiOutlineClose size={25} />
                            </div>
                        </div>

                        <div className="flex-col py-4">
                            <ul>
                                <li className="py-4 cursor-pointer">
                                    <SearchBar closeMenu={closeMenu} />
                                </li>
                                <li onClick={closeMenu} className="py-4 cursor-pointer hover:border-b">
                                    <Link className="block w-full h-full" href="/">Home</Link>
                                </li>
                                <li onClick={closeMenu} className="py-4 cursor-pointer hover:border-b">
                                    <Link className="block w-full h-full" href="/about">Why Us</Link>
                                </li>
                                <li onClick={closeMenu} className="py-4 cursor-pointer hover:border-b">
                                    <Link className="block w-full h-full" href="/contact">Contact Us</Link>
                                </li>
                                <li onClick={closeMenu} className="py-4 cursor-pointer hover:border-b">
                                    <Link className="block w-full h-full" href="/profile">Profile</Link>
                                </li>
                                {user ? (
                                    <>
                                        {/* Mobile Cart Link: Only show if user has a cart */}
                                        {userCart?.id && (
                                            <li onClick={closeMenu} className="py-4 cursor-pointer hover:border-b flex items-center">
                                                <span className="mr-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold w-6 h-6">
                                                    {cartItemCount}
                                                </span>
                                                <Link className="block w-full h-full" href={`/cart/${userCart.id}`}>Cart</Link>
                                            </li>
                                        )}
                                        <li onClick={closeMenu} className="py-4 cursor-pointer hover:border-b">
                                            <Link href={`/profile/${user.id}`} className="block w-full h-full">
                                                {user.username}
                                            </Link>
                                        </li>
                                        <LogoutButton
                                            className="px-4 py-2 font-semibold transition-colors bg-[var(--supernova)] text-[var(--rangoon-green)] active:bg-[var(--rangoon-green)] rounded"
                                        >
                                            Logout
                                        </LogoutButton>
                                    </>
                                ) : (
                                    <>
                                        <li className="py-4 cursor-pointer hover:border-b">
                                            <Link
                                                href="/signup"
                                                className="block w-full h-full"
                                                onClick={closeMenu}
                                            >
                                                Sign Up
                                            </Link>
                                        </li>
                                        <li className="py-4 cursor-pointer hover:border-b">
                                            <Link
                                                href="/login"
                                                className="block w-full h-full"
                                                onClick={closeMenu}
                                            >
                                                Login
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {/*Categories Navbar*/}
            <div>
                {showCategories && (
                    <div className={`${menuOpen ? "hidden" : "flex"} w-full h-10 bg-[var(--gallery)]`}>
                        <ul className="flex w-full">
                            {/* Brands Dropdown */}
                            <li className={`${brandDropdownOpen ? "bg-[var(--rangoon-green)] text-[var(--gallery)]" : "text-[var(--rangoon-green)] bg-[var(--supernova)]"} relative flex-1 flex justify-center items-center hover:bg-[var(--rangoon-green)] font-semibold hover:text-[var(--gallery)] transition-color`}>
                                <button
                                    type="button"
                                    className="w-full h-full flex justify-center items-center bg-transparent border-none outline-none font-semibold"
                                    onClick={() => setBrandDropdownOpen((open) => !open)}
                                    onBlur={() => setTimeout(() => setBrandDropdownOpen(false), 150)}
                                    tabIndex={0}
                                >
                                    Brand
                                </button>
                                {brandDropdownOpen && (
                                    <ul className="absolute bg-[var(--gallery)] w-full left-0 top-10 z-10 shadow-lg">
                                        {brands?.map((brand) => (
                                            <Link key={brand.id} href={`/brands/${brand.id}`}>
                                                <li className="hover:bg-[var(--rangoon-green)] text-[var(--rangoon-green)] px-4 py-2 cursor-pointer font-semibold hover:text-[var(--gallery)] transition-color">
                                                    {brand.name}
                                                </li>
                                            </Link>
                                        ))}
                                    </ul>
                                )}
                            </li>

                            {/* Categories Dropdown */}
                            <li className={`${categoryDropdownOpen ? "bg-[var(--rangoon-green)] text-[var(--gallery)]" : "text-[var(--rangoon-green)] bg-[var(--supernova)]"} relative flex-1 flex justify-center items-center hover:bg-[var(--rangoon-green)] font-semibold hover:text-[var(--gallery)] transition-color`}>
                                <button
                                    type="button"
                                    className="w-full h-full flex justify-center items-center bg-transparent border-none outline-none font-semibold "
                                    onClick={() => setCategoryDropdownOpen((open) => !open)}
                                    onBlur={() => setTimeout(() => setCategoryDropdownOpen(false), 150)}
                                    tabIndex={0}
                                >
                                    Product
                                </button>
                                {categoryDropdownOpen && (
                                    <ul className="absolute bg-[var(--gallery)] w-full left-0 top-10 z-10 shadow-lg ">
                                        {categories?.map((category) => (
                                            <Link key={category.id} href={`/categories/${category.id}`}>
                                                <li className="hover:bg-[var(--rangoon-green)] text-[var(--rangoon-green)] px-4 py-2 cursor-pointer font-semibold hover:text-[var(--gallery)] transition-color">
                                                    {category.name}
                                                </li>
                                            </Link>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        </ul>
                    </div>
                )}
            </div>

        </header >
    );
}