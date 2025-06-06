import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { trpc } from "@/app/_trpc/client";

// Mock dependencies
vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        useUtils: () => ({ crud: { getProducts: { invalidate: vi.fn() } } }),
        crud: {
            getProducts: { useQuery: vi.fn() },
            getBrands: { useQuery: vi.fn() },
            getCategories: { useQuery: vi.fn() },
            deleteProduct: { useMutation: vi.fn() },
        },
        s3: {
            deleteProductImage: { useMutation: vi.fn() },
        },
    },
}));
vi.mock("@/components/ui/Alert", () => ({ default: ({ message }: { message: string }) => <div>{message}</div> }));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));
vi.mock("next/link", () => ({ __esModule: true, default: (props: { children: React.ReactNode }) => <a>{props.children}</a> }));
vi.mock("react-icons/md", () => ({ MdOutlineEdit: () => <span>Edit</span>, MdDeleteOutline: () => <span>Delete</span> }));

import ProductTable from "./ProductTable";

const mockProducts = [
    { id: "1", name: "Product A", price: 10, imageUrl: null, description: "Desc A" },
    { id: "2", name: "Product B", price: 20, imageUrl: null, description: "Desc B" },
];
const mockBrands = [
    { id: "b1", name: "Brand X" },
    { id: "b2", name: "Brand Y" },
];
const mockCategories = [
    { id: "c1", name: "Cat X" },
    { id: "c2", name: "Cat Y" },
];

describe("ProductTable", () => {
    let getProductsMock: ReturnType<typeof vi.fn>;
    let getBrandsMock: ReturnType<typeof vi.fn>;
    let getCategoriesMock: ReturnType<typeof vi.fn>;
    let deleteProductMock: ReturnType<typeof vi.fn>;
    let deleteProductImageMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        getProductsMock = vi.fn().mockReturnValue({ data: mockProducts, isLoading: false });
        getBrandsMock = vi.fn().mockReturnValue({ data: mockBrands });
        getCategoriesMock = vi.fn().mockReturnValue({ data: mockCategories });
        deleteProductMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        deleteProductImageMock = vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
        (trpc.crud.getProducts.useQuery as unknown as { mockImplementation: (fn: typeof getProductsMock) => void }).mockImplementation(getProductsMock);
        (trpc.crud.getBrands.useQuery as unknown as { mockImplementation: (fn: typeof getBrandsMock) => void }).mockImplementation(getBrandsMock);
        (trpc.crud.getCategories.useQuery as unknown as { mockImplementation: (fn: typeof getCategoriesMock) => void }).mockImplementation(getCategoriesMock);
        (trpc.crud.deleteProduct.useMutation as unknown as { mockImplementation: (fn: typeof deleteProductMock) => void }).mockImplementation(deleteProductMock);
        (trpc.s3.deleteProductImage.useMutation as unknown as { mockImplementation: (fn: typeof deleteProductImageMock) => void }).mockImplementation(deleteProductImageMock);
    });

    it("renders table and products", () => {
        render(<ProductTable />);
        // Use a function matcher to avoid multiple elements error and match the heading robustly
        const heading = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("product management")
        );
        expect(heading.length).toBeGreaterThan(0);
        expect(screen.getByText("Product A")).not.toBeNull();
        expect(screen.getByText("Product B")).not.toBeNull();
    });

    it("shows loader when loading", () => {
        getProductsMock.mockReturnValueOnce({ data: [], isLoading: true });
        render(<ProductTable />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("shows no data message if no products", () => {
        getProductsMock.mockReturnValueOnce({ data: [], isLoading: false });
        render(<ProductTable />);
        expect(screen.getByText(/no product data|no data/i)).not.toBeNull();
    });

    it("shows alert if trying to delete with nothing selected", async () => {
        render(<ProductTable />);
        const deleteBtns = screen.getAllByTitle(/delete selected product/i);
        fireEvent.click(deleteBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/you have to select at least one product to delete/i)).not.toBeNull();
        });
    });

    it("shows alert if trying to edit with nothing selected", async () => {
        render(<ProductTable />);
        const editBtns = screen.getAllByTitle(/edit selected product/i);
        fireEvent.click(editBtns[0]);
        await waitFor(() => {
            expect(screen.getByText(/please select exactly one product to edit/i)).not.toBeNull();
        });
    });
});
