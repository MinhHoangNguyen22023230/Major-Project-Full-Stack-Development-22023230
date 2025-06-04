"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Alert from "@/components/ui/Alert";

export default function AdminLoginForm() {
    const router = useRouter();
    const adminLoginMutation = trpc.adminLog.useMutation();
    const adminSessionCreateMutation = trpc.adminSession.createAdminSession.useMutation();
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

            // Set session cookie via tRPC adminSessionProcedure
            await new Promise((resolve, reject) => {
                adminSessionCreateMutation.mutate(
                    { userId: admin.userId },
                    {
                        onSuccess: () => resolve(true),
                        onError: (err) => reject(err),
                    }
                );
            });

            router.push("/dashboard");
        } catch (err) {
            const errorMsg = (err as { message?: string })?.message || "Login failed";
            setError(errorMsg);
        }
    };

    const isLoading = adminLoginMutation.status === "pending";

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Image
                    src="/logo.svg"
                    alt="B2C Store Logo"
                    width={50}
                    height={50}
                    className="mx-auto h-50 w-auto"
                />
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {message === "login_required" && (
                    <Alert message="Please log in to continue." type="error" onClose={() => router.replace("/", { scroll: false })} />
                )}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium">
                            Admin Email
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium">
                                Password
                            </label>
                            <div className="text-sm">
                                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <Alert message={error} type="error" onClose={() => setError(null)} />
                    )}

                    <div>
                        <button
                            type="submit"
                            className="flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Sign in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}