import React, { ReactNode } from "react";

interface ComponentCardProps {
    children: ReactNode; // Content of the card
    className?: string; // Optional className for styling
    title?: string;
    breadcrumb?: React.ReactNode;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ children, className, title, breadcrumb }) => {
    return (
        <>
                    {(title || breadcrumb) && (
                <div className="w-full flex flex-row pl-10 pr-10 mb-5 justify-between">
                    {title && <h1 className="text-2xl font-bold">{title}</h1>}
                    {breadcrumb && <div className="text-center text-gray-600 mb-6">{breadcrumb}</div>}
                </div>
            )}
        <main className={`h-fit min-w-50 flex flex-col gap-10 transition-all duration-300 ${className}`}>
            {children}
        </main>
        </>
    );
};

export default ComponentCard;
