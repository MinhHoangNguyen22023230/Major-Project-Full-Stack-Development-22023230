"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
    const router = useRouter();
    const adminLoginMutation = trpc.adminLog.useMutation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const message = searchParams.get("message");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            // Authenticate admin with tRPC
            const admin = await adminLoginMutation.mutateAsync({ email, password });

            // Set session cookie via API route (customize as needed for admin)
            const res = await fetch("/api/admin-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId: admin.adminId }),
            });

            if (!res.ok) {
                throw new Error("Failed to create admin session");
            }

            router.push("/dashboard");
        } catch (err) {
            const errorMsg = (err as { message?: string })?.message || "Login failed";
            setError(errorMsg);
        }
    };

    const isLoading = adminLoginMutation.status === "pending";

    return (
        <div>
            {message === "login_required" && (
                <div className="text-red-600 text-sm mb-2">
                    Please log in to continue.
                </div>
            )}
            <form className="flex flex-col h-50 gap-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--rangoon-green)]">
                        Admin Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[var(--rangoon-green)]">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                )}
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-[var(--supernova)] text-[var(--gallery)] rounded hover:bg-[var(--yukon-gold)] transition"
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}