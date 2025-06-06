import { describe, it, expect, vi, beforeEach } from "vitest";
import middleware from "./middleware";
import { NextRequest, NextResponse } from "next/server";

// Mocks (define inside factory to avoid hoisting issues)
vi.mock("next/headers", () => {
    const mockGet = vi.fn();
    return {
        cookies: vi.fn(() => ({ get: mockGet })),
        __mockGet: mockGet, // export for test access
    };
});
vi.mock("@/lib/session", () => ({
    decrypt: vi.fn(),
}));
vi.mock("next/server", () => ({
    NextResponse: {
        redirect: vi.fn((url) => ({ type: "redirect", url })),
        next: vi.fn(() => ({ type: "next" })),
    },
}));

function makeReq(pathname: string) {
    return {
        nextUrl: new URL("http://localhost" + pathname),
    } as unknown as NextRequest;
}

describe("middleware", () => {
    let mockGet: { mockReturnValue: (v: unknown) => void };
    let decrypt: { mockResolvedValue: (v: unknown) => void };
    beforeEach(async () => {
        vi.clearAllMocks();
        // Import the __mockGet property from the mocked module
        mockGet = (await import("next/headers") as unknown as { __mockGet: { mockReturnValue: (v: unknown) => void } }).__mockGet;
        decrypt = (await import("@/lib/session") as unknown as { decrypt: { mockResolvedValue: (v: unknown) => void } }).decrypt;
    });

    it("redirects to login if accessing protected route without session", async () => {
        mockGet.mockReturnValue(undefined);
        decrypt.mockResolvedValue(null);
        const req = makeReq("/dashboard");
        const res = await middleware(req);
        expect(NextResponse.redirect).toHaveBeenCalledWith(
            new URL("/?message=login_required", req.nextUrl)
        );
        expect(res).toEqual({ type: "redirect", url: new URL("/?message=login_required", req.nextUrl) });
    });

    it("redirects to dashboard if accessing public route with session", async () => {
        mockGet.mockReturnValue({ value: "cookie" });
        decrypt.mockResolvedValue({ userId: "123" });
        const req = makeReq("/");
        const res = await middleware(req);
        expect(NextResponse.redirect).toHaveBeenCalledWith(
            new URL("/dashboard", req.nextUrl)
        );
        expect(res).toEqual({ type: "redirect", url: new URL("/dashboard", req.nextUrl) });
    });

    it("allows access to protected route with valid session", async () => {
        mockGet.mockReturnValue({ value: "cookie" });
        decrypt.mockResolvedValue({ userId: "123" });
        const req = makeReq("/dashboard");
        const res = await middleware(req);
        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("allows access to public route without session", async () => {
        mockGet.mockReturnValue(undefined);
        decrypt.mockResolvedValue(null);
        const req = makeReq("/");
        const res = await middleware(req);
        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("allows access to unprotected route", async () => {
        mockGet.mockReturnValue(undefined);
        decrypt.mockResolvedValue(null);
        const req = makeReq("/about");
        const res = await middleware(req);
        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });
});
