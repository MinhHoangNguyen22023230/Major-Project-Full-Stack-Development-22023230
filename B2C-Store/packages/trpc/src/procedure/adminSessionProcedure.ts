import { router, publicProcedure } from "../router";
import { TRPCError } from "@trpc/server";
import { createSession, deleteSession, decrypt, getSession as getSessionUtil } from "../utils/session";
import { z } from "zod";

function parseCookies(cookieHeader?: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(";").forEach((cookie) => {
        const [name, ...rest] = cookie.trim().split("=");
        if (name) cookies[name] = decodeURIComponent(rest.join("="));
    });
    return cookies;
}

export const adminSessionProcedure = router({
    createAdminSession: publicProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ input }) => {
            try {
                await createSession(input.userId, "admin_session");
                return { ok: true };
            } catch {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create admin session" });
            }
        }),

    deleteAdminSession: publicProcedure.mutation(async () => {
        try {
            await deleteSession("admin_session");
            return { ok: true };
        } catch {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete admin session" });
        }
    }),

    getAdminSession: publicProcedure.query(async () => {
        try {
            let session = null;
            if (typeof window === "undefined") {
                session = await getSessionUtil("admin_session");
            } else {
                let sessionCookie: string | undefined = undefined;
                if (typeof document !== "undefined" && document.cookie) {
                    const cookies = parseCookies(document.cookie);
                    sessionCookie = cookies["admin_session"];
                }
                if (sessionCookie) {
                    session = await decrypt(sessionCookie);
                }
            }
            if (!session?.userId || typeof session.userId !== "string") return { userId: null };
            return { userId: session.userId };
        } catch {
            return { userId: null };
        }
    })
});
