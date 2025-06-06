import { render, screen } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        crud: {
            getBrands: { useQuery: vi.fn() },
        },
    },
}));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));

import OverviewBrand from "./OverviewBrand";

const now = new Date();
const mockBrands = [
    {
        id: "1",
        name: "Brand A",
        createdAt: now.toISOString(),
        products: [
            { id: "p1", rating: 4 },
            { id: "p2", rating: 5 },
        ],
    },
    {
        id: "2",
        name: "Brand B",
        createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        products: [],
    },
    {
        id: "3",
        name: "Brand C",
        createdAt: now.toISOString(),
        products: [
            { id: "p3", rating: 3 },
        ],
    },
];

describe("OverviewBrand", () => {
    let getBrandsMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getBrandsMock = vi.fn().mockReturnValue({ data: mockBrands, isLoading: false });
        (trpc.crud.getBrands.useQuery as unknown as { mockImplementation: (fn: typeof getBrandsMock) => void }).mockImplementation(getBrandsMock);
    });

    it("renders all brand stats correctly", () => {
        render(<OverviewBrand />);
        expect(screen.getByText(/brand overview/i)).not.toBeNull();
        expect(screen.getByText(/total brands/i)).not.toBeNull();
        expect(screen.getByText("3")).not.toBeNull(); // total brands
        expect(screen.getByText(/new brands/i)).not.toBeNull();
        // Only 2 brands created in last 30d
        const twos = screen.getAllByText("2");
        expect(twos.length).toBeGreaterThan(0);
        expect(screen.getByText(/brand with most products/i)).not.toBeNull();
        // Brand A has most products (2)
        const brandA = screen.getAllByText(/brand a/i);
        expect(brandA.length).toBeGreaterThan(0);
        // Brand B has no products
        expect(screen.getByText(/brands with no products/i)).not.toBeNull();
        const ones = screen.getAllByText("1");
        expect(ones.length).toBeGreaterThan(0);
        // Highest avg rating brand is Brand A (4.5)
        // The label is in a <p> not <h1>, so use getAllByText with a function matcher
        const highestAvgRatingLabel = screen.getAllByText((content, node) =>
            (node?.textContent || '').toLowerCase().includes('highest avg. product rating')
        );
        expect(highestAvgRatingLabel.length).toBeGreaterThan(0);
        const rating45 = screen.getAllByText((content, node) =>
            (node?.textContent || '').includes('4.5')
        );
        expect(rating45.length).toBeGreaterThan(0);
        // Most recently created brand (Brand C or Brand A, but appears last)
        expect(screen.getByText(/most recently created brand/i)).not.toBeNull();
        const mostRecent = screen.getAllByText((content, node) =>
            (node?.textContent || '').includes('Brand') && (node?.textContent || '').includes('(')
        );
        expect(mostRecent.length).toBeGreaterThan(0);
    });

    it("shows loader when loading", () => {
        getBrandsMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<OverviewBrand />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows zero stats if no brands", () => {
        getBrandsMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<OverviewBrand />);
        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBeGreaterThan(0);
        const heading = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("brand overview")
        );
        expect(heading.length).toBeGreaterThan(0);
    });
});
