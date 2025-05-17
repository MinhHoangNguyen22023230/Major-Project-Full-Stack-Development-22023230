"use client";

import { useShowCategoriesNavbar } from "@/hooks/useCategoriesNavbar";

export default function CategoriesNavBar() {
    const { showCategories } = useShowCategoriesNavbar();

    return (
        <>
            {showCategories && (
                <div className="w-full h-10 flex bg-[var(--gallery)]">
                    <ul className="flex w-full">
                        <li className="relative group flex-1 flex justify-center items-center bg-[var(--supernova)] hover:bg-[var(--rangoon-green)] font-semibold hover:text-[var(--gallery)] transition-color">
                            Brand
                            <ul className="absolute hidden group-hover:block bg-[var(--gallery)] w-full left-0 top-10">
                                <li className="hover:bg-[var(--rangoon-green)] text-[var(--rangoon-green)] px-4 py-2 cursor-pointer font-semibold hover:text-[var(--gallery)] transition-color">
                                    Apple
                                </li>
                                <li className="hover:bg-[var(--rangoon-green)] text-[var(--rangoon-green)] px-4 py-2 cursor-pointer font-semibold hover:text-[var(--gallery)] transition-color">
                                    Pineapple
                                </li>
                            </ul>
                        </li>
                        <li className="relative group flex-1 flex justify-center items-center bg-[var(--supernova)] hover:bg-[var(--rangoon-green)] font-semibold hover:text-[var(--gallery)] transition-color">
                            Product
                            <ul className="absolute hidden group-hover:block bg-[var(--gallery)] w-full left-0 top-10">
                                <li className="hover:bg-[var(--rangoon-green)] text-[var(--rangoon-green)] px-4 py-2 cursor-pointer font-semibold hover:text-[var(--gallery)] transition-color">
                                    Subcategory 1
                                </li>
                            </ul>
                        </li>
                        <li className="relative group flex-1 flex justify-center items-center bg-[var(--supernova)] hover:bg-[var(--rangoon-green)] font-semibold hover:text-[var(--gallery)] transition-color">
                            Service
                            <ul className="absolute hidden group-hover:block bg-[var(--gallery)] w-full left-0 top-10">
                                <li className="hover:bg-[var(--rangoon-green)] text-[var(--rangoon-green)] px-4 py-2 cursor-pointer font-semibold hover:text-[var(--gallery)] transition-color">
                                    Subcategory 1
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
}