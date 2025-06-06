import { s3Procedure } from "./s3procedure";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

type S3ProcedureRouter = typeof s3Procedure;
type Inputs = inferRouterInputs<S3ProcedureRouter>;
type Outputs = inferRouterOutputs<S3ProcedureRouter>;

const adminId = "admin-1";
const brandId = "brand-1";
const categoryId = "cat-1";
const userId = "user-1";
const productId = "prod-1";
const filename = "test.png";
const body = [1, 2, 3];
const contentType = "image/png";
const imageUrl = "https://example.com/image.png";
const defaultAdminUrl = "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+user.png";
const defaultBrandCatUrl = "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+available.jpg";
const defaultUserUrl = defaultAdminUrl;
const defaultProductUrl = "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+product+image.png";
const signedUrl = "https://example.com/signed-url";

interface PrismaMock {
    admin: { update: ReturnType<typeof vi.fn> };
    brand: { update: ReturnType<typeof vi.fn> };
    category: { update: ReturnType<typeof vi.fn> };
    user: { update: ReturnType<typeof vi.fn> };
    product: { update: ReturnType<typeof vi.fn> };
}
interface S3UtilsMock {
    uploadAdminImage: ReturnType<typeof vi.fn>;
    getAdminImage: ReturnType<typeof vi.fn>;
    deleteAdminImage: ReturnType<typeof vi.fn>;
    listAdminImages: ReturnType<typeof vi.fn>;
    uploadBrandImage: ReturnType<typeof vi.fn>;
    getBrandImage: ReturnType<typeof vi.fn>;
    deleteBrandImage: ReturnType<typeof vi.fn>;
    listBrandImages: ReturnType<typeof vi.fn>;
    uploadCategoryImage: ReturnType<typeof vi.fn>;
    getCategoryImage: ReturnType<typeof vi.fn>;
    deleteCategoryImage: ReturnType<typeof vi.fn>;
    listCategoryImages: ReturnType<typeof vi.fn>;
    uploadUserImage: ReturnType<typeof vi.fn>;
    getUserImage: ReturnType<typeof vi.fn>;
    deleteUserImage: ReturnType<typeof vi.fn>;
    listUserImages: ReturnType<typeof vi.fn>;
    uploadProductImage: ReturnType<typeof vi.fn>;
    getProductImage: ReturnType<typeof vi.fn>;
    deleteProductImage: ReturnType<typeof vi.fn>;
    listProductImages: ReturnType<typeof vi.fn>;
    getDefaultImage: ReturnType<typeof vi.fn>;
    getSignedDefaultImageUrl: ReturnType<typeof vi.fn>;
}

interface TestCtx {
    S3Utils: S3UtilsMock;
    prisma: PrismaMock;
}

let ctx: TestCtx;

beforeEach(() => {
    ctx = {
        S3Utils: {
            uploadAdminImage: vi.fn().mockResolvedValue(imageUrl),
            getAdminImage: vi.fn().mockResolvedValue(imageUrl),
            deleteAdminImage: vi.fn().mockResolvedValue(undefined),
            listAdminImages: vi.fn().mockResolvedValue([imageUrl]),
            uploadBrandImage: vi.fn().mockResolvedValue(imageUrl),
            getBrandImage: vi.fn().mockResolvedValue(imageUrl),
            deleteBrandImage: vi.fn().mockResolvedValue(undefined),
            listBrandImages: vi.fn().mockResolvedValue([imageUrl]),
            uploadCategoryImage: vi.fn().mockResolvedValue(imageUrl),
            getCategoryImage: vi.fn().mockResolvedValue(imageUrl),
            deleteCategoryImage: vi.fn().mockResolvedValue(undefined),
            listCategoryImages: vi.fn().mockResolvedValue([imageUrl]),
            uploadUserImage: vi.fn().mockResolvedValue(imageUrl),
            getUserImage: vi.fn().mockResolvedValue(imageUrl),
            deleteUserImage: vi.fn().mockResolvedValue(undefined),
            listUserImages: vi.fn().mockResolvedValue([imageUrl]),
            uploadProductImage: vi.fn().mockResolvedValue(imageUrl),
            getProductImage: vi.fn().mockResolvedValue(imageUrl),
            deleteProductImage: vi.fn().mockResolvedValue(undefined),
            listProductImages: vi.fn().mockResolvedValue([imageUrl]),
            getDefaultImage: vi.fn().mockResolvedValue(imageUrl),
            getSignedDefaultImageUrl: vi.fn().mockResolvedValue(signedUrl),
        },
        prisma: {
            admin: { update: vi.fn().mockResolvedValue({ id: adminId, imageUrl }) },
            brand: { update: vi.fn().mockResolvedValue({ id: brandId, imageUrl }) },
            category: { update: vi.fn().mockResolvedValue({ id: categoryId, imageUrl }) },
            user: { update: vi.fn().mockResolvedValue({ id: userId, imgUrl: imageUrl }) },
            product: { update: vi.fn().mockResolvedValue({ id: productId, imageUrl }) },
        },
    };
});

