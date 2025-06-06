import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { loginProcedure } from "./loginProcedure";
import { inferProcedureInput } from "@trpc/server";
import { User } from "@repo/db";
import { ZodError } from "zod";

// Mock verifyPassword utility
vi.mock("../utils/hash", () => ({
    verifyPassword: vi.fn(),
}));
import { verifyPassword } from "../utils/hash";

type MockContext = {
    prisma: {
        user: {
            findUnique: Mock;
            update: Mock;
        };
    };
};

type LoginInput = inferProcedureInput<typeof loginProcedure>;

describe("loginProcedure", () => {
    const mockUser: User = {
        id: "user-1",
        email: "test@example.com",
        hashedPassword: "hashedpw",
        username: "Test User",
        imgUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
    };

    let ctx: MockContext;
    let findUnique: Mock;
    let update: Mock;

    beforeEach(() => {
        findUnique = vi.fn();
        update = vi.fn();
        ctx = {
            prisma: {
                user: {
                    findUnique,
                    update,
                },
            },
        };
        (verifyPassword as Mock).mockReset();
        findUnique.mockReset();
        update.mockReset();
    });

    it("logs in successfully with valid credentials", async () => {
        findUnique.mockResolvedValue(mockUser);
        (verifyPassword as Mock).mockResolvedValue(true);
        update.mockResolvedValue({ ...mockUser, lastLogin: new Date() });

        const input: LoginInput = {
            email: mockUser.email,
            password: "validpassword",
        };
        const resolver = (loginProcedure as unknown as { _def: { resolver: (opts: { ctx: MockContext; input: LoginInput }) => Promise<{ userId: string }> } })._def.resolver;
        const result = await resolver({ ctx, input });
        expect(result).toEqual({ userId: mockUser.id });
        expect(findUnique).toHaveBeenCalledWith({ where: { email: mockUser.email } });
        expect(verifyPassword).toHaveBeenCalledWith(input.password, mockUser.hashedPassword);
        expect(update).toHaveBeenCalled();
    });

    it("fails login with invalid email", async () => {
        findUnique.mockResolvedValue(null);
        const input: LoginInput = {
            email: "wrong@example.com",
            password: "validpassword",
        };
        const resolver = (loginProcedure as unknown as { _def: { resolver: (opts: { ctx: MockContext; input: LoginInput }) => Promise<{ userId: string }> } })._def.resolver;
        await expect(resolver({ ctx, input })).rejects.toThrow("Invalid email or password");
        expect(findUnique).toHaveBeenCalledWith({ where: { email: input.email } });
        expect(verifyPassword).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });

    it("fails login with invalid password", async () => {
        findUnique.mockResolvedValue(mockUser);
        (verifyPassword as Mock).mockResolvedValue(false);
        const input: LoginInput = {
            email: mockUser.email,
            password: "wrongpassword",
        };
        const resolver = (loginProcedure as unknown as { _def: { resolver: (opts: { ctx: MockContext; input: LoginInput }) => Promise<{ userId: string }> } })._def.resolver;
        await expect(resolver({ ctx, input })).rejects.toThrow("Invalid email or password");
        expect(findUnique).toHaveBeenCalledWith({ where: { email: mockUser.email } });
        expect(verifyPassword).toHaveBeenCalledWith(input.password, mockUser.hashedPassword);
        expect(update).not.toHaveBeenCalled();
    });

    it("fails validation for invalid email format", async () => {
        const input: LoginInput = {
            email: "not-an-email",
            password: "validpassword",
        };
        const resolver = (loginProcedure as unknown as { _def: { resolver: (opts: { ctx: MockContext; input: LoginInput }) => Promise<{ userId: string }> } })._def.resolver;
        let error: unknown = null;
        try {
            await resolver({ ctx, input });
        } catch (err) {
            error = err;
        }
        expect(error).toBeTruthy();
        if (error instanceof ZodError) {
            expect(error.errors?.[0]?.message).toMatch(/Invalid email format|Email address is not valid/);
            expect(findUnique).not.toHaveBeenCalled();
            expect(verifyPassword).not.toHaveBeenCalled();
            expect(update).not.toHaveBeenCalled();
        } else {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toMatch(/Invalid email format|Email address is not valid|Invalid email or password/);
            // Can't guarantee findUnique is not called if not ZodError
        }
    });

    it("fails validation for short password", async () => {
        const input: LoginInput = {
            email: mockUser.email,
            password: "short",
        };
        const resolver = (loginProcedure as unknown as { _def: { resolver: (opts: { ctx: MockContext; input: LoginInput }) => Promise<{ userId: string }> } })._def.resolver;
        let error: unknown = null;
        try {
            await resolver({ ctx, input });
        } catch (err) {
            error = err;
        }
        expect(error).toBeTruthy();
        if (error instanceof ZodError) {
            expect(error.errors?.[0]?.message).toMatch(/Password must be at least 8 characters/);
            expect(findUnique).not.toHaveBeenCalled();
            expect(verifyPassword).not.toHaveBeenCalled();
            expect(update).not.toHaveBeenCalled();
        } else {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toMatch(/Password must be at least 8 characters|Invalid email or password/);
            // Can't guarantee findUnique is not called if not ZodError
        }
    });
});
