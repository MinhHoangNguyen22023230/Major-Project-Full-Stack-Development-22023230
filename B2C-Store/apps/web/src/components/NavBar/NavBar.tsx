"use client";

import Image from "next/image";
import Link from "next/link";
import "@/app/styles/navbar.modules.css";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useState } from "react";
import CategoriesNavBar from "./CategoriesNavBar";

export default function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const handleNav = () => {
        setMenuOpen(!menuOpen);
    }

    return (
        <nav className=" w-full h-24 shadow-xl bg-white">
            <div className="flex justify-between items-center h-full w-full px-2 2xl:px-16">
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

                <div onClick={handleNav} className="sm:hidden cursor-pointer pl-24">
                    <AiOutlineMenu size={25} className="text-black" />
                </div>
                {/* Mobile Menu */}

                <div className={
                    menuOpen ? "fixed left-0 top-0 w-[65%] h-screen sm:hidden bg-[#ecf0f3] p-10 ease-in duration-500" : "fixed left-[-100%] top-0 p-10 ease-in duration-500"
                }>
                    <div className="flex w-full items-center justify-end">
                        <div onClick={handleNav} className="cursor-pointer">
                            <AiOutlineClose size={25} className="text-black" />
                        </div>
                    </div>

                    <div className="flex-col py-4">
                        <ul>
                            <li onClick={() => setMenuOpen(false)} className="py-4 cursor-pointer">
                                <Link href="/">Home</Link>
                            </li>
                            <li onClick={() => setMenuOpen(false)} className="py-4 cursor-pointer">
                                <Link href="/about">Why Us</Link>
                            </li>
                            <li onClick={() => setMenuOpen(false)} className="py-4 cursor-pointer">
                                <Link href="/contact">Contact Us</Link>
                            </li>
                            <li onClick={() => setMenuOpen(false)} className="py-4 cursor-pointer">
                                <Link href="/profile">Profile</Link>
                            </li>
                            <li onClick={() => setMenuOpen(false)} className="py-4 cursor-pointer">
                                <Link href="/cart">Cart</Link>
                            </li>
                            <li onClick={() => setMenuOpen(false)} className="py-4 cursor-pointer">
                                <Link href="/login">Login</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <CategoriesNavBar />
        </nav>

    );
}