type Ctx = TestCtx;

describe("s3Procedure", () => {
    // --- Admin ---
    it("uploadAdminImage uploads and updates admin", async () => {
        const input: Inputs["uploadAdminImage"] = { adminId, filename, body, contentType };
        const resolver = (s3Procedure.uploadAdminImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["uploadAdminImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.uploadAdminImage).toHaveBeenCalledWith(adminId, filename, new Uint8Array(body), contentType);
        expect(ctx.prisma.admin.update).toHaveBeenCalledWith({ where: { id: adminId }, data: { imageUrl } });
        expect(result).toBe(imageUrl);
    });
    it("getAdminImage returns image url", async () => {
        const input: Inputs["getAdminImage"] = { adminId, filename };
        const resolver = (s3Procedure.getAdminImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["getAdminImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.getAdminImage).toHaveBeenCalledWith(adminId, filename);
        expect(result).toBe(imageUrl);
    });
    it("deleteAdminImage deletes and resets image", async () => {
        const input: Inputs["deleteAdminImage"] = { adminId };
        const resolver = (s3Procedure.deleteAdminImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["deleteAdminImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.deleteAdminImage).toHaveBeenCalledWith(adminId);
        expect(ctx.prisma.admin.update).toHaveBeenCalledWith({ where: { id: adminId }, data: { imageUrl: defaultAdminUrl } });
        expect(result).toBe(defaultAdminUrl);
    });
    it("listAdminImages returns image list", async () => {
        const input: Inputs["listAdminImages"] = { adminId };
        const resolver = (s3Procedure.listAdminImages as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["listAdminImages"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.listAdminImages).toHaveBeenCalledWith(adminId);
        expect(result).toEqual([imageUrl]);
    });
    // --- Brand ---
    it("uploadBrandImage uploads and updates brand", async () => {
        const input: Inputs["uploadBrandImage"] = { brandId, filename, body, contentType };
        const resolver = (s3Procedure.uploadBrandImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["uploadBrandImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.uploadBrandImage).toHaveBeenCalledWith(brandId, filename, new Uint8Array(body), contentType);
        expect(ctx.prisma.brand.update).toHaveBeenCalledWith({ where: { id: brandId }, data: { imageUrl } });
        expect(result).toBe(imageUrl);
    });
    it("getBrandImage returns image url", async () => {
        const input: Inputs["getBrandImage"] = { brandId, filename };
        const resolver = (s3Procedure.getBrandImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["getBrandImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.getBrandImage).toHaveBeenCalledWith(brandId, filename);
        expect(result).toBe(imageUrl);
    });
    it("deleteBrandImage deletes and resets image", async () => {
        const input: Inputs["deleteBrandImage"] = { brandId };
        const resolver = (s3Procedure.deleteBrandImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["deleteBrandImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.deleteBrandImage).toHaveBeenCalledWith(brandId);
        expect(ctx.prisma.brand.update).toHaveBeenCalledWith({ where: { id: brandId }, data: { imageUrl: defaultBrandCatUrl } });
        expect(result).toBe(defaultBrandCatUrl);
    });
    it("listBrandImages returns image list", async () => {
        const input: Inputs["listBrandImages"] = { brandId };
        const resolver = (s3Procedure.listBrandImages as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["listBrandImages"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.listBrandImages).toHaveBeenCalledWith(brandId);
        expect(result).toEqual([imageUrl]);
    });
    // --- Category ---
    it("uploadCategoryImage uploads and updates category", async () => {
        const input: Inputs["uploadCategoryImage"] = { categoryId, filename, body, contentType };
        const resolver = (s3Procedure.uploadCategoryImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["uploadCategoryImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.uploadCategoryImage).toHaveBeenCalledWith(categoryId, filename, new Uint8Array(body), contentType);
        expect(ctx.prisma.category.update).toHaveBeenCalledWith({ where: { id: categoryId }, data: { imageUrl } });
        expect(result).toBe(imageUrl);
    });
    it("getCategoryImage returns image url", async () => {
        const input: Inputs["getCategoryImage"] = { categoryId, filename };
        const resolver = (s3Procedure.getCategoryImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["getCategoryImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.getCategoryImage).toHaveBeenCalledWith(categoryId, filename);
        expect(result).toBe(imageUrl);
    });
    it("deleteCategoryImage deletes and resets image", async () => {
        const input: Inputs["deleteCategoryImage"] = { categoryId };
        const resolver = (s3Procedure.deleteCategoryImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["deleteCategoryImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.deleteCategoryImage).toHaveBeenCalledWith(categoryId);
        expect(ctx.prisma.category.update).toHaveBeenCalledWith({ where: { id: categoryId }, data: { imageUrl: defaultBrandCatUrl } });
        expect(result).toBe(defaultBrandCatUrl);
    });
    it("listCategoryImages returns image list", async () => {
        const input: Inputs["listCategoryImages"] = { categoryId };
        const resolver = (s3Procedure.listCategoryImages as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["listCategoryImages"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.listCategoryImages).toHaveBeenCalledWith(categoryId);
        expect(result).toEqual([imageUrl]);
    });
    // --- User ---
    it("uploadUserImage uploads and updates user", async () => {
        const input: Inputs["uploadUserImage"] = { userId, filename, body, contentType };
        const resolver = (s3Procedure.uploadUserImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["uploadUserImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.uploadUserImage).toHaveBeenCalledWith(userId, filename, new Uint8Array(body), contentType);
        expect(ctx.prisma.user.update).toHaveBeenCalledWith({ where: { id: userId }, data: { imgUrl: imageUrl } });
        expect(result).toBe(imageUrl);
    });
    it("getUserImage returns image url", async () => {
        const input: Inputs["getUserImage"] = { userId, filename };
        const resolver = (s3Procedure.getUserImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["getUserImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.getUserImage).toHaveBeenCalledWith(userId, filename);
        expect(result).toBe(imageUrl);
    });
    it("deleteUserImage deletes and resets image", async () => {
        const input: Inputs["deleteUserImage"] = { userId };
        const resolver = (s3Procedure.deleteUserImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["deleteUserImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.deleteUserImage).toHaveBeenCalledWith(userId);
        expect(ctx.prisma.user.update).toHaveBeenCalledWith({ where: { id: userId }, data: { imgUrl: defaultUserUrl } });
        expect(result).toBe(defaultUserUrl);
    });
    it("listUserImages returns image list", async () => {
        const input: Inputs["listUserImages"] = { userId };
        const resolver = (s3Procedure.listUserImages as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["listUserImages"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.listUserImages).toHaveBeenCalledWith(userId);
        expect(result).toEqual([imageUrl]);
    });
    // --- Product ---
    it("uploadProductImage uploads and updates product", async () => {
        const input: Inputs["uploadProductImage"] = { productId, filename, body, contentType };
        const resolver = (s3Procedure.uploadProductImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["uploadProductImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.uploadProductImage).toHaveBeenCalledWith(productId, filename, new Uint8Array(body), contentType);
        expect(ctx.prisma.product.update).toHaveBeenCalledWith({ where: { id: productId }, data: { imageUrl } });
        expect(result).toBe(imageUrl);
    });
    it("getProductImage returns image url", async () => {
        const input: Inputs["getProductImage"] = { productId, filename };
        const resolver = (s3Procedure.getProductImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["getProductImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.getProductImage).toHaveBeenCalledWith(productId, filename);
        expect(result).toBe(imageUrl);
    });
    it("deleteProductImage deletes and resets image", async () => {
        const input: Inputs["deleteProductImage"] = { productId };
        const resolver = (s3Procedure.deleteProductImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["deleteProductImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.deleteProductImage).toHaveBeenCalledWith(productId);
        expect(ctx.prisma.product.update).toHaveBeenCalledWith({ where: { id: productId }, data: { imageUrl: defaultProductUrl } });
        expect(result).toBe(defaultProductUrl);
    });
    it("listProductImages returns image list", async () => {
        const input: Inputs["listProductImages"] = { productId };
        const resolver = (s3Procedure.listProductImages as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["listProductImages"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.listProductImages).toHaveBeenCalledWith(productId);
        expect(result).toEqual([imageUrl]);
    });
    // --- Default ---
    it("getDefaultImage returns image url", async () => {
        const input: Inputs["getDefaultImage"] = { filename };
        const resolver = (s3Procedure.getDefaultImage as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["getDefaultImage"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.getDefaultImage).toHaveBeenCalledWith(filename);
        expect(result).toBe(imageUrl);
    });
    it("getSignedDefaultImageUrl returns signed url", async () => {
        const input: Inputs["getSignedDefaultImageUrl"] = { filename, expiresInSeconds: 60 };
        const resolver = (s3Procedure.getSignedDefaultImageUrl as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Outputs["getSignedDefaultImageUrl"]> } })._def.resolver;
        const result = await resolver({ input, ctx });
        expect(ctx.S3Utils.getSignedDefaultImageUrl).toHaveBeenCalledWith(filename, 60);
        expect(result).toBe(signedUrl);
    });
});
