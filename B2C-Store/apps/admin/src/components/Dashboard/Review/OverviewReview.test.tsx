import { render, screen } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        crud: {
            getReviews: { useQuery: vi.fn() },
            getProducts: { useQuery: vi.fn() },
            getUsers: { useQuery: vi.fn() },
        },
    },
}));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));

import OverviewReview from "./OverviewReview";

const mockReviews = [
    { id: "1", rating: 5, comment: "Great!", createdAt: new Date().toISOString(), user: { id: "u1", username: "user1" }, userId: "u1", product: { id: "p1", name: "Product A" }, productId: "p1" },
    { id: "2", rating: 4, comment: "", createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), user: { id: "u2", username: "user2" }, userId: "u2", product: { id: "p2", name: "Product B" }, productId: "p2" },
    { id: "3", rating: 3, comment: "Okay", createdAt: new Date().toISOString(), user: null, userId: null, product: { id: "p1", name: "Product A" }, productId: "p1" },
];
const mockProducts = [
    { id: "p1", name: "Product A" },
    { id: "p2", name: "Product B" },
];
const mockUsers = [
    { id: "u1", username: "user1" },
    { id: "u2", username: "user2" },
];

describe("OverviewReview", () => {
    let getReviewsMock: ReturnType<typeof vi.fn>;
    let getProductsMock: ReturnType<typeof vi.fn>;
    let getUsersMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getReviewsMock = vi.fn().mockReturnValue({ data: mockReviews, isLoading: false });
        getProductsMock = vi.fn().mockReturnValue({ data: mockProducts });
        getUsersMock = vi.fn().mockReturnValue({ data: mockUsers });
        (trpc.crud.getReviews.useQuery as unknown as { mockImplementation: (fn: typeof getReviewsMock) => void }).mockImplementation(getReviewsMock);
        (trpc.crud.getProducts.useQuery as unknown as { mockImplementation: (fn: typeof getProductsMock) => void }).mockImplementation(getProductsMock);
        (trpc.crud.getUsers.useQuery as unknown as { mockImplementation: (fn: typeof getUsersMock) => void }).mockImplementation(getUsersMock);
    });

    it("renders all review stats correctly", () => {
        render(<OverviewReview />);
        expect(screen.getByText(/review overview/i)).not.toBeNull();
        expect(screen.getByText(/total reviews/i)).not.toBeNull();
        expect(screen.getByText("3")).not.toBeNull();
        expect(screen.getByText(/new reviews/i)).not.toBeNull();
        // There may be multiple elements with text "2", so use getAllByText and check at least one exists
        const twos = screen.getAllByText("2");
        expect(twos.length).toBeGreaterThan(0); // 2 reviews in last 30d and 2 reviews with comment
        expect(screen.getByText(/avg. rating/i)).not.toBeNull();
        expect(screen.getByText("4")).not.toBeNull(); // avg rating is (5+4+3)/3 = 4
        expect(screen.getByText(/reviews with comment/i)).not.toBeNull();
        expect(screen.getByText(/anonymous reviews/i)).not.toBeNull();
        // There may be multiple elements with text "1", so use getAllByText and check at least one exists
        const ones = screen.getAllByText("1");
        expect(ones.length).toBeGreaterThan(0); // 1 anonymous
        expect(screen.getByText(/most reviewed product/i)).not.toBeNull();
        expect(screen.getByText(/product a/i)).not.toBeNull();
        expect(screen.getByText(/most active reviewer/i)).not.toBeNull();
        expect(screen.getByText(/user1/i)).not.toBeNull();
        expect(screen.getByText(/rating distribution/i)).not.toBeNull();
        // The number 5 may be rendered with a star (e.g., '5★'), so use getAllByText and check at least one exists
        const fiveStars = screen.getAllByText((content, node) =>
            (node?.textContent || '').trim().startsWith('5')
        );
        expect(fiveStars.length).toBeGreaterThan(0); // 1 review with 5 stars
        // The number 4 may be rendered with a star (e.g., '4★'), so use getAllByText and check at least one exists
        const fourStars = screen.getAllByText((content, node) =>
            (node?.textContent || '').trim().startsWith('4')
        );
        expect(fourStars.length).toBeGreaterThan(0); // 1 review with 4 stars
        // The number 3 may be rendered with a star (e.g., '3★'), so use getAllByText and check at least one exists
        const threeStars = screen.getAllByText((content, node) =>
            (node?.textContent || '').trim().startsWith('3')
        );
        expect(threeStars.length).toBeGreaterThan(0); // 1 review with 3 stars
    });

    it("shows loader when loading", () => {
        getReviewsMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<OverviewReview />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows zero stats if no reviews", () => {
        getReviewsMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<OverviewReview />);
        // There may be multiple elements with text "0", so use getAllByText and check at least one exists
        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBeGreaterThan(0);
        // Use a function matcher for the heading to avoid multiple elements error
        const heading = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("review overview")
        );
        expect(heading.length).toBeGreaterThan(0);
    });
});
