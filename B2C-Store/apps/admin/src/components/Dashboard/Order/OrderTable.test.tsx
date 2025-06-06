import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        useUtils: () => ({ crud: { getOrders: { invalidate: vi.fn() } } }),
        crud: {
            getOrders: { useQuery: vi.fn() },
            deleteOrder: { useMutation: vi.fn() },
        },
    },
}));
vi.mock("@/components/ui/Alert", () => ({ default: ({ message }: { message: string }) => <div>{message}</div> }));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));
vi.mock("next/link", () => ({ __esModule: true, default: (props: { children: React.ReactNode }) => <a>{props.children}</a> }));
vi.mock("react-icons/md", () => ({ MdOutlineEdit: () => <span>Edit</span>, MdDeleteOutline: () => <span>Delete</span> }));
vi.mock("@/components/ui/Table/Table", () => ({
    Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
    TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
    TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
    TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
    TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
}));

import OrderTable from "./OrderTable";

const mockOrders = [
    { id: "1", user: { username: "user1", email: "user1@email.com" }, items: [], createdAt: "2024-01-01T00:00:00Z" },
    { id: "2", user: { username: "user2", email: "user2@email.com" }, items: [], createdAt: "2024-01-02T00:00:00Z" },
];

describe("OrderTable", () => {
    let getOrdersMock: ReturnType<typeof vi.fn>;
    let deleteOrderMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getOrdersMock = vi.fn().mockReturnValue({ data: mockOrders, isLoading: false });
        deleteOrderMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        (trpc.crud.getOrders.useQuery as unknown as { mockImplementation: (fn: typeof getOrdersMock) => void }).mockImplementation(getOrdersMock);
        (trpc.crud.deleteOrder.useMutation as unknown as { mockImplementation: (fn: typeof deleteOrderMock) => void }).mockImplementation(deleteOrderMock);
    });

    it("renders table and orders", () => {
        render(<OrderTable />);
        expect(screen.getByText(/order management/i)).not.toBeNull();
        expect(screen.getByText("user1")).not.toBeNull();
        expect(screen.getByText("user2")).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getOrdersMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<OrderTable />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows no data message if no orders", () => {
        getOrdersMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<OrderTable />);
        expect(screen.getByText(/no order data/i)).not.toBeNull();
    });

    it("shows alert if trying to delete with nothing selected", async () => {
        render(<OrderTable />);
        const deleteBtns = screen.getAllByTitle(/delete selected order/i);
        fireEvent.click(deleteBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/you have to select at least one order to delete/i)).not.toBeNull();
        });
    });

    it("shows alert if trying to edit with nothing selected", async () => {
        render(<OrderTable />);
        const editBtns = screen.getAllByTitle(/edit selected order/i);
        fireEvent.click(editBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/please select exactly one order to edit/i)).not.toBeNull();
        });
    });
});
