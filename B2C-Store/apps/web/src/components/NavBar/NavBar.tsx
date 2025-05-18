"use client";


import { useShowCategoriesNavbar } from "@/hooks/useCategoriesNavbar";
import { useTopNavBar } from "@/hooks/userTopNavBar";
import Link from "next/link";
import Image from "next/image"
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

export default function Navbar() {
    const { menuOpen, toggleMenu, closeMenu } = useTopNavBar();
    const { showCategories } = useShowCategoriesNavbar();

    // Local state to ensure consistent rendering
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true); // Ensure this component only renders on the client
    }, []);

    // Fetch categories and brands using tRPC
    const { data: brands, isLoading: brandsLoading, error: brandsError } = trpc.getBrands.useQuery();
    const { data: categories, isLoading: categoriesLoading, error: categoriesError } = trpc.getCategories.useQuery();

    // Handle loading and error states
    if (!isClient || brandsLoading || categoriesLoading) {
        return (
            <div className="h-10 w-full flex justify-center items-center bg-[var(--supernova)] font-semibold">
                Loading...
            </div>
        );
    }
    if (brandsError || categoriesError) {
        return <p>Error: {brandsError?.message || categoriesError?.message}</p>;
    }


    return (
        <header className={`${showCategories ? "sm:h-34" : ""} shadow-xl fixed w-full h-24`}>
            <nav className="w-full h-24">
                <div className="bg-[var(--gallery)] flex justify-between items-center h-full w-full px-2 2xl:px-16">
                    <Link href="/">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={200}
                            height={50}
                            className="cursor-pointer"
                        />
                    </Link>
                    <div className="hidden sm:flex">
                        <ul className="hidden sm:flex">
                            <li className="ml-20 text-xl uppercase hover:border-b">
                                <Link href="/about">About</Link>
                            </li>
                            <li className="ml-10 text-xl uppercase hover:border-b">
                                <Link href="/contact">Contact</Link>
                            </li>
                            <li className="ml-10 text-xl uppercase hover:border-b">
                                <Link href="/profile">Profile</Link>
                            </li>
                            <li className="ml-10 text-xl uppercase hover:border-b">
                                <Link href="/cart">Cart</Link>
                            </li>
                            <li className="mx-10 text-xl uppercase hover:border-b">
                                <Link href="/login">Login</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Hamburger Icon */}
                    <div onClick={toggleMenu} className="sm:hidden cursor-pointer pl-24">
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
                                <li onClick={closeMenu} className="py-4 cursor-pointer">
                                    <Link href="/">Home</Link>
                                </li>
                                <li onClick={closeMenu} className="py-4 cursor-pointer">
                                    <Link href="/about">Why Us</Link>
                                </li>
                                <li onClick={closeMenu} className="py-4 cursor-pointer">
                                    <Link href="/contact">{menuOpen ? "Contact Us" : ""}</Link>
                                </li>
                                <li onClick={closeMenu} className="py-4 cursor-pointer">
                                    <Link href="/profile">Profile</Link>
                                </li>
                                <li onClick={closeMenu} className="py-4 cursor-pointer">
                                    <Link href="/cart">Cart</Link>
                                </li>
                                <li onClick={closeMenu} className="py-4 cursor-pointer">
                                    <Link href="/login">Login</Link>
                                </li>
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
                            <li className="relative group flex-1 flex justify-center items-center bg-[var(--supernova)] hover:bg-[var(--rangoon-green)] font-semibold hover:text-[var(--gallery)] transition-color">
                                Brand
                                <ul className="absolute hidden group-hover:block bg-[var(--gallery)] w-full left-0 top-10">
                                    {brands?.map((brand) => (
                                        <Link key={brand.id} href={`/ brands / ${brand.id}`}>
                                            <li className="hover:bg-[var(--rangoon-green)] text-[var(--rangoon-green)] px-4 py-2 cursor-pointer font-semibold hover:text-[var(--gallery)] transition-color">
                                                {brand.name}
                                            </li>
                                        </Link>
                                    ))}
                                </ul>
                            </li>

                            {/* Categories Dropdown */}
                            <li className="relative group flex-1 flex justify-center items-center bg-[var(--supernova)] hover:bg-[var(--rangoon-green)] font-semibold hover:text-[var(--gallery)] transition-color">
                                Product
                                <ul className="absolute hidden group-hover:block bg-[var(--gallery)] w-full left-0 top-10">
                                    {categories?.map((category) => (
                                        <Link key={category.id} href={`/ categories / ${category.id}`}>
                                            <li className="hover:bg-[var(--rangoon-green)] text-[var(--rangoon-green)] px-4 py-2 cursor-pointer font-semibold hover:text-[var(--gallery)] transition-color">
                                                {category.name}
                                            </li>
                                        </Link>
                                    ))}
                                </ul>
                            </li >
                        </ul >
                    </div >
                )
                }
            </div >

        </header >
    );
}