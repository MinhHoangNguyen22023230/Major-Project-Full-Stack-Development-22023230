"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";
import Image from "next/image";
export default function ThemeSwitch() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted before accessing theme
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <Image
            src={resolvedTheme === "light" ? "/sun.png" : "/moon.png"}
            alt="Loading Light/Dark Theme Icon"
            width={36}
            height={36}
            sizes="36x36"
            priority={false}
        />
    ); // Prevent SSR mismatch

    if (resolvedTheme === "dark") {
        return <FaSun onClick={() => setTheme("light")} className="h-5 w-5" title="Switch to light mode" />;
    }
    if (resolvedTheme === "light") {
        return <FaMoon onClick={() => setTheme("dark")} className="h-5 w-5" title="Switch to dark mode" />;
    }

    return (
        <button
            className="p-2 rounded-full transition-colors"
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
            title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
        >
            {resolvedTheme === "light" ? <FaMoon className="h-5 w-5" /> : <FaSun className="h-5 w-5" />}
        </button>
    );
}