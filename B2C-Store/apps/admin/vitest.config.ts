import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: "jsdom",
        setupFiles: ['./src/tests/setup.ts'],
        include: ['src/**/*.{test, spec}.{ts,tsx}'],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
        },
    },
});