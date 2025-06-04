import { router, publicProcedure } from "../router";
import { z } from "zod";

export const s3Procedure = router({
    // --- Admin ---
    uploadAdminImage: publicProcedure
        .input(z.object({ adminId: z.string(), filename: z.string(), body: z.array(z.number()), contentType: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
            const uint8Body = new Uint8Array(input.body);
            const imageUrl = await ctx.S3Utils.uploadAdminImage(input.adminId, input.filename, uint8Body, input.contentType);
            await ctx.prisma.admin.update({
                where: { id: input.adminId },
                data: { imageUrl },
            });
            return imageUrl;
        }),
    getAdminImage: publicProcedure
        .input(z.object({ adminId: z.string(), filename: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.getAdminImage(input.adminId, input.filename); // returns string (URL)
        }),
    deleteAdminImage: publicProcedure
        .input(z.object({ adminId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            await ctx.S3Utils.deleteAdminImage(input.adminId);
            const defaultUrl = "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+user.png";
            await ctx.prisma.admin.update({
                where: { id: input.adminId },
                data: { imageUrl: defaultUrl },
            });
            return defaultUrl;
        }),
    listAdminImages: publicProcedure
        .input(z.object({ adminId: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.listAdminImages(input.adminId); // returns string[]
        }),
    // --- Brand ---
    uploadBrandImage: publicProcedure
        .input(z.object({ brandId: z.string(), filename: z.string(), body: z.array(z.number()), contentType: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
            const uint8Body = new Uint8Array(input.body);
            const imageUrl = await ctx.S3Utils.uploadBrandImage(input.brandId, input.filename, uint8Body, input.contentType);
            await ctx.prisma.brand.update({
                where: { id: input.brandId },
                data: { imageUrl },
            });
            return imageUrl;
        }),
    getBrandImage: publicProcedure
        .input(z.object({ brandId: z.string(), filename: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.getBrandImage(input.brandId, input.filename);
        }),
    deleteBrandImage: publicProcedure
        .input(z.object({ brandId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            await ctx.S3Utils.deleteBrandImage(input.brandId);
            const defaultUrl = "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+available.jpg";
            await ctx.prisma.brand.update({
                where: { id: input.brandId },
                data: { imageUrl: defaultUrl },
            });
            return defaultUrl;
        }),
    listBrandImages: publicProcedure
        .input(z.object({ brandId: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.listBrandImages(input.brandId);
        }),
    // --- Category ---
    uploadCategoryImage: publicProcedure
        .input(z.object({ categoryId: z.string(), filename: z.string(), body: z.array(z.number()), contentType: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
            const uint8Body = new Uint8Array(input.body);
            const imageUrl = await ctx.S3Utils.uploadCategoryImage(input.categoryId, input.filename, uint8Body, input.contentType);
            await ctx.prisma.category.update({
                where: { id: input.categoryId },
                data: { imageUrl },
            });
            return imageUrl;
        }),
    getCategoryImage: publicProcedure
        .input(z.object({ categoryId: z.string(), filename: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.getCategoryImage(input.categoryId, input.filename);
        }),
    deleteCategoryImage: publicProcedure
        .input(z.object({ categoryId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            await ctx.S3Utils.deleteCategoryImage(input.categoryId);
            const defaultUrl = "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+available.jpg";
            await ctx.prisma.category.update({
                where: { id: input.categoryId },
                data: { imageUrl: defaultUrl },
            });
            return defaultUrl;
        }),
    listCategoryImages: publicProcedure
        .input(z.object({ categoryId: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.listCategoryImages(input.categoryId);
        }),
    // --- User ---
    uploadUserImage: publicProcedure
        .input(z.object({ userId: z.string(), filename: z.string(), body: z.array(z.number()), contentType: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
            const uint8Body = new Uint8Array(input.body);
            const imageUrl = await ctx.S3Utils.uploadUserImage(input.userId, input.filename, uint8Body, input.contentType);
            await ctx.prisma.user.update({
                where: { id: input.userId },
                data: { imgUrl: imageUrl },
            });
            return imageUrl;
        }),
    getUserImage: publicProcedure
        .input(z.object({ userId: z.string(), filename: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.getUserImage(input.userId, input.filename);
        }),
    deleteUserImage: publicProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            await ctx.S3Utils.deleteUserImage(input.userId);
            const defaultUrl = "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+user.png";
            await ctx.prisma.user.update({
                where: { id: input.userId },
                data: { imgUrl: defaultUrl },
            });
            return defaultUrl;
        }),
    listUserImages: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.listUserImages(input.userId);
        }),
    // --- Product ---
    uploadProductImage: publicProcedure
        .input(z.object({ productId: z.string(), filename: z.string(), body: z.array(z.number()), contentType: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
            const uint8Body = new Uint8Array(input.body);
            const imageUrl = await ctx.S3Utils.uploadProductImage(input.productId, input.filename, uint8Body, input.contentType);
            await ctx.prisma.product.update({
                where: { id: input.productId },
                data: { imageUrl },
            });
            return imageUrl;
        }),
    getProductImage: publicProcedure
        .input(z.object({ productId: z.string(), filename: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.getProductImage(input.productId, input.filename);
        }),
    deleteProductImage: publicProcedure
        .input(z.object({ productId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            await ctx.S3Utils.deleteProductImage(input.productId);
            const defaultUrl = "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+product+image.png";
            await ctx.prisma.product.update({
                where: { id: input.productId },
                data: { imageUrl: defaultUrl },
            });
            return defaultUrl;
        }),
    listProductImages: publicProcedure
        .input(z.object({ productId: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.listProductImages(input.productId);
        }),
    // --- Default ---
    getDefaultImage: publicProcedure
        .input(z.object({ filename: z.string() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.getDefaultImage(input.filename);
        }),
    getSignedDefaultImageUrl: publicProcedure
        .input(z.object({ filename: z.string(), expiresInSeconds: z.number().optional() }))
        .query(async ({ input, ctx }) => {
            return ctx.S3Utils.getSignedDefaultImageUrl(input.filename, input.expiresInSeconds);
        }),
});
