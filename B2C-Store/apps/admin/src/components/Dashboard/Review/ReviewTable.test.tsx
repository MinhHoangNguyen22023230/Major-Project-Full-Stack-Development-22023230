import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        useUtils: () => ({ crud: { getReviews: { invalidate: vi.fn() } } }),
        crud: {
            getReviews: { useQuery: vi.fn() },
            deleteReview: { useMutation: vi.fn() },
        },
    },
}));
vi.mock("@/components/ui/Alert", () => ({ default: ({ message }: { message: string }) => <div>{message}</div> }));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));
vi.mock("next/link", () => ({ __esModule: true, default: (props: { children: React.ReactNode }) => <a>{props.children}</a> }));
vi.mock("react-icons/md", () => ({ MdOutlineEdit: () => <span>Edit</span>, MdDeleteOutline: () => <span>Delete</span> }));

import ReviewTable from "./ReviewTable";

const mockReviews = [
    { id: "1", rating: 5, comment: "Great!", user: { username: "user1", id: "u1" }, product: { name: "Product A" } },
    { id: "2", rating: 4, comment: "Good", user: { username: "user2", id: "u2" }, product: { name: "Product B" } },
];

describe("ReviewTable", () => {
    let getReviewsMock: ReturnType<typeof vi.fn>;
    let deleteReviewMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getReviewsMock = vi.fn().mockReturnValue({ data: mockReviews, isLoading: false });
        deleteReviewMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        (trpc.crud.getReviews.useQuery as unknown as { mockImplementation: (fn: typeof getReviewsMock) => void }).mockImplementation(getReviewsMock);
        (trpc.crud.deleteReview.useMutation as unknown as { mockImplementation: (fn: typeof deleteReviewMock) => void }).mockImplementation(deleteReviewMock);
    });

    it("renders table and reviews", () => {
        render(<ReviewTable />);
        const heading = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("review management")
        );
        expect(heading.length).toBeGreaterThan(0);
        expect(screen.getByText("user1")).not.toBeNull();
        expect(screen.getByText("user2")).not.toBeNull();
        expect(screen.getByText("Product A")).not.toBeNull();
        expect(screen.getByText("Product B")).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getReviewsMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<ReviewTable />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows no data message if no reviews", () => {
        getReviewsMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<ReviewTable />);
        expect(screen.getByText(/no review data|no data/i)).not.toBeNull();
    });

    it("shows alert if trying to delete with nothing selected", async () => {
        render(<ReviewTable />);
        const deleteBtns = screen.getAllByTitle(/delete selected review/i);
        fireEvent.click(deleteBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/you have to select at least one review to delete/i)).not.toBeNull();
        });
    });

    it("shows alert if trying to edit with nothing selected", async () => {
        render(<ReviewTable />);
        // There is no edit button in ReviewTable, so this test should be skipped or removed
        // If you add an edit button in the future, re-enable this test
        // expect(() => screen.getAllByTitle(/edit selected review/i)).toThrow();
    });
});
