"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();
  const signUpMutation = trpc.crud.createUser.useMutation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signUpMutation.mutateAsync({
        username,
        email,
        password,
      });
      router.push("/login");
    } catch (err) {
      // Enhanced error handling for duplicate username/email
      let errorMsg = "Sign up failed";
      if (err && typeof err === "object" && "message" in err) {
        const msg = (err as { message?: string }).message?.toLowerCase() || "";
        if (msg.includes("unique constraint") || msg.includes("unique") || msg.includes("duplicate")) {
          if (msg.includes("username")) {
            errorMsg = "Username already exists. Please choose another.";
          } else if (msg.includes("email")) {
            errorMsg = "Email already exists. Please use another email.";
          } else {
            errorMsg = "Username or email already exists.";
          }
        } else {
          errorMsg = (err as { message?: string }).message || errorMsg;
        }
      }
      setError(errorMsg);
    }
  };

  const isLoading = signUpMutation.status === "pending";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-blue-600 hover:underline transition text-sm"
        >
          &larr; Return home
        </button>
        <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-700 drop-shadow">
          Create your account
        </h2>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
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
              autoComplete="new-password"
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
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}