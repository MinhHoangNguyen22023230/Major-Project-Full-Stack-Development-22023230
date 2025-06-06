import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        useUtils: () => ({ crud: { getBrands: { invalidate: vi.fn() } } }),
        crud: {
            getBrands: { useQuery: vi.fn() },
            deleteBrand: { useMutation: vi.fn() },
        },
        s3: {
            deleteBrandImage: { useMutation: vi.fn() },
        },
    },
}));
vi.mock("@/components/ui/Alert", () => ({ default: ({ message }: { message: string }) => <div>{message}</div> }));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));
vi.mock("next/link", () => ({ __esModule: true, default: (props: { children: React.ReactNode }) => <a>{props.children}</a> }));
vi.mock("react-icons/md", () => ({ MdOutlineEdit: () => <span>Edit</span>, MdDeleteOutline: () => <span>Delete</span> }));
vi.mock("@/components/ui/Table", () => ({ Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>, TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>, TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>, TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody> }));

import BrandTable from "./BrandTable";

const mockBrands = [
    { id: "1", name: "Brand A", imageUrl: null, description: "Desc A" },
    { id: "2", name: "Brand B", imageUrl: null, description: "Desc B" },
];

describe("BrandTable", () => {
    let getBrandsMock: ReturnType<typeof vi.fn>;
    let deleteBrandMock: ReturnType<typeof vi.fn>;
    let deleteBrandImageMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getBrandsMock = vi.fn().mockReturnValue({ data: mockBrands, isLoading: false });
        deleteBrandMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        deleteBrandImageMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        // Patch the trpc mocks using Vitest's vi.fn() type (no 'any', no 'jest.Mock')
        (trpc.crud.getBrands.useQuery as unknown as { mockImplementation: (fn: typeof getBrandsMock) => void }).mockImplementation(getBrandsMock);
        (trpc.crud.deleteBrand.useMutation as unknown as { mockImplementation: (fn: typeof deleteBrandMock) => void }).mockImplementation(deleteBrandMock);
        (trpc.s3.deleteBrandImage.useMutation as unknown as { mockImplementation: (fn: typeof deleteBrandImageMock) => void }).mockImplementation(deleteBrandImageMock);
    });

    it("renders table and brands", () => {
        render(<BrandTable />);
        expect(screen.getByText(/brand management/i)).not.toBeNull();
        expect(screen.getByText("Brand A")).not.toBeNull();
        expect(screen.getByText("Brand B")).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getBrandsMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<BrandTable />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows no data message if no brands", () => {
        getBrandsMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<BrandTable />);
        expect(screen.getByText(/no brand data/i)).not.toBeNull();
    });

    it("shows alert if trying to delete with nothing selected", async () => {
        render(<BrandTable />);
        const deleteBtns = screen.getAllByTitle(/delete selected brand/i);
        // Click the first visible delete button (toolbar)
        fireEvent.click(deleteBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/you have to select at least one brand to delete/i)).not.toBeNull();
        });
    });

    it("shows alert if trying to edit with nothing selected", async () => {
        render(<BrandTable />);
        const editBtns = screen.getAllByTitle(/edit selected brand/i);
        // Click the first visible edit button (toolbar)
        fireEvent.click(editBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/please select exactly one brand to edit/i)).not.toBeNull();
        });
    });
});