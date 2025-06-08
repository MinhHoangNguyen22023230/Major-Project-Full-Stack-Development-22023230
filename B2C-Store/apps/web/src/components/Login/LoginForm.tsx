"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const loginMutation = trpc.login.useMutation();
    const sessionCreateMutation = trpc.session.createSession.useMutation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const message = searchParams.get("message");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        try {
            const user = await loginMutation.mutateAsync({ email, password });
            await new Promise((resolve, reject) => {
                sessionCreateMutation.mutate(
                    { userId: user.userId },
                    {
                        onSuccess: () => resolve(true),
                        onError: (err) => reject(err),
                    }
                );
            });
            router.push("/");
        } catch (err) {
            let errorMsg = "Login failed";
            if (err && typeof err === "object" && "message" in err) {
                const msg = (err as { message?: string }).message?.toLowerCase() || "";
                if (msg.includes("password") || msg.includes("user") || msg.includes("email")) {
                    errorMsg = "Invalid email or password.";
                } else {
                    errorMsg = (err as { message?: string }).message || errorMsg;
                }
            }
            setError(errorMsg);
        }
    };

    const isLoading = loginMutation.status === "pending";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                {message === "login_required" && (
                    <div className="text-red-600 text-sm mb-2 text-center bg-red-50 border border-red-200 rounded py-2 px-3">
                        Please log in to continue.
                    </div>
                )}
                <button
                    onClick={() => router.push('/')}
                    className="mb-6 text-[var(--supernova)] hover:text-[var(--yukon-gold)] hover:underline transition text-sm cursor-pointer"
                >
                    &larr; Return home
                </button>
                <h2 className="text-3xl font-extrabold mb-8 text-center text-[var(--supernova)] drop-shadow">
                    Login to your account
                </h2>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            required
                            minLength={8}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>
                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded py-2 px-3">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-60"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <Link href="/signup" className="text-[var(--supernova)] hover:text-[var(--yukon-gold)] hover:underline font-medium cursor-pointer">
                        Don&apos;t have an account? Click here to Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}