import { describe, it, expect, vi, beforeEach } from "vitest";
import middleware from "../middleware";
import { NextRequest, NextResponse } from "next/server";

// Mock next/headers
vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

// Mock @/lib/session
vi.mock("@/lib/session", () => ({
    decrypt: vi.fn(),
}));

const { cookies } = await import("next/headers");
const { decrypt } = await import("@/lib/session");

function createMockRequest(pathname: string) {
    // Use a real URL instance for nextUrl to match Next.js runtime
    const url = new URL(`http://localhost${pathname}`);
    return {
        nextUrl: url,
    } as unknown as NextRequest;
}

describe("middleware", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function mockCookies(getValue: string | undefined) {
        (cookies as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
            get: vi.fn().mockReturnValue(getValue !== undefined ? { value: getValue } : undefined),
        });
    }
    function mockDecrypt(value: { userId: string } | null) {
        (decrypt as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(value);
    }

    it("redirects to login if accessing protected route without session", async () => {
        mockCookies(undefined);
        mockDecrypt(null);
        const req = createMockRequest("/dashboard");
        const res = await middleware(req);
        expect(res instanceof NextResponse).toBe(true);
        expect((res as NextResponse).headers.get("location")).toContain("/?message=login_required");
    });

    it("redirects to dashboard if accessing public route with session", async () => {
        mockCookies("cookie");
        mockDecrypt({ userId: "admin1" });
        const req = createMockRequest("/");
        const res = await middleware(req);
        expect(res instanceof NextResponse).toBe(true);
        expect((res as NextResponse).headers.get("location")).toContain("/dashboard");
    });

    it("allows access to protected route with valid session", async () => {
        mockCookies("cookie");
        mockDecrypt({ userId: "admin1" });
        const req = createMockRequest("/dashboard");
        const res = await middleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    it("allows access to public route without session", async () => {
        mockCookies(undefined);
        mockDecrypt(null);
        const req = createMockRequest("/");
        const res = await middleware(req);
        expect(res).toEqual(NextResponse.next());
    });
});