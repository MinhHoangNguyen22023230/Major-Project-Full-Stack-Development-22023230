// To run these tests, install:
//   npm install --save-dev @testing-library/react @testing-library/jest-dom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import AdminLoginForm from "../components/Login/LoginForm";
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
        expect(screen.getByLabelText(/admin email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("shows loader when loading", () => {
        adminLoginMutation.status = "pending";
        render(<AdminLoginForm />);
        expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("submits credentials and sets session, then redirects", async () => {
        mutateAsync.mockResolvedValue({ userId: "admin1" });
        mutate.mockImplementation((_input: unknown, opts: { onSuccess: () => void }) => opts.onSuccess());
        render(<AdminLoginForm />);
        fireEvent.change(screen.getByLabelText(/admin email/i), { target: { value: "admin@b2c.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({ email: "admin@b2c.com", password: "password" });
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
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });

    it("shows error if session creation fails", async () => {
        mutateAsync.mockResolvedValue({ userId: "admin1" });
        mutate.mockImplementation((_input: unknown, opts: { onSuccess?: () => void; onError: (err: { message: string }) => void }) => opts.onError({ message: "Session error" }));
        render(<AdminLoginForm />);
        fireEvent.change(screen.getByLabelText(/admin email/i), { target: { value: "admin@b2c.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
        await waitFor(() => {
            expect(screen.getByText(/session error/i)).toBeInTheDocument();
        });
    });

    it("shows alert if login_required message in search params", () => {
        searchParamsValue = new URLSearchParams("message=login_required");
        render(<AdminLoginForm />);
        expect(screen.getByText(/please log in to continue/i)).toBeInTheDocument();
    });
});
