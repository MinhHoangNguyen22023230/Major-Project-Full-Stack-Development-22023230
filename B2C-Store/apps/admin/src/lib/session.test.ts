import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";

const validPayload = { userId: "admin1", exp: Math.floor(Date.now() / 1000) + 3600 };
const validToken = "valid.jwt.token";

beforeAll(() => {
    process.env.JWT_SECRET = "testsecret";
});
afterAll(() => {
    delete process.env.JWT_SECRET;
});

describe("decrypt", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it("returns null if session is undefined or empty", async () => {
        const { decrypt } = await import("./session");
        expect(await decrypt(undefined)).toBeNull();
        expect(await decrypt("")).toBeNull();
    });

    it("returns payload if jwtVerify succeeds", async () => {
        vi.doMock("jose", () => ({
            jwtVerify: vi.fn().mockResolvedValue({ payload: validPayload }),
        }));
        const { decrypt } = await import("./session");
        const result = await decrypt(validToken);
        expect(result).toEqual(validPayload);
        vi.resetModules();
    });

    it("returns null and logs error if jwtVerify throws", async () => {
        const error = new Error("bad token");
        vi.doMock("jose", () => ({
            jwtVerify: vi.fn().mockRejectedValue(error),
        }));
        const logSpy = vi.spyOn(console, "error").mockImplementation(() => { });
        const { decrypt } = await import("./session");
        const result = await decrypt("bad.jwt.token");
        expect(result).toBeNull();
        expect(logSpy).toHaveBeenCalledWith("Session decryption error:", error);
        logSpy.mockRestore();
        vi.resetModules();
    });

    it("throws if JWT_SECRET is not set", async () => {
        delete process.env.JWT_SECRET;
        vi.resetModules();
        await expect(import("./session")).rejects.toThrow("Environment variable JWT_SECRET is not defined.");
        process.env.JWT_SECRET = "testsecret";
    });
});
