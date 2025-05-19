import { useState, useEffect, useCallback } from "react";

export function useTopNavBar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return { menuOpen, toggleMenu, closeMenu };
}

export function useShowCategoriesNavbar() {
    const [showCategories, setShowCategories] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleScroll = useCallback(() => {
        if (window.scrollY > lastScrollY) {
            // Scrolling down
            setShowCategories(false);
        } else {
            // Scrolling up
            setShowCategories(true);
        }
        setLastScrollY(window.scrollY);
    }, [lastScrollY]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return { showCategories };
}



