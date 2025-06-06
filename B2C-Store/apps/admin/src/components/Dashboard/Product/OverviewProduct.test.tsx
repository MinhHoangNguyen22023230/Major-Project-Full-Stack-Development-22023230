import { render, screen } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        crud: {
            getProducts: { useQuery: vi.fn() },
        },
    },
}));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));

import OverviewProduct from "./OverviewProduct";

const now = new Date();
const mockProducts = [
    { id: "1", name: "Product A", price: 100, rating: 4, stock: 10, createdAt: now.toISOString() },
    { id: "2", name: "Product B", price: 200, rating: 5, stock: 0, createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "3", name: "Product C", price: 50, rating: 3, stock: 5, createdAt: now.toISOString() },
];

describe("OverviewProduct", () => {
    let getProductsMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getProductsMock = vi.fn().mockReturnValue({ data: mockProducts, isLoading: false });
        (trpc.crud.getProducts.useQuery as unknown as { mockImplementation: (fn: typeof getProductsMock) => void }).mockImplementation(getProductsMock);
    });

    it("renders all product stats correctly", () => {
        render(<OverviewProduct />);
        expect(screen.getByText(/product overview/i)).not.toBeNull();
        expect(screen.getByText(/total products/i)).not.toBeNull();
        expect(screen.getByText("3")).not.toBeNull();
        expect(screen.getByText(/new products/i)).not.toBeNull();
        // Only 2 products created in last 30d
        const twos = screen.getAllByText("2");
        expect(twos.length).toBeGreaterThan(0);
        expect(screen.getByText(/in stock/i)).not.toBeNull();
        // 2 products in stock
        const inStock = screen.getAllByText("2");
        expect(inStock.length).toBeGreaterThan(0);
        expect(screen.getByText(/out of stock/i)).not.toBeNull();
        // 1 product out of stock
        const outOfStock = screen.getAllByText("1");
        expect(outOfStock.length).toBeGreaterThan(0);
        expect(screen.getByText(/avg. price/i)).not.toBeNull();
        // Avg price is (100+200+50)/3 = 116.67
        expect(screen.getByText("$116.67")).not.toBeNull();
        expect(screen.getByText(/avg. rating/i)).not.toBeNull();
        // Avg rating is (4+5+3)/3 = 4
        expect(screen.getByText("4")).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getProductsMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<OverviewProduct />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows zero stats if no products", () => {
        getProductsMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<OverviewProduct />);
        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBeGreaterThan(0);
        const heading = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("product overview")
        );
        expect(heading.length).toBeGreaterThan(0);
    });
});
