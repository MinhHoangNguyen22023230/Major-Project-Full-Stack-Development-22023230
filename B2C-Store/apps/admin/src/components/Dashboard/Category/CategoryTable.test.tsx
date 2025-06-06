import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        useUtils: () => ({ crud: { getCategories: { invalidate: vi.fn() } } }),
        crud: {
            getCategories: { useQuery: vi.fn() },
            deleteCategory: { useMutation: vi.fn() },
        },
        s3: {
            deleteCategoryImage: { useMutation: vi.fn() },
        },
    },
}));
vi.mock("@/components/ui/Alert", () => ({ default: ({ message }: { message: string }) => <div>{message}</div> }));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));
vi.mock("next/link", () => ({ __esModule: true, default: (props: { children: React.ReactNode }) => <a>{props.children}</a> }));
vi.mock("react-icons/md", () => ({ MdOutlineEdit: () => <span>Edit</span>, MdDeleteOutline: () => <span>Delete</span> }));

import CategoryTable from "./CategoryTable";

const mockCategories = [
    { id: "1", name: "Category A", imageUrl: null, description: "Desc A" },
    { id: "2", name: "Category B", imageUrl: null, description: "Desc B" },
];

describe("CategoryTable", () => {
    let getCategoriesMock: ReturnType<typeof vi.fn>;
    let deleteCategoryMock: ReturnType<typeof vi.fn>;
    let deleteCategoryImageMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getCategoriesMock = vi.fn().mockReturnValue({ data: mockCategories, isLoading: false });
        deleteCategoryMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        deleteCategoryImageMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        (trpc.crud.getCategories.useQuery as unknown as { mockImplementation: (fn: typeof getCategoriesMock) => void }).mockImplementation(getCategoriesMock);
        (trpc.crud.deleteCategory.useMutation as unknown as { mockImplementation: (fn: typeof deleteCategoryMock) => void }).mockImplementation(deleteCategoryMock);
        (trpc.s3.deleteCategoryImage.useMutation as unknown as { mockImplementation: (fn: typeof deleteCategoryImageMock) => void }).mockImplementation(deleteCategoryImageMock);
    });

    it("renders table and categories", () => {
        render(<CategoryTable />);
        expect(screen.getByText(/category management/i)).not.toBeNull();
        expect(screen.getByText("Category A")).not.toBeNull();
        expect(screen.getByText("Category B")).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getCategoriesMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<CategoryTable />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows no data message if no categories", () => {
        getCategoriesMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<CategoryTable />);
        expect(screen.getByText(/no category data/i)).not.toBeNull();
    });

    it("shows alert if trying to delete with nothing selected", async () => {
        render(<CategoryTable />);
        const deleteBtns = screen.getAllByTitle(/delete selected category/i);
        fireEvent.click(deleteBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/you have to select at least one category to delete/i)).not.toBeNull();
        });
    });

    it("shows alert if trying to edit with nothing selected", async () => {
        render(<CategoryTable />);
        const editBtns = screen.getAllByTitle(/edit selected category/i);
        fireEvent.click(editBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/please select exactly one category to edit/i)).not.toBeNull();
        });
    });
});
