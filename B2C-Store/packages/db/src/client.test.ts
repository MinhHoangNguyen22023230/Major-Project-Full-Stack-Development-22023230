import { describe, it, expect } from "vitest";
import { prisma } from "./client";

describe("prisma client export", () => {
    it("should be defined", () => {
        expect(prisma).toBeDefined();
    });

    it("should have $connect and $disconnect methods", () => {
        expect(typeof prisma.$connect).toBe("function");
        expect(typeof prisma.$disconnect).toBe("function");
    });
});
