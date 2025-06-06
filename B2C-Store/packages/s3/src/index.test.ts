import { describe, it, expect } from "vitest";
import * as S3Index from "./index";

describe("s3/src/index.ts", () => {
    it("should export S3Utils with expected members", () => {
        expect(S3Index.S3Utils).toBeDefined();
        // Check for a few known exports from utils
        expect(typeof S3Index.S3Utils.uploadFile).toBe("function");
        expect(typeof S3Index.S3Utils.getFile).toBe("function");
        expect(typeof S3Index.S3Utils.deleteFile).toBe("function");
        expect(typeof S3Index.S3Utils.getSignedFileUrl).toBe("function");
    });
});
