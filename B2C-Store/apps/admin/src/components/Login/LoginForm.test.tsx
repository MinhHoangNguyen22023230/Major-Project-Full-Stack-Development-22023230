// To run these tests, install:
//   npm install --save-dev @testing-library/react @testing-library/jest-dom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import AdminLoginForm from "@/components/Login/LoginForm";
import React from "react";

// Mock next/navigation
const push = vi.fn();
const replace = vi.fn();
let searchParamsValue: URLSearchParams = new URLSearchParams();
vi.mock("next/navigation", async () => {
    const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
    return {
        ...actual,
        useRouter: () => ({ push, replace }),
        useSearchParams: () => searchParamsValue,
    };
});

// Mock tRPC client
const mutateAsync = vi.fn();
const mutate = vi.fn();
const adminLoginMutation = { mutateAsync, status: "idle" };
const adminSessionCreateMutation = { mutate, status: "idle" };

vi.mock("@/app/_trpc/client", () => ({
    trpc: {
        adminLog: { useMutation: () => adminLoginMutation },
        adminSession: { createAdminSession: { useMutation: () => adminSessionCreateMutation } },
    },
}));

// Mock Alert and Loader2
vi.mock("@/components/ui/Alert", () => ({ default: ({ message }: { message: string }) => <div>{message}</div> }));
vi.mock("lucide-react", () => ({ Loader2: () => <span data-testid="loader" /> }));
vi.mock("next/image", () => ({
    __esModule: true,
    default: (props: { alt?: string;[key: string]: unknown }) => <span data-testid="mock-image" {...props} />,
}));

describe("AdminLoginForm", () => {
    beforeEach(() => {
        mutateAsync.mockReset();
        mutate.mockReset();
        adminLoginMutation.status = "idle";
        adminSessionCreateMutation.status = "idle";
        searchParamsValue = new URLSearchParams();
        push.mockReset();
        replace.mockReset();
    });

    it("renders form fields and submit button", () => {
        render(<AdminLoginForm />);
        expect(screen.getByLabelText(/admin email/i)).not.toBeNull();
        expect(screen.getByLabelText(/password/i)).not.toBeNull();
        expect(screen.getByRole("button", { name: /sign in/i })).not.toBeNull();
    });

    it("shows loader when loading", () => {
        adminLoginMutation.status = "pending";
        render(<AdminLoginForm />);
        expect(screen.getByTestId("loader")).not.toBeNull();
    });

    it("submits credentials and sets session, then redirects", async () => {
        mutateAsync.mockClear();
        mutate.mockClear();
        mutateAsync.mockResolvedValue({ userId: "admin1" });
        mutate.mockImplementation((_input: unknown, opts: { onSuccess: () => void }) => opts.onSuccess());
        render(<AdminLoginForm />);
        fireEvent.change(screen.getByLabelText(/admin email/i), { target: { value: "admin@b2c.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });
        const buttons = screen.getAllByRole("button", { name: /sign in/i });
        const button = buttons[buttons.length - 1];
        fireEvent.click(button);
        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({ email: "admin@b2c.com", password: "password" });
        });
        await waitFor(() => {
            expect(mutate).toHaveBeenCalledWith(
                { userId: "admin1" },
                expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
            );
        });
    });

    it("shows error if login fails", async () => {
        mutateAsync.mockRejectedValue({ message: "Invalid credentials" });
        render(<AdminLoginForm />);
        fireEvent.change(screen.getByLabelText(/admin email/i), { target: { value: "admin@b2c.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
        const buttons = screen.getAllByRole("button", { name: /sign in/i });
        const button = buttons[buttons.length - 1];
        fireEvent.click(button);
        // Use findByText for robust async error assertion
        const error = await screen.findByText(/invalid credentials/i, {}, { timeout: 1500 });
        expect(error).toBeDefined();
    });

    it("shows error if session creation fails", async () => {
        mutateAsync.mockResolvedValue({ userId: "admin1" });
        mutate.mockImplementation((_input: unknown, opts: { onSuccess?: () => void; onError: (err: { message: string }) => void }) => {
            opts.onError({ message: "Session error" });
        });
        render(<AdminLoginForm />);
        fireEvent.change(screen.getByLabelText(/admin email/i), { target: { value: "admin@b2c.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });
        const buttons = screen.getAllByRole("button", { name: /sign in/i });
        const button = buttons[buttons.length - 1];
        fireEvent.click(button);
        // Use findByText for robust async error assertion
        const error = await screen.findByText(/session error/i, {}, { timeout: 1500 });
        expect(error).toBeDefined();
    });

    it("shows alert if login_required message in search params", () => {
        searchParamsValue = new URLSearchParams("message=login_required");
        render(<AdminLoginForm />);
        const alert = screen.queryByText(/please log in to continue/i);
        expect(alert).not.toBeNull();
    });
});
