import { render, screen } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        crud: {
            getUsers: { useQuery: vi.fn() },
        },
    },
}));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));

import RecentSignup from "./RecentSignUp";

const now = new Date("2025-06-06T12:00:00.000Z");
const mockUsers = [
    { id: "1", username: "user1", email: "user1@email.com", createdAt: now.toISOString() },
    { id: "2", username: "user2", email: "user2@email.com", createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "3", username: "user3", email: "user3@email.com", createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "4", username: "user4", email: "user4@email.com", createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "5", username: "user5", email: "user5@email.com", createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "6", username: "user6", email: "user6@email.com", createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

describe("RecentSignup", () => {
    let getUsersMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getUsersMock = vi.fn().mockReturnValue({ data: mockUsers, isLoading: false });
        (trpc.crud.getUsers.useQuery as unknown as { mockImplementation: (fn: typeof getUsersMock) => void }).mockImplementation(getUsersMock);
    });

    it("renders the recent signups table and shows 5 most recent users", () => {
        render(<RecentSignup />);
        expect(screen.getByText(/recent signups/i)).not.toBeNull();
        // Table headers (may be multiple, so use getAllByText)
        expect(screen.getAllByText(/username/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/email/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/signup date/i).length).toBeGreaterThan(0);
        // Only the 5 most recent users should be shown
        expect(screen.queryByText("user6")).toBeNull();
        ["user1", "user2", "user3", "user4", "user5"].forEach(u => {
            expect(screen.getByText(u)).not.toBeNull();
        });
        // Check that the signup date is formatted
        const dateCell = screen.getByText(new Date(mockUsers[0].createdAt).toLocaleDateString());
        expect(dateCell).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getUsersMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<RecentSignup />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows empty table if no users", () => {
        getUsersMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<RecentSignup />);
        // Table headers should still be present (may be multiple, so use getAllByText)
        expect(screen.getAllByText(/username/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/email/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/signup date/i).length).toBeGreaterThan(0);
        // No user rows
        expect(screen.queryByText("user1")).toBeNull();
    });
});
