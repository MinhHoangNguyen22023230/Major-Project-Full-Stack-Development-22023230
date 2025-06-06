import { describe, it, expect, vi, beforeAll, Mock } from "vitest";

describe("s3/src/access.ts", () => {
    beforeAll(() => {
        vi.resetModules();
    });

    it("should create an S3Client with correct config from env", async () => {
        // Mock dotenv
        vi.doMock("dotenv", () => ({ default: { config: vi.fn() } }));
        // Use a closure for s3ClientMock
        let s3ClientMock: Mock | undefined;
        vi.doMock("@aws-sdk/client-s3", () => {
            s3ClientMock = vi.fn();
            return { S3Client: s3ClientMock };
        });

        process.env.AWS_BUCKET_REGION = "test-region";
        process.env.AWS_ACCESS_KEY = "test-access-key";
        process.env.AWS_SECRET_ACCESS_KEY = "test-secret-key";

        // Re-import after mocks
        const imported = await import("./access.ts");
        expect(s3ClientMock).toBeDefined();
        expect(s3ClientMock).toHaveBeenCalledWith({
            region: "test-region",
            credentials: {
                accessKeyId: "test-access-key",
                secretAccessKey: "test-secret-key",
            },
        });
        expect(imported.default).toBeDefined();
    });
});
