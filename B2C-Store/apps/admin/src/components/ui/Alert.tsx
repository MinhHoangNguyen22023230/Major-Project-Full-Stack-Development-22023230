import React, { useEffect, useRef, useState } from "react";
import { IoIosAlert } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

interface AlertProps {
    message: string;
    type?: "info" | "success" | "warning" | "error";
    onClose?: () => void;
}

const typeStyles: Record<string, string> = {
    info: "bg-blue-100 text-blue-700 border-blue-400",
    success: "bg-green-100 text-green-700 border-green-400",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-400",
    error: "bg-red-100 text-red-700 border-red-400",
};

const Alert: React.FC<AlertProps> = ({ message, type = "info", onClose }) => {
    const [visible, setVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // When onClose is called, trigger fade-out first
    const handleClose = () => {
        setVisible(false);
        // Wait for fade-out animation before actually closing
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // match fade-out duration
    };

    // If parent unmounts alert immediately, clear timeout
    useEffect(() => {
        const timeout = timeoutRef.current;
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg border flex items-center gap-2 min-w-[250px] max-w-[90vw] ${typeStyles[type]} transition-all duration-300 ease-in-out ${visible ? "animate-fade-in" : "animate-fade-out"}`}
            role="alert"
        >
            <IoIosAlert className="w-6 h-6" />
            <span className="flex-1">{message}</span>
            {onClose && (
                <button
                    onClick={handleClose}
                    className="cursor-pointer ml-2 text-lg font-bold focus:outline-none hover:text-black"
                    aria-label="Close alert"
                >
                    <IoMdClose className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

// Tailwind CSS animation (add to global CSS if not present):
// .animate-fade-in { @apply opacity-0 scale-95; animation: fadeIn 0.3s forwards; }
// @keyframes fadeIn { to { opacity: 1; scale: 1; } }
// .animate-fade-out { @apply opacity-100 scale-100; animation: fadeOut 0.3s forwards; }
// @keyframes fadeOut { to { opacity: 0; scale: 0.95; } }

export default Alert;