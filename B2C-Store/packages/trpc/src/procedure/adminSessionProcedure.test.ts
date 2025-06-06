import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminSessionProcedure } from "./adminSessionProcedure";

const mockCreateSession = vi.fn();
const mockDeleteSession = vi.fn();
const mockGetSession = vi.fn();
const mockDecrypt = vi.fn();

vi.mock("../utils/session", () => ({
    createSession: (...args: unknown[]) => mockCreateSession(...args),
    deleteSession: (...args: unknown[]) => mockDeleteSession(...args),
    getSession: (...args: unknown[]) => mockGetSession(...args),
    decrypt: (...args: unknown[]) => mockDecrypt(...args),
}));

describe("adminSessionProcedure", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("createAdminSession", () => {
        it("creates a session and returns ok", async () => {
            mockCreateSession.mockResolvedValue(undefined);
            const result = await (adminSessionProcedure.createAdminSession as unknown as { _def: { resolver: (opts: { ctx: unknown; input: { userId: string } }) => Promise<{ ok: boolean }> } })._def.resolver({
                input: { userId: "admin-id" },
                ctx: {},
            });
            expect(mockCreateSession).toHaveBeenCalledWith("admin-id", "admin_session");
            expect(result).toEqual({ ok: true });
        });
        it("throws TRPCError if session creation fails", async () => {
            mockCreateSession.mockRejectedValue(new Error("fail"));
            await expect(
                (adminSessionProcedure.createAdminSession as unknown as { _def: { resolver: (opts: { ctx: unknown; input: { userId: string } }) => Promise<{ ok: boolean }> } })._def.resolver({
                    input: { userId: "admin-id" },
                    ctx: {},
                })
            ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
        });
    });

    describe("deleteAdminSession", () => {
        it("deletes a session and returns ok", async () => {
            mockDeleteSession.mockResolvedValue(undefined);
            const result = await (adminSessionProcedure.deleteAdminSession as unknown as { _def: { resolver: (opts: { ctx: unknown }) => Promise<{ ok: boolean }> } })._def.resolver({ ctx: {} });
            expect(mockDeleteSession).toHaveBeenCalledWith("admin_session");
            expect(result).toEqual({ ok: true });
        });
        it("throws TRPCError if session deletion fails", async () => {
            mockDeleteSession.mockRejectedValue(new Error("fail"));
            await expect(
                (adminSessionProcedure.deleteAdminSession as unknown as { _def: { resolver: (opts: { ctx: unknown }) => Promise<{ ok: boolean }> } })._def.resolver({ ctx: {} })
            ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
        });
    });

    describe("getAdminSession", () => {
        it("returns userId from server-side session util", async () => {
            mockGetSession.mockResolvedValue({ userId: "admin-id" });
            const result = await (adminSessionProcedure.getAdminSession as unknown as { _def: { resolver: (opts: { ctx: unknown }) => Promise<{ userId: string | null }> } })._def.resolver({ ctx: {} });
            expect(mockGetSession).toHaveBeenCalledWith("admin_session");
            expect(result).toEqual({ userId: "admin-id" });
        });
        it("returns userId from client-side cookie (browser)", async () => {
            // Simulate browser environment
            (global as Record<string, unknown>).window = {};
            (global as Record<string, unknown>).document = { cookie: "admin_session=encrypted" };
            mockDecrypt.mockResolvedValue({ userId: "admin-id" });
            const result = await (adminSessionProcedure.getAdminSession as unknown as { _def: { resolver: (opts: { ctx: unknown }) => Promise<{ userId: string | null }> } })._def.resolver({ ctx: {} });
            expect(mockDecrypt).toHaveBeenCalledWith("encrypted");
            expect(result).toEqual({ userId: "admin-id" });
            delete (global as Record<string, unknown>).window;
            delete (global as Record<string, unknown>).document;
        });
        it("returns userId: null if no session", async () => {
            mockGetSession.mockResolvedValue(null);
            const result = await (adminSessionProcedure.getAdminSession as unknown as { _def: { resolver: (opts: { ctx: unknown }) => Promise<{ userId: string | null }> } })._def.resolver({ ctx: {} });
            expect(result).toEqual({ userId: null });
        });
        it("returns userId: null on error", async () => {
            mockGetSession.mockRejectedValue(new Error("fail"));
            const result = await (adminSessionProcedure.getAdminSession as unknown as { _def: { resolver: (opts: { ctx: unknown }) => Promise<{ userId: string | null }> } })._def.resolver({ ctx: {} });
            expect(result).toEqual({ userId: null });
        });
    });
});
