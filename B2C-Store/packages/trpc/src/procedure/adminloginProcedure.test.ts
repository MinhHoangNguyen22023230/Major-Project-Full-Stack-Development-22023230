import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { adminLoginInputSchema, adminLoginResolver } from "./adminloginProcedure";

const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockVerifyPassword = vi.fn();

vi.mock("../utils/hash", () => ({
    verifyPassword: (...args: unknown[]) => mockVerifyPassword(...args),
}));

const ctx = {
    prisma: {
        admin: {
            findUnique: mockFindUnique,
            update: mockUpdate,
        },
    },
};

describe("adminLoginProcedure", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("validates input and rejects invalid email", () => {
        expect(() => adminLoginInputSchema.parse({ email: "bademail", password: "password123" })).toThrow(z.ZodError);
    });

    it("throws if admin not found", async () => {
        mockFindUnique.mockResolvedValue(null);
        await expect(
            adminLoginResolver({
                ctx,
                input: { email: "admin@example.com", password: "password123" },
            })
        ).rejects.toThrow("Invalid email or password");
    });

    it("throws if password is invalid", async () => {
        mockFindUnique.mockResolvedValue({ id: "1", hashedPassword: "hashed" });
        mockVerifyPassword.mockResolvedValue(false);
        await expect(
            adminLoginResolver({
                ctx,
                input: { email: "admin@example.com", password: "wrongpass" },
            })
        ).rejects.toThrow("Invalid email or password");
    });

    it("returns userId and updates lastLogin on success", async () => {
        mockFindUnique.mockResolvedValue({ id: "1", hashedPassword: "hashed" });
        mockVerifyPassword.mockResolvedValue(true);
        mockUpdate.mockResolvedValue({});
        const result = await adminLoginResolver({
            ctx,
            input: { email: "admin@example.com", password: "password123" },
        });
        expect(result).toEqual({ userId: "1" });
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: "1" },
            data: { lastLogin: expect.any(Date) },
        });
    });
});
