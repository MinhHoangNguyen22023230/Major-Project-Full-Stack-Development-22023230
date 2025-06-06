import { render, screen } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        crud: {
            getOrders: { useQuery: vi.fn() },
        },
    },
}));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));

import OverviewOrder from "./OverviewOrder";

const now = new Date();
const mockOrders = [
    { id: "1", status: "COMPLETED", totalPrice: 100, createdAt: now.toISOString() },
    { id: "2", status: "PENDING", totalPrice: 200, createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "3", status: "DELIVERED", totalPrice: 50, createdAt: now.toISOString() },
    { id: "4", status: "PROCESSING", totalPrice: 150, createdAt: now.toISOString() },
];

describe("OverviewOrder", () => {
    let getOrdersMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getOrdersMock = vi.fn().mockReturnValue({ data: mockOrders, isLoading: false });
        (trpc.crud.getOrders.useQuery as unknown as { mockImplementation: (fn: typeof getOrdersMock) => void }).mockImplementation(getOrdersMock);
    });

    it("renders all order stats correctly", () => {
        render(<OverviewOrder />);
        expect(screen.getByText(/order overview/i)).not.toBeNull();
        expect(screen.getByText(/total orders/i)).not.toBeNull();
        expect(screen.getByText("4")).not.toBeNull(); // total orders
        expect(screen.getByText(/new orders/i)).not.toBeNull();
        // Only 3 orders created in last 30d
        const threes = screen.getAllByText("3");
        expect(threes.length).toBeGreaterThan(0);
        expect(screen.getByText(/completed orders/i)).not.toBeNull();
        // 2 completed (COMPLETED, DELIVERED)
        const twos = screen.getAllByText("2");
        expect(twos.length).toBeGreaterThan(0);
        expect(screen.getByText(/pending orders/i)).not.toBeNull();
        // 2 pending (PENDING, PROCESSING)
        expect(twos.length).toBeGreaterThan(0);
        expect(screen.getByText(/total revenue/i)).not.toBeNull();
        // Total revenue is 100+200+50+150 = 500
        expect(screen.getByText("$500")).not.toBeNull();
        expect(screen.getByText(/avg. order value/i)).not.toBeNull();
        // Avg order value is 500/4 = 125
        expect(screen.getByText("$125")).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getOrdersMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<OverviewOrder />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows zero stats if no orders", () => {
        getOrdersMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<OverviewOrder />);
        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBeGreaterThan(0);
        const heading = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("order overview")
        );
        expect(heading.length).toBeGreaterThan(0);
    });
});
