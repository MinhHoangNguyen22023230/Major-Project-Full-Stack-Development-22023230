import { render, screen } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        crud: {
            getUsers: { useQuery: vi.fn() },
            getOrders: { useQuery: vi.fn() },
        },
    },
}));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));

import OverviewSaaS from "./OverviewSaaS";

const now = new Date();
const mockUsers = [
    { id: "1", username: "user1", createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: "2", username: "user2", createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: now.toISOString() },
    { id: "3", username: "user3", createdAt: now.toISOString(), updatedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString() },
];
const mockOrders = [
    { id: "o1", totalPrice: 100, createdAt: now.toISOString() },
    { id: "o2", totalPrice: 200, createdAt: now.toISOString() },
    { id: "o3", totalPrice: 50, createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString() },
];

describe("OverviewSaaS", () => {
    let getUsersMock: ReturnType<typeof vi.fn>;
    let getOrdersMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getUsersMock = vi.fn().mockReturnValue({ data: mockUsers, isLoading: false });
        getOrdersMock = vi.fn().mockReturnValue({ data: mockOrders, isLoading: false });
        (trpc.crud.getUsers.useQuery as unknown as { mockImplementation: (fn: typeof getUsersMock) => void }).mockImplementation(getUsersMock);
        (trpc.crud.getOrders.useQuery as unknown as { mockImplementation: (fn: typeof getOrdersMock) => void }).mockImplementation(getOrdersMock);
    });

    it("renders all SaaS stats correctly", () => {
        render(<OverviewSaaS />);
        expect(screen.getByText(/saas overview/i)).not.toBeNull();
        expect(screen.getByText(/total users/i)).not.toBeNull();
        // There may be multiple elements with text "3", so use getAllByText and check at least one exists
        const threes = screen.getAllByText("3");
        expect(threes.length).toBeGreaterThan(0);
        expect(screen.getByText(/active users/i)).not.toBeNull();
        expect(screen.getByText(/new users/i)).not.toBeNull();
        expect(screen.getByText(/churn rate/i)).not.toBeNull();
        expect(screen.getByText(/total revenue/i)).not.toBeNull();
        expect(screen.getByText(/mrr/i)).not.toBeNull();
        expect(screen.getByText(/arpu/i)).not.toBeNull();
        expect(screen.getByText(/orders/i)).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getUsersMock.mockReturnValueOnce({ data: [], isLoading: true });
        getOrdersMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<OverviewSaaS />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows zero stats if no users or orders", () => {
        getUsersMock.mockReturnValueOnce({ data: [], isLoading: false });
        getOrdersMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<OverviewSaaS />);
        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBeGreaterThan(0);
        const heading = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("saas overview")
        );
        expect(heading.length).toBeGreaterThan(0);
    });
});
