import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./hash";


describe("hash utilities", () => {
    const password = "SuperSecret123!";
    const wrongPassword = "WrongPassword!";

    it("hashPassword should hash and verifyPassword should verify the correct password", async () => {
        const hashed = await hashPassword(password);
        expect(typeof hashed).toBe("string");
        expect(hashed).not.toBe(password);
        const isValid = await verifyPassword(password, hashed);
        expect(isValid).toBe(true);
    });

    it("verifyPassword should return false for an incorrect password", async () => {
        const hashed = await hashPassword(password);
        const isValid = await verifyPassword(wrongPassword, hashed);
        expect(isValid).toBe(false);
    });

    it("verifyPassword should return false for an invalid hash", async () => {
        const isValid = await verifyPassword(password, "not-a-valid-hash");
        expect(isValid).toBe(false);
    });
});
