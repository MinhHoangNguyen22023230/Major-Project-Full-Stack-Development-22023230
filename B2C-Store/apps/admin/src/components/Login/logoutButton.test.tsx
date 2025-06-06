import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { LogoutButton } from "./LogoutButton";

// Mock next/navigation redirect
vi.mock("next/navigation", () => {
    const redirect = vi.fn();
    return {
        redirect,
        __mockRedirect: redirect,
    };
});

// Mock trpc
vi.mock("@/app/_trpc/client", () => {
    const mutateAsync = vi.fn();
    const useMutation = vi.fn(() => ({
        mutateAsync,
        status: "idle",
    }));
    return {
        trpc: {
            adminSession: {
                deleteAdminSession: {
                    useMutation,
                },
            },
        },
        __mock: { mutateAsync, useMutation }
    };
});

describe("LogoutButton", () => {
    let mutateAsync: ReturnType<typeof vi.fn>;
    let useMutation: ReturnType<typeof vi.fn>;
    let redirect: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        // Use 'unknown' cast before type assertion to access mock properties, strictly no 'any'
        const trpcClient = await import("@/app/_trpc/client");
        mutateAsync = (trpcClient as unknown as { __mock: { mutateAsync: ReturnType<typeof vi.fn> } }).__mock.mutateAsync;
        useMutation = (trpcClient as unknown as { __mock: { useMutation: ReturnType<typeof vi.fn> } }).__mock.useMutation;
        const nav = await import("next/navigation");
        redirect = (nav as unknown as { __mockRedirect: ReturnType<typeof vi.fn> }).__mockRedirect;
        mutateAsync.mockClear();
        useMutation.mockImplementation(() => ({
            mutateAsync,
            status: "idle",
        }));
        redirect.mockClear();
    });

    it("renders with default text", () => {
        render(<LogoutButton />);
        const button = screen.getAllByRole("button").find(
            (btn): btn is HTMLButtonElement => btn.textContent === "Logout"
        );
        if (!button) throw new Error("Button not found");
        expect(button.textContent).toBe("Logout");
    });

    it("renders with custom children", () => {
        render(<LogoutButton>Sign out</LogoutButton>);
        const button = screen.getAllByRole("button").find(
            (btn): btn is HTMLButtonElement => btn.textContent === "Sign out"
        );
        if (!button) throw new Error("Button not found");
        expect(button.textContent).toBe("Sign out");
    });

    it("calls mutateAsync and redirect on click", async () => {
        render(<LogoutButton />);
        const button = screen.getAllByRole("button").at(-1);
        if (!button) throw new Error("Button not found");
        mutateAsync.mockResolvedValueOnce(undefined);
        await fireEvent.click(button);
        expect(mutateAsync).toHaveBeenCalled();
        expect(redirect).toHaveBeenCalledWith("/");
    });

    it("shows loading indicator and disables button when pending", () => {
        useMutation.mockImplementation(() => ({
            mutateAsync,
            status: "pending",
        }));
        render(<LogoutButton />);
        const button = screen.getAllByRole("button").find(
            (btn): btn is HTMLButtonElement => btn instanceof HTMLButtonElement && btn.disabled
        );
        if (!button) throw new Error("Disabled button not found");
        expect(button.disabled).toBe(true);
        expect(button.querySelector("svg")).not.toBeUndefined();
    });
});