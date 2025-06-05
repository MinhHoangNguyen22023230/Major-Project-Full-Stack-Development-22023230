"use client";
import { useEffect } from "react";
import { useSession } from "@/app/clientLayout";

export function useCurrentUser() {
    // Use the session context instead of fetching /api/session
    const session = useSession();
    const userId = session?.userId ?? null;
    return userId;
}

export function useRedirectIfNotLoggedIn() {
    const userId = useCurrentUser();
    useEffect(() => {
        if (!userId) {
            window.location.href = "/login?message=login_required";
        }
    }, [userId]);
}