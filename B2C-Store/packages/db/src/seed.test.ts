import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";

// Define a type for the mock prisma
interface MockPrisma {
    brand: { create: ReturnType<typeof vi.fn> };
    category: { create: ReturnType<typeof vi.fn> };
    product: { create: ReturnType<typeof vi.fn> };
    user: { create: ReturnType<typeof vi.fn> };
    address: { create: ReturnType<typeof vi.fn> };
    admin: { create: ReturnType<typeof vi.fn> };
    $disconnect: ReturnType<typeof vi.fn>;
}

function mockPrismaCreateMethods(): MockPrisma {
    const mockCreate = vi.fn().mockResolvedValue({ id: "id" });
    return {
        brand: { create: mockCreate },
        category: { create: mockCreate },
        product: { create: mockCreate },
        user: { create: mockCreate },
        address: { create: mockCreate },
        admin: { create: mockCreate },
        $disconnect: vi.fn().mockResolvedValue(undefined),
    };
}

let mockPrisma: MockPrisma = mockPrismaCreateMethods();

vi.mock("../generated/client", () => ({
    PrismaClient: vi.fn(() => mockPrisma),
}));

describe("seed script", () => {
    beforeEach(() => {
        // Reset mockPrisma for each test
        mockPrisma = mockPrismaCreateMethods();
    });

    beforeAll(() => {
        // Suppress console output
        vi.spyOn(console, "log").mockImplementation(() => { });
        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should have a main function", async () => {
        const { main } = await import("./seed.ts");
        expect(typeof main).toBe("function");
    });

    it("should run main without throwing and call all create methods", async () => {
        const { main } = await import("./seed.ts");
        await expect(main()).resolves.not.toThrow();
        expect(mockPrisma.brand.create).toHaveBeenCalled();
        expect(mockPrisma.category.create).toHaveBeenCalled();
        expect(mockPrisma.product.create).toHaveBeenCalled();
        expect(mockPrisma.user.create).toHaveBeenCalled();
        expect(mockPrisma.address.create).toHaveBeenCalled();
        expect(mockPrisma.admin.create).toHaveBeenCalled();
        expect(mockPrisma.$disconnect).toHaveBeenCalledTimes(1);
    });
});
