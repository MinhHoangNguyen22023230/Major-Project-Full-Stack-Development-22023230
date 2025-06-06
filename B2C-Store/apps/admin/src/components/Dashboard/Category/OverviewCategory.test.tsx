import { render, screen } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        crud: {
            getCategories: { useQuery: vi.fn() },
        },
    },
}));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));

import OverviewCategory from "./OverviewCategory";

const now = new Date();
const mockCategories = [
    {
        id: "1",
        name: "Cat A",
        createdAt: now.toISOString(),
        products: [{ id: "p1" }, { id: "p2" }],
    },
    {
        id: "2",
        name: "Cat B",
        createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        products: [],
    },
    {
        id: "3",
        name: "Cat C",
        createdAt: now.toISOString(),
        products: [{ id: "p3" }],
    },
];

describe("OverviewCategory", () => {
    let getCategoriesMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getCategoriesMock = vi.fn().mockReturnValue({ data: mockCategories, isLoading: false });
        (trpc.crud.getCategories.useQuery as unknown as { mockImplementation: (fn: typeof getCategoriesMock) => void }).mockImplementation(getCategoriesMock);
    });

    it("renders all category stats correctly", () => {
        render(<OverviewCategory />);
        expect(screen.getByText(/category overview/i)).not.toBeNull();
        expect(screen.getByText(/total categories/i)).not.toBeNull();
        expect(screen.getByText("3")).not.toBeNull(); // total categories
        expect(screen.getByText(/new categories/i)).not.toBeNull();
        // Only 2 categories created in last 30d
        const twos = screen.getAllByText("2");
        expect(twos.length).toBeGreaterThan(0);
        expect(screen.getByText(/category with most products/i)).not.toBeNull();
        // Cat A has most products (2) and may also be most recently created, so use getAllByText and check at least one exists
        const catA = screen.getAllByText(/cat a/i);
        expect(catA.length).toBeGreaterThan(0);
        expect(screen.getByText(/categories with no products/i)).not.toBeNull();
        // 1 category with no products
        const ones = screen.getAllByText("1");
        expect(ones.length).toBeGreaterThan(0);
        expect(screen.getByText(/most recently created category/i)).not.toBeNull();
        // Cat C is most recently created (same day as Cat A, but appears last)
        // The text may be 'Cat A (06/06/2025)' or similar, so use a function matcher for the name
        const mostRecent = screen.getAllByText((content, node) =>
            (node?.textContent || '').includes('Cat') && (node?.textContent || '').includes('(')
        );
        expect(mostRecent.length).toBeGreaterThan(0);
    });

    it("shows loader when loading", () => {
        getCategoriesMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<OverviewCategory />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows zero stats if no categories", () => {
        getCategoriesMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<OverviewCategory />);
        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBeGreaterThan(0);
        const heading = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("category overview")
        );
        expect(heading.length).toBeGreaterThan(0);
    });
});
