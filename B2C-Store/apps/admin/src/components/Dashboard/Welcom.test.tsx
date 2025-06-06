import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Welcome from "./Welcome";
import React from "react";

describe("Welcome", () => {
    it("renders the welcome title", () => {
        render(<Welcome />);
        expect(screen.getByText(/welcome to the b2c store admin dashboard/i)).not.toBeNull();
    });

    it("renders the description paragraph", () => {
        render(<Welcome />);
        const desc = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("this is your central hub for managing users, orders, products, and more")
        );
        expect(desc.length).toBeGreaterThan(0);
    });

    it("renders all key feature list items", () => {
        render(<Welcome />);
        const users = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("view and manage users")
        );
        expect(users.length).toBeGreaterThan(0);
        const orders = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("manage orders")
        );
        expect(orders.length).toBeGreaterThan(0);
        const products = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("oversee products")
        );
        expect(products.length).toBeGreaterThan(0);
        const analytics = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("access analytics")
        );
        expect(analytics.length).toBeGreaterThan(0);
        const settings = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("configure settings")
        );
        expect(settings.length).toBeGreaterThan(0);
    });

    it("renders the help and tip section", () => {
        render(<Welcome />);
        const helpElements = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("need help? visit the documentation or contact support")
        );
        expect(helpElements.length).toBeGreaterThan(0);
        const tipElements = screen.getAllByText((content, node) =>
            (node?.textContent || "").toLowerCase().includes("tip:")
        );
        expect(tipElements.length).toBeGreaterThan(0);
    });
});
