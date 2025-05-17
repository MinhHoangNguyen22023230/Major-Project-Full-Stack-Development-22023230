"use client";

import CategoriesNavBar from "./CategoriesNavBar";
import TopNavbar from "./TopNavBar";
import { useShowCategoriesNavbar } from "@/hooks/useCategoriesNavbar";

export default function Navbar() {

    const { showCategories } = useShowCategoriesNavbar();


    return (
        <header className={`${showCategories ? "sm:h-34" : ""} shadow-xl fixed w-full h-24`}>
        <TopNavbar />
        <CategoriesNavBar />
        </header>
    );
}