"use client";

import Link from "next/link";
import { logout } from "@/components/Login/logoutAction";

const models = [
    "user",
    "address",
    "product",
    "category",
    "brand",
    "cart",
    "cartItem",
    "order",
    "orderItem",
    "wishList",
    "wishListItem",
    "review",
    "admin",
];

export default function SideBar() {
    return (
        <aside className="w-64 min-h-screen bg-gray-100 p-4 border-r overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Dashboard</h2>
            <nav>
                <ul className="space-y-2">
                    {models.map((model) => (
                        <li key={model}>
                            <Link
                                href={`/dashboard/${model}`}
                                className="block px-3 py-2 rounded hover:bg-gray-200 text-gray-800"
                            >
                                {model}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={async () => { await logout(); }}
                            className="block w-full text-left px-3 py-2 rounded hover:bg-red-100 text-red-700"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}