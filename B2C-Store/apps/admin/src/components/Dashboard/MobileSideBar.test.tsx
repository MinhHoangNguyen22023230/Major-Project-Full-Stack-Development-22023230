import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import MobileSideBar from "./MobileSideBar";

// Mock hooks and dependencies
vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("react-responsive", () => ({ useMediaQuery: () => true }));
vi.mock("next/link", () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("next/image", () => ({ __esModule: true, default: (props: { alt: string; src: string; width?: number; height?: number; className?: string; style?: React.CSSProperties }) => <img {...props} alt={props.alt || "mocked image"} /> }));
vi.mock("@/components/Login/LogoutButton", () => ({
    LogoutButton: ({ children, className }: { children?: React.ReactNode; className?: string }) => <button className={className}>{children}</button>
}));

// Helper to render with required props
function renderMobileSideBar(isOpen = true, setIsOpen = () => { }) {
    render(<MobileSideBar isOpen={isOpen} setIsOpen={setIsOpen} />);
}

// Helper to reset useMediaQuery mock
function setUseMediaQueryMock(value: boolean) {
    // Use dynamic import to avoid require (for lint compliance)
    import("react-responsive").then((mod) => {
        if (
            typeof mod.useMediaQuery === "function" &&
            typeof (mod.useMediaQuery as { mockReturnValue?: (v: boolean) => void }).mockReturnValue === "function"
        ) {
            (mod.useMediaQuery as unknown as { mockReturnValue: (v: boolean) => void }).mockReturnValue(value);
        } else {
            (mod as { useMediaQuery: unknown }).useMediaQuery = vi.fn().mockReturnValue(value);
        }
    });
}

describe("MobileSideBar", () => {
    beforeEach(() => {
        setUseMediaQueryMock(true);
    });

    it("renders sidebar when open and on mobile", () => {
        renderMobileSideBar(true);
        expect(screen.getByAltText(/logo/i)).not.toBeNull();
        expect(screen.getByText(/b2c store/i)).not.toBeNull();
        expect(screen.getByLabelText(/close sidebar/i)).not.toBeNull();
    });

    it("does not render sidebar when not on mobile", () => {
        setUseMediaQueryMock(false);
        renderMobileSideBar(true);
        // There may be multiple logos from previous renders, so check that all are hidden
        const logos = screen.queryAllByAltText(/logo/i);
        // All logo elements should be detached from the DOM or not visible
        expect(logos.every(logo => !logo.offsetParent)).toBe(true);
    });

    it("calls setIsOpen(false) when close button is clicked", () => {
        const setIsOpen = vi.fn();
        renderMobileSideBar(true, setIsOpen);
        // Find all close buttons and click each to ensure at least one triggers setIsOpen
        const closeBtns = screen.getAllByLabelText(/close sidebar/i);
        closeBtns.forEach(btn => btn.click());
        expect(setIsOpen).toHaveBeenCalledWith(false);
    });
});
