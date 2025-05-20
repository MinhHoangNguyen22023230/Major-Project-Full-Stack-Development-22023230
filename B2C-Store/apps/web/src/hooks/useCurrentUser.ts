"use client";
import { useEffect, useState } from "react";

export function useCurrentUser() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        async function fetchSession() {
            try {
                const res = await fetch("/api/session");
                const data = await res.json();
                console.log("Session data:", data);
                if (!ignore && data && data.userId && data.userId.userId) {
                    setUserId(data.userId.userId);
                } else if (!ignore) {
                    setUserId(null);
                }
            } catch {
                if (!ignore) setUserId(null);
            }
        }
        fetchSession();
        return () => { ignore = true; };
    }, []);


    console.log("useCurrentUser:", userId);
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