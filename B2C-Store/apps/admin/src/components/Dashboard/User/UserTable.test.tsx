import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        useUtils: () => ({ crud: { getUsers: { invalidate: vi.fn() } } }),
        crud: {
            getUsers: { useQuery: vi.fn() },
            deleteUser: { useMutation: vi.fn() },
            getAddresses: { useQuery: vi.fn() },
            getWishLists: { useQuery: vi.fn() },
            getWishListItems: { useQuery: vi.fn() },
            getCarts: { useQuery: vi.fn() },
            getCartItems: { useQuery: vi.fn() },
            getReviews: { useQuery: vi.fn() },
        },
        s3: {
            deleteUserImage: { useMutation: vi.fn() },
        },
    },
}));
vi.mock("@/components/ui/Alert", () => ({ default: ({ message }: { message: string }) => <div>{message}</div> }));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));
vi.mock("next/link", () => ({ __esModule: true, default: (props: { children: React.ReactNode }) => <a>{props.children}</a> }));
vi.mock("react-icons/md", () => ({ MdOutlineEdit: () => <span>Edit</span>, MdDeleteOutline: () => <span>Delete</span> }));

import UserTable from "./UserTable";

const mockUsers = [
    { id: "1", username: "user1", email: "user1@email.com" },
    { id: "2", username: "user2", email: "user2@email.com" },
];

// Explicitly type all mock arrays to avoid implicit any[] errors
const mockAddresses: Array<unknown> = [];
const mockWishLists: Array<unknown> = [];
const mockWishListItems: Array<unknown> = [];
const mockCarts: Array<unknown> = [];
const mockCartItems: Array<unknown> = [];
const mockReviews: Array<unknown> = [];

describe("UserTable", () => {
    let getUsersMock: ReturnType<typeof vi.fn>;
    let deleteUserMock: ReturnType<typeof vi.fn>;
    let deleteUserImageMock: ReturnType<typeof vi.fn>;
    let getAddressesMock: ReturnType<typeof vi.fn>;
    let getWishListsMock: ReturnType<typeof vi.fn>;
    let getWishListItemsMock: ReturnType<typeof vi.fn>;
    let getCartsMock: ReturnType<typeof vi.fn>;
    let getCartItemsMock: ReturnType<typeof vi.fn>;
    let getReviewsMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getUsersMock = vi.fn().mockReturnValue({ data: mockUsers, isLoading: false });
        deleteUserMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        deleteUserImageMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        getAddressesMock = vi.fn().mockReturnValue({ data: mockAddresses });
        getWishListsMock = vi.fn().mockReturnValue({ data: mockWishLists });
        getWishListItemsMock = vi.fn().mockReturnValue({ data: mockWishListItems });
        getCartsMock = vi.fn().mockReturnValue({ data: mockCarts });
        getCartItemsMock = vi.fn().mockReturnValue({ data: mockCartItems });
        getReviewsMock = vi.fn().mockReturnValue({ data: mockReviews });
        (trpc.crud.getUsers.useQuery as unknown as { mockImplementation: (fn: typeof getUsersMock) => void }).mockImplementation(getUsersMock);
        (trpc.crud.deleteUser.useMutation as unknown as { mockImplementation: (fn: typeof deleteUserMock) => void }).mockImplementation(deleteUserMock);
        (trpc.s3.deleteUserImage.useMutation as unknown as { mockImplementation: (fn: typeof deleteUserImageMock) => void }).mockImplementation(deleteUserImageMock);
        (trpc.crud.getAddresses.useQuery as unknown as { mockImplementation: (fn: typeof getAddressesMock) => void }).mockImplementation(getAddressesMock);
        (trpc.crud.getWishLists.useQuery as unknown as { mockImplementation: (fn: typeof getWishListsMock) => void }).mockImplementation(getWishListsMock);
        (trpc.crud.getWishListItems.useQuery as unknown as { mockImplementation: (fn: typeof getWishListItemsMock) => void }).mockImplementation(getWishListItemsMock);
        (trpc.crud.getCarts.useQuery as unknown as { mockImplementation: (fn: typeof getCartsMock) => void }).mockImplementation(getCartsMock);
        (trpc.crud.getCartItems.useQuery as unknown as { mockImplementation: (fn: typeof getCartItemsMock) => void }).mockImplementation(getCartItemsMock);
        (trpc.crud.getReviews.useQuery as unknown as { mockImplementation: (fn: typeof getReviewsMock) => void }).mockImplementation(getReviewsMock);
    });

    it("renders table and users", () => {
        render(<UserTable />);
        const heading = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("user management")
        );
        expect(heading.length).toBeGreaterThan(0);
        expect(screen.getByText("user1")).not.toBeNull();
        expect(screen.getByText("user2")).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getUsersMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<UserTable />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows no data message if no users", () => {
        getUsersMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<UserTable />);
        expect(screen.getByText(/no user data|no data/i)).not.toBeNull();
    });

    it("shows alert if trying to delete with nothing selected", async () => {
        render(<UserTable />);
        const deleteBtns = screen.getAllByTitle(/delete selected user/i);
        fireEvent.click(deleteBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/you have to select at least one user to delete/i)).not.toBeNull();
        });
    });

    it("shows alert if trying to edit with nothing selected", async () => {
        render(<UserTable />);
        const editBtns = screen.getAllByTitle(/edit selected user/i);
        fireEvent.click(editBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/please select exactly one user to edit/i)).not.toBeNull();
        });
    });
});
