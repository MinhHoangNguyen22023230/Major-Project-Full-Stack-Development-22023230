import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import '@testing-library/jest-dom';

afterEach(() => {
    cleanup();
});
// This will ensure that the DOM is cleaned up after each test, preventing memory leaks and ensuring a fresh state for each test case.
// You can add more global setup or teardown logic here if needed.
// For example, if you need to reset any global state or mock implementations, you can do that here as well.