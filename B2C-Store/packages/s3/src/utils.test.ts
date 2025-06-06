import { describe, it, expect, vi, afterEach } from "vitest";

// Mock S3 and AWS SDK
let s3MockInstance: { send: ReturnType<typeof vi.fn> };
vi.mock("./access", () => {
    s3MockInstance = { send: vi.fn() };
    return { default: s3MockInstance };
});
vi.mock("@aws-sdk/client-s3", () => ({
    PutObjectCommand: vi.fn((args) => ({ ...args, _type: "PutObjectCommand" })),
    GetObjectCommand: vi.fn((args) => ({ ...args, _type: "GetObjectCommand" })),
    DeleteObjectCommand: vi.fn((args) => ({ ...args, _type: "DeleteObjectCommand" })),
    ListObjectsV2Command: vi.fn((args) => ({ ...args, _type: "ListObjectsV2Command" })),
}));
vi.mock("@aws-sdk/s3-request-presigner", () => ({
    getSignedUrl: vi.fn().mockResolvedValue("signed-url")
}));

describe("utils.ts", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("uploadFile calls s3.send with PutObjectCommand", async () => {
        const { uploadFile } = await import("./utils.ts");
        const { PutObjectCommand } = await import("@aws-sdk/client-s3");
        await uploadFile("key", "body", "type");
        expect(PutObjectCommand).toHaveBeenCalledWith({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: "key",
            Body: "body",
            ContentType: "type",
        });
        expect(s3MockInstance.send).toHaveBeenCalled();
    });

    it("deleteFile calls s3.send with DeleteObjectCommand", async () => {
        const { deleteFile } = await import("./utils.ts");
        const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
        await deleteFile("key");
        expect(DeleteObjectCommand).toHaveBeenCalledWith({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: "key",
        });
        expect(s3MockInstance.send).toHaveBeenCalled();
    });

    it("listFiles calls s3.send with ListObjectsV2Command and returns keys", async () => {
        const { listFiles } = await import("./utils.ts");
        const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
        s3MockInstance.send.mockResolvedValueOnce({ Contents: [{ Key: "a" }, { Key: "b" }] });
        const keys = await listFiles("prefix/");
        expect(ListObjectsV2Command).toHaveBeenCalledWith({
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: "prefix/",
        });
        expect(keys).toEqual(["a", "b"]);
    });

    it("getSignedFileUrl calls getSignedUrl and returns signed url", async () => {
        const { getSignedFileUrl } = await import("./utils.ts");
        const { GetObjectCommand } = await import("@aws-sdk/client-s3");
        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
        const url = await getSignedFileUrl("key", 123);
        expect(GetObjectCommand).toHaveBeenCalledWith({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: "key",
        });
        expect(getSignedUrl).toHaveBeenCalled();
        expect(url).toBe("signed-url");
    });

    it("getFile returns the correct public URL", async () => {
        const { getFile } = await import("./utils.ts");
        process.env.AWS_BUCKET_NAME = "bucket";
        process.env.AWS_BUCKET_REGION = "region";
        const url = await getFile("some/key");
        expect(url).toBe("https://bucket.s3.region.amazonaws.com/some/key");
    });

    it("uploadAdminImage calls uploadFile and returns correct URL", async () => {
        const { uploadAdminImage } = await import("./utils.ts");
        // Mock listFiles to return empty so deleteAdminImage doesn't fail
        s3MockInstance.send.mockResolvedValueOnce({ Contents: [] });
        const url = await uploadAdminImage("adminId", "file.png", "body", "image/png");
        expect(url).toContain("admin/adminId/file.png");
        expect(s3MockInstance.send).toHaveBeenCalled();
    });

    it("deleteAdminImage deletes all files for admin", async () => {
        const { deleteAdminImage } = await import("./utils.ts");
        s3MockInstance.send.mockResolvedValueOnce({ Contents: [{ Key: "admin/adminId/file1.png" }, { Key: "admin/adminId/file2.png" }] });
        await deleteAdminImage("adminId");
        expect(s3MockInstance.send).toHaveBeenCalled();
    });

    it("getDefaultImage returns correct public URL", async () => {
        const { getDefaultImage } = await import("./utils.ts");
        process.env.AWS_BUCKET_NAME = "bucket";
        process.env.AWS_BUCKET_REGION = "region";
        const url = await getDefaultImage("default.png");
        expect(url).toBe("https://bucket.s3.region.amazonaws.com/default/default.png");
    });

    it("getSignedDefaultImageUrl calls getSignedFileUrl", async () => {
        const { getSignedDefaultImageUrl } = await import("./utils.ts");
        const url = await getSignedDefaultImageUrl("default.png", 100);
        expect(url).toBe("signed-url");
    });
});
