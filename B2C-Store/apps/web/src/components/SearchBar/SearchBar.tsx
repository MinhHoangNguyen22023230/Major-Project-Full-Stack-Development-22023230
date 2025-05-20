"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";

export default function SearchBar({ closeMenu }: { closeMenu?: () => void }) {
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fetch all products
    const { data: products } = trpc.crud.getProducts.useQuery();

    // Filter products by name match (case-insensitive, includes query)
    const filteredProducts = query.length > 0 && products
        ? products.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    // Hide dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={wrapperRef}
            className="max-w-md mx-auto w-full relative"
        >
            <label htmlFor="default-search" className="mb-2 text-sm font-medium sr-only">Search</label>
            <div>
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"></div>
                <input
                    ref={inputRef}
                    type="search"
                    id="default-search"
                    className="block w-full p-4 ps-10 text-sm border border-gray-300 rounded-lg"
                    style={{
                        color: "var(--rangoon-green)",
                        background: "var(--supernova)"
                    }}
                    placeholder="Search products"
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    autoComplete="off"
                />
                {showDropdown && filteredProducts.length > 0 && (
                    <ul
                        className="absolute left-0 right-0 mt-1 border border-gray-300 rounded-lg bg-[var(--supernova)]"
                        style={{
                            color: "var(--rangoon-green)",
                            background: "var(--supernova)",
                            zIndex: 1000, // High z-index to go above navbars
                            top: "100%",
                        }}
                    >
                        {filteredProducts.map((product) => (
                            <li key={product.id}>
                                <Link
                                    href={`/products/${product.id}`}
                                    className="block px-4 py-2 hover:bg-yellow-100"
                                    style={{ color: "var(--rangoon-green)" }}
                                    onClick={() => {
                                        setShowDropdown(false);
                                        if (closeMenu) closeMenu(); // <-- close mobile menu if provided
                                    }}
                                >
                                    {product.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}