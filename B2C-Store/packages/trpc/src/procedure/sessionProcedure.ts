import { router, publicProcedure } from "../router";
import { TRPCError } from "@trpc/server";
import { createSession, deleteSession, decrypt, getSession as getSessionUtil } from "../utils/session";
import { z } from "zod";

// Helper to parse cookies from a string (Node.js req.headers.cookie)
function parseCookies(cookieHeader?: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(";").forEach((cookie) => {
        const [name, ...rest] = cookie.trim().split("=");
        if (name) cookies[name] = decodeURIComponent(rest.join("="));
    });
    return cookies;
}

export const sessionProcedure = router({
    createSession: publicProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ input }) => {
            try {
                await createSession(input.userId, "session_web");
                return { ok: true };
            } catch {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create session" });
            }
        }),

    deleteSession: publicProcedure.mutation(async () => {
        try {
            await deleteSession("session_web");
            return { ok: true };
        } catch {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete session" });
        }
    }),

    getSession: publicProcedure.query(async () => {
        try {
            // Use the shared getSession utility for server-side retrieval
            let session = null;
            // Only use getSessionUtil if running on the server
            if (typeof window === "undefined") {
                session = await getSessionUtil("session_web");
            } else {
                // Fallback to browser cookie parsing for client-side
                let sessionCookie: string | undefined = undefined;
                if (typeof document !== "undefined" && document.cookie) {
                    const cookies = parseCookies(document.cookie);
                    sessionCookie = cookies["session_web"];
                }
                if (sessionCookie) {
                    session = await decrypt(sessionCookie);
                }
            }
            console.log("[tRPC getSession] decrypted session:", session);
            if (!session?.userId || typeof session.userId !== "string") return { userId: null };
            return { userId: session.userId };
        } catch (err) {
            console.log("[tRPC getSession] error:", err);
            return { userId: null };
        }
    })
});
