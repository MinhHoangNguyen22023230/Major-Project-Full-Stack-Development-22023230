import { describe, it, expect } from "vitest";
import * as db from "./index";

describe("db index exports", () => {
    it("should export prisma", () => {
        expect(db.prisma).toBeDefined();
        expect(typeof db.prisma.$connect).toBe("function");
        expect(typeof db.prisma.$disconnect).toBe("function");
    });

    it("should export generated client members", () => {
        // Check for a known export from the generated client, e.g., PrismaClient
        expect(db.PrismaClient).toBeDefined();
    });
});
