import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Brand, Category, Product, User, Address } from '@repo/db';
import { crudProcedure } from './crudProcedure';

// Strictly typed Prisma mock
interface PrismaMock {
    brand: {
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
    };
    category: {
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
    };
    product: {
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
    };
    user: {
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
    };
    address: {
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        updateMany: ReturnType<typeof vi.fn>;
    };
    wishListItem: {
        deleteMany: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
    };
    wishList: {
        deleteMany: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>; // Added findUnique mock
        delete: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>; // Added
        update: ReturnType<typeof vi.fn>; // Added
    };
    orderItem: {
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
    };
    cartItem: {
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
    };
    cart: {
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
    };
    review: {
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
    };
    order: {
        findMany: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
    };
}

type Ctx = { prisma: PrismaMock };

describe('crudProcedure', () => {
    let ctx: Ctx;
    beforeEach(() => {
        ctx = {
            prisma: {
                brand: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
                category: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
                product: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
                user: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
                address: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), update: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
                wishListItem: {
                    deleteMany: vi.fn(),
                    findMany: vi.fn(),
                    create: vi.fn(),
                    delete: vi.fn(),
                    update: vi.fn(),
                    findUnique: vi.fn(),
                },
                wishList: {
                    deleteMany: vi.fn(),
                    findUnique: vi.fn(),
                    delete: vi.fn(),
                    create: vi.fn(), // Added
                    update: vi.fn(), // Added
                },
                orderItem: {
                    findMany: vi.fn(),
                    create: vi.fn(),
                    delete: vi.fn(),
                    update: vi.fn(),
                    findUnique: vi.fn(),
                    deleteMany: vi.fn(),
                },
                cartItem: {
                    findMany: vi.fn(),
                    create: vi.fn(),
                    findUnique: vi.fn(),
                    delete: vi.fn(),
                    update: vi.fn(),
                    deleteMany: vi.fn(),
                },
                cart: {
                    findMany: vi.fn(),
                    create: vi.fn(),
                    update: vi.fn(),
                    deleteMany: vi.fn(),
                    findUnique: vi.fn(),
                    delete: vi.fn(),
                },
                review: {
                    findMany: vi.fn(),
                    create: vi.fn(),
                    delete: vi.fn(),
                    deleteMany: vi.fn(),
                    update: vi.fn(),
                    findUnique: vi.fn(),
                },
                order: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn(), delete: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
            } as unknown as PrismaMock,
        };
    });

    describe('Brand CRUD', () => {
        it('getBrands returns brands', async () => {
            const brands: Brand[] = [{ id: '1', name: 'Nike', description: null, imageUrl: null, createdAt: new Date(), updatedAt: new Date() }];
            ctx.prisma.brand.findMany.mockResolvedValue(brands);
            const resolver = (crudProcedure.getBrands as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<Brand[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(brands);
            expect(ctx.prisma.brand.findMany).toHaveBeenCalledWith({ include: { products: true } });
        });

        it('createBrand creates a brand', async () => {
            const input = { name: 'Adidas', description: 'desc', imageUrl: 'img' };
            const created: Brand = { id: '2', name: input.name, description: input.description, imageUrl: input.imageUrl, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.brand.create.mockResolvedValue(created);
            const resolver = (crudProcedure.createBrand as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Brand> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(created);
            expect(ctx.prisma.brand.create).toHaveBeenCalledWith({ data: input });
        });

        it('deleteBrand deletes brand and related products', async () => {
            const input = { id: '3' };
            ctx.prisma.product.deleteMany.mockResolvedValue({});
            const deletedBrand: Brand = { id: '3', name: '', description: null, imageUrl: null, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.brand.delete.mockResolvedValue(deletedBrand);
            const resolver = (crudProcedure.deleteBrand as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Brand> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.deleteMany).toHaveBeenCalledWith({ where: { brandId: input.id } });
            expect(ctx.prisma.brand.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(result).toEqual(deletedBrand);
        });

        it('deleteAllBrands deletes all brands and products', async () => {
            ctx.prisma.product.deleteMany.mockResolvedValue({});
            ctx.prisma.brand.deleteMany.mockResolvedValue({ count: 2 });
            const resolver = (crudProcedure.deleteAllBrands as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.product.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.brand.deleteMany).toHaveBeenCalled();
            expect(result).toEqual({ count: 2 });
        });

        it('updateBrand updates a brand', async () => {
            const input = { id: '1', data: { name: 'Puma', description: 'desc2', imageUrl: 'img2' } };
            const updated: Brand = { id: '1', name: 'Puma', description: 'desc2', imageUrl: 'img2', createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.brand.update.mockResolvedValue(updated);
            const resolver = (crudProcedure.updateBrand as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Brand> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(updated);
            expect(ctx.prisma.brand.update).toHaveBeenCalledWith({ where: { id: input.id }, data: input.data });
        });

        it('findBrandById returns a brand', async () => {
            const input = { id: '1' };
            const found: Brand = { id: '1', name: 'Nike', description: null, imageUrl: null, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.brand.findUnique.mockResolvedValue(found);
            const resolver = (crudProcedure.findBrandById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Brand | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(found);
            expect(ctx.prisma.brand.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { products: true } });
        });
    });

    describe('Category CRUD', () => {
        it('getCategories returns categories', async () => {
            const categories: Category[] = [{
                id: '1',
                name: 'Shoes',
                description: null,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }];
            ctx.prisma.category.findMany.mockResolvedValue(categories);
            const resolver = (crudProcedure.getCategories as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<Category[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(categories);
            expect(ctx.prisma.category.findMany).toHaveBeenCalledWith({ include: { products: true } });
        });

        it('createCategory creates a category', async () => {
            const input = { name: 'Clothing', description: 'desc', imageUrl: 'img' };
            const created: Category = {
                id: '2',
                name: input.name,
                description: input.description,
                imageUrl: input.imageUrl,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            ctx.prisma.category.create.mockResolvedValue(created);
            const resolver = (crudProcedure.createCategory as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Category> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(created);
            expect(ctx.prisma.category.create).toHaveBeenCalledWith({ data: input });
        });

        it('deleteCategory deletes category and related products', async () => {
            const input = { id: '3' };
            ctx.prisma.product.deleteMany.mockResolvedValue({});
            const deletedCategory: Category = { id: '3', name: '', description: null, imageUrl: null, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.category.delete.mockResolvedValue(deletedCategory);
            const resolver = (crudProcedure.deleteCategory as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Category> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.deleteMany).toHaveBeenCalledWith({ where: { categoryId: input.id } });
            expect(ctx.prisma.category.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(result).toEqual(deletedCategory);
        });

        it('deleteAllCategories deletes all categories and products', async () => {
            ctx.prisma.product.deleteMany.mockResolvedValue({});
            ctx.prisma.category.deleteMany.mockResolvedValue({ count: 2 });
            const resolver = (crudProcedure.deleteAllCategories as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.product.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.category.deleteMany).toHaveBeenCalled();
            expect(result).toEqual({ count: 2 });
        });

        it('updateCategory updates a category', async () => {
            const input = { id: '1', data: { name: 'Apparel', description: 'desc2', imageUrl: 'img2' } };
            const updated: Category = { id: '1', name: 'Apparel', description: 'desc2', imageUrl: 'img2', createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.category.update.mockResolvedValue(updated);
            const resolver = (crudProcedure.updateCategory as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Category> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(updated);
            expect(ctx.prisma.category.update).toHaveBeenCalledWith({ where: { id: input.id }, data: input.data });
        });

        it('findCategoryById returns a category', async () => {
            const input = { id: '1' };
            const found: Category = { id: '1', name: 'Shoes', description: null, imageUrl: null, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.category.findUnique.mockResolvedValue(found);
            const resolver = (crudProcedure.findCategoryById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Category | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(found);
            expect(ctx.prisma.category.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { products: true } });
        });
    });

    describe('Product CRUD', () => {
        it('getProducts returns products', async () => {
            const products: Product[] = [{
                id: '1',
                name: 'Shoe',
                price: 100,
                description: 'desc',
                imageUrl: 'img',
                stock: 10,
                salePrice: null,
                releaseDate: null,
                rating: null,
                categoryId: 'cat1',
                brandId: 'brand1',
                createdAt: new Date(),
                updatedAt: new Date(),
            }];
            ctx.prisma.product.findMany.mockResolvedValue(products);
            const resolver = (crudProcedure.getProducts as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<Product[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(products);
            expect(ctx.prisma.product.findMany).toHaveBeenCalled();
        });

        it('createProduct creates a product', async () => {
            const input = {
                name: 'Hat',
                price: 50,
                description: 'desc',
                imageUrl: 'img',
                stock: 5,
                salePrice: 40,
                releaseDate: new Date(),
                rating: 5,
                categoryId: 'cat2',
                brandId: 'brand2'
            };
            const created: Product = {
                id: '2',
                name: input.name,
                price: input.price,
                description: input.description,
                imageUrl: input.imageUrl,
                stock: input.stock,
                salePrice: input.salePrice,
                releaseDate: input.releaseDate,
                rating: input.rating,
                categoryId: input.categoryId,
                brandId: input.brandId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            ctx.prisma.product.create.mockResolvedValue(created);
            const resolver = (crudProcedure.createProduct as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Product> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(created);
            expect(ctx.prisma.product.create).toHaveBeenCalledWith({ data: input, include: { brand: true, category: true, reviews: true, cartItems: true, orderItems: true, wishListItems: true } });
        });

        it('deleteProduct deletes a product', async () => {
            const input = { id: '3' };
            const deleted: Product = {
                id: '3',
                name: '',
                price: 0,
                description: '',
                imageUrl: '',
                stock: 0,
                salePrice: null,
                releaseDate: null,
                rating: null,
                categoryId: '',
                brandId: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            ctx.prisma.product.delete.mockResolvedValue(deleted);
            const resolver = (crudProcedure.deleteProduct as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Product> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(result).toEqual(deleted);
        });

        it('deleteAllProducts deletes all products', async () => {
            ctx.prisma.product.deleteMany.mockResolvedValue({ count: 5 });
            const resolver = (crudProcedure.deleteAllProducts as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.product.deleteMany).toHaveBeenCalled();
            expect(result).toEqual({ count: 5 });
        });

        it('updateProduct updates a product', async () => {
            const input = { id: '1', data: { name: 'Updated', price: 200 } };
            const updated: Product = {
                id: '1',
                name: 'Updated',
                price: 200,
                description: '',
                imageUrl: '',
                stock: 0,
                salePrice: null,
                releaseDate: null,
                rating: null,
                categoryId: '',
                brandId: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            ctx.prisma.product.update.mockResolvedValue(updated);
            const resolver = (crudProcedure.updateProduct as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Product> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.update).toHaveBeenCalledWith({ where: { id: input.id }, data: input.data, include: { brand: true, category: true, reviews: true, cartItems: true, orderItems: true, wishListItems: true } });
            expect(result).toEqual(updated);
        });

        it('findProductById returns a product', async () => {
            const input = { id: '1' };
            const found: Product = {
                id: '1',
                name: 'Shoe',
                price: 100,
                description: 'desc',
                imageUrl: 'img',
                stock: 10,
                salePrice: null,
                releaseDate: null,
                rating: null,
                categoryId: 'cat1',
                brandId: 'brand1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            ctx.prisma.product.findUnique.mockResolvedValue(found);
            const resolver = (crudProcedure.findProductById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Product | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { brand: true, category: true, reviews: true, cartItems: true, orderItems: true, wishListItems: true } });
            expect(result).toEqual(found);
        });
    });

    describe('User CRUD', () => {
        it('getUsers returns users', async () => {
            const users: User[] = [{
                id: '1',
                username: 'user1',
                email: 'user1@email.com',
                hashedPassword: 'pass',
                lastLogin: null,
                imgUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }];
            ctx.prisma.user.findMany.mockResolvedValue(users);
            const resolver = (crudProcedure.getUsers as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<User[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(users);
            expect(ctx.prisma.user.findMany).toHaveBeenCalled();
        });

        it('createUser creates a user', async () => {
            const input = { username: 'user2', email: 'user2@email.com', password: 'pass2', imgUrl: 'img2' };
            const created: User = {
                id: '2',
                username: input.username,
                email: input.email,
                hashedPassword: 'hashed',
                lastLogin: null,
                imgUrl: input.imgUrl,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            ctx.prisma.user.create.mockResolvedValue(created);
            const resolver = (crudProcedure.createUser as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<User> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(created);
            expect(ctx.prisma.user.create).toHaveBeenCalledWith({ data: expect.objectContaining({ username: input.username, email: input.email, hashedPassword: expect.any(String), imgUrl: input.imgUrl }) });
        });

        it('deleteUser deletes a user', async () => {
            // Arrange
            const input = { id: 'user1' };
            const userOrders = [{ id: 'order1' }, { id: 'order2' }];
            ctx.prisma.order.findMany.mockResolvedValue(userOrders);
            ctx.prisma.orderItem.deleteMany.mockResolvedValue({});
            ctx.prisma.order.deleteMany.mockResolvedValue({});
            ctx.prisma.wishListItem.deleteMany.mockResolvedValue({});
            ctx.prisma.cartItem.deleteMany.mockResolvedValue({});
            ctx.prisma.review.deleteMany.mockResolvedValue({});
            ctx.prisma.address.deleteMany.mockResolvedValue({});
            ctx.prisma.wishList.findUnique.mockResolvedValue({ id: 'wishlist1', userId: input.id });
            ctx.prisma.wishListItem.deleteMany.mockResolvedValue({});
            ctx.prisma.wishList.delete.mockResolvedValue({});
            ctx.prisma.cart.findUnique = vi.fn().mockResolvedValue(null); // If cart logic is present
            ctx.prisma.user.delete.mockResolvedValue({ id: input.id, username: '', email: '', hashedPassword: '', lastLogin: null, imgUrl: null, createdAt: new Date(), updatedAt: new Date() });
            // Act
            const resolver = (crudProcedure.deleteUser as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<User> } })._def.resolver;
            const result = await resolver({ ctx, input });
            // Assert
            expect(ctx.prisma.order.findMany).toHaveBeenCalledWith({ where: { userId: input.id }, select: { id: true } });
            expect(ctx.prisma.orderItem.deleteMany).toHaveBeenCalledWith({ where: { orderId: { in: ['order1', 'order2'] } } });
            expect(ctx.prisma.order.deleteMany).toHaveBeenCalledWith({ where: { userId: input.id } });
            expect(ctx.prisma.review.deleteMany).toHaveBeenCalledWith({ where: { userId: input.id } });
            expect(ctx.prisma.address.deleteMany).toHaveBeenCalledWith({ where: { userId: input.id } });
            expect(ctx.prisma.wishList.findUnique).toHaveBeenCalledWith({ where: { userId: input.id } });
            expect(ctx.prisma.wishListItem.deleteMany).toHaveBeenCalledWith({ where: { wishListId: 'wishlist1' } });
            expect(ctx.prisma.wishList.delete).toHaveBeenCalledWith({ where: { id: 'wishlist1' } });
            expect(ctx.prisma.cart.findUnique).toHaveBeenCalledWith({ where: { userId: input.id } });
            expect(ctx.prisma.user.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(result).toEqual({ id: input.id, username: '', email: '', hashedPassword: '', lastLogin: null, imgUrl: null, createdAt: expect.any(Date), updatedAt: expect.any(Date) });
        });

        it('deleteUser skips wishList deletion if wishList is null', async () => {
            const input = { id: 'user2' };
            ctx.prisma.order.findMany.mockResolvedValue([]);
            ctx.prisma.orderItem.deleteMany.mockResolvedValue({});
            ctx.prisma.order.deleteMany.mockResolvedValue({});
            ctx.prisma.review.deleteMany.mockResolvedValue({});
            ctx.prisma.address.deleteMany.mockResolvedValue({});
            ctx.prisma.wishList.findUnique.mockResolvedValue(null); // No wishList
            ctx.prisma.cart.findUnique = vi.fn().mockResolvedValue(null);
            ctx.prisma.user.delete.mockResolvedValue({ id: input.id, username: '', email: '', hashedPassword: '', lastLogin: null, imgUrl: null, createdAt: new Date(), updatedAt: new Date() });
            const resolver = (crudProcedure.deleteUser as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<User> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.wishListItem.deleteMany).not.toHaveBeenCalledWith({ where: { wishListId: expect.any(String) } });
            expect(ctx.prisma.wishList.delete).not.toHaveBeenCalled();
            expect(result).toEqual({ id: input.id, username: '', email: '', hashedPassword: '', lastLogin: null, imgUrl: null, createdAt: expect.any(Date), updatedAt: expect.any(Date) });
        });

        it('deleteUser skips cart deletion if cart is null', async () => {
            const input = { id: 'user3' };
            ctx.prisma.order.findMany.mockResolvedValue([]);
            ctx.prisma.orderItem.deleteMany.mockResolvedValue({});
            ctx.prisma.order.deleteMany.mockResolvedValue({});
            ctx.prisma.review.deleteMany.mockResolvedValue({});
            ctx.prisma.address.deleteMany.mockResolvedValue({});
            ctx.prisma.wishList.findUnique.mockResolvedValue({ id: 'wishlist2', userId: input.id });
            ctx.prisma.wishListItem.deleteMany.mockResolvedValue({});
            ctx.prisma.wishList.delete.mockResolvedValue({});
            ctx.prisma.cart.findUnique = vi.fn().mockResolvedValue(null); // No cart
            ctx.prisma.user.delete.mockResolvedValue({ id: input.id, username: '', email: '', hashedPassword: '', lastLogin: null, imgUrl: null, createdAt: new Date(), updatedAt: new Date() });
            const resolver = (crudProcedure.deleteUser as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<User> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.cartItem.deleteMany).not.toHaveBeenCalledWith({ where: { cartId: expect.any(String) } });
            expect(ctx.prisma.cart.delete).not.toHaveBeenCalled();
            expect(result).toEqual({ id: input.id, username: '', email: '', hashedPassword: '', lastLogin: null, imgUrl: null, createdAt: expect.any(Date), updatedAt: expect.any(Date) });
        });

        it('deleteAllUsers deletes all users', async () => {
            ctx.prisma.wishListItem.deleteMany.mockResolvedValue({});
            ctx.prisma.wishList.deleteMany.mockResolvedValue({});
            ctx.prisma.cartItem.deleteMany.mockResolvedValue({});
            ctx.prisma.cart.deleteMany.mockResolvedValue({});
            ctx.prisma.review.deleteMany.mockResolvedValue({});
            ctx.prisma.user.deleteMany.mockResolvedValue({ count: 3 });
            const resolver = (crudProcedure.deleteAllUsers as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.wishListItem.deleteMany).toHaveBeenCalledWith({});
            expect(ctx.prisma.wishList.deleteMany).toHaveBeenCalledWith({});
            expect(ctx.prisma.cartItem.deleteMany).toHaveBeenCalledWith({});
            expect(ctx.prisma.cart.deleteMany).toHaveBeenCalledWith({});
            expect(ctx.prisma.review.deleteMany).toHaveBeenCalledWith({});
            expect(ctx.prisma.user.deleteMany).toHaveBeenCalledWith({});
            expect(result).toEqual({ count: 3 });
        });

        it('updateUser updates a user', async () => {
            const input = { id: '1', data: { username: 'updated', email: 'updated@email.com' } };
            const updated: User = {
                id: '1',
                username: 'updated',
                email: 'updated@email.com',
                hashedPassword: '',
                lastLogin: null,
                imgUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            ctx.prisma.user.update.mockResolvedValue(updated);
            const resolver = (crudProcedure.updateUser as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<User> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.user.update).toHaveBeenCalledWith({
                where: { id: input.id },
                data: input.data
            });
            expect(result).toEqual(updated);
        });

        it('findUserById returns a user', async () => {
            const input = { id: '1' };
            const found: User = {
                id: '1',
                username: 'user1',
                email: 'user1@email.com',
                hashedPassword: 'pass',
                lastLogin: null,
                imgUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            ctx.prisma.user.findUnique.mockResolvedValue(found);
            const resolver = (crudProcedure.findUserById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<User | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { cart: true, orders: true, addresses: true, wishList: true, reviews: true } });
            expect(result).toEqual(found);
        });
    });

    describe('Address CRUD', () => {
        it('getAddresses returns addresses', async () => {
            const addresses: Address[] = [{
                id: '1',
                userId: '1',
                address: '123 Main St',
                city: 'City',
                state: 'State',
                country: 'Country',
                zipCode: '12345',
                default: false,
            }];
            ctx.prisma.address.findMany.mockResolvedValue(addresses);
            const resolver = (crudProcedure.getAddresses as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<Address[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(addresses);
            expect(ctx.prisma.address.findMany).toHaveBeenCalled();
        });

        it('createAddress creates an address', async () => {
            const input = {
                userId: '2',
                address: '456 Side St',
                city: 'City2',
                state: 'State2',
                country: 'Country2',
                zipCode: '54321',
                default: true,
            };
            const created: Address = {
                id: '2',
                userId: input.userId,
                address: input.address,
                city: input.city,
                state: input.state,
                country: input.country,
                zipCode: input.zipCode,
                default: input.default ?? false,
            };
            ctx.prisma.address.create.mockResolvedValue(created);
            ctx.prisma.address.updateMany.mockResolvedValue({});
            const resolver = (crudProcedure.createAddress as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Address> } })._def.resolver;
            const result = await resolver({ ctx, input });
            // If default is true, updateMany should be called
            expect(ctx.prisma.address.updateMany).toHaveBeenCalledWith({ where: { userId: input.userId }, data: { default: false } });
            expect(ctx.prisma.address.create).toHaveBeenCalledWith({ data: input, include: { user: true } });
            expect(result).toEqual(created);
        });

        it('deleteAddress deletes an address', async () => {
            const input = { id: '3' };
            const deleted: Address = {
                id: '3',
                userId: '',
                address: '',
                city: '',
                state: '',
                country: '',
                zipCode: '',
                default: false,
            };
            ctx.prisma.address.delete.mockResolvedValue(deleted);
            const resolver = (crudProcedure.deleteAddress as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Address> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.address.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(result).toEqual(deleted);
        });

        it('deleteAllAddresses deletes all addresses', async () => {
            ctx.prisma.address.deleteMany.mockResolvedValue({ count: 2 });
            const resolver = (crudProcedure.deleteAllAddresses as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.address.deleteMany).toHaveBeenCalled();
            expect(result).toEqual({ count: 2 });
        });

        it('updateAddress updates an address', async () => {
            const input = { id: '1', data: { address: 'New Address', default: true } };
            const updated: Address = {
                id: '1',
                userId: '2',
                address: 'New Address',
                city: '',
                state: '',
                country: '',
                zipCode: '',
                default: true,
            };
            ctx.prisma.address.update.mockResolvedValue(updated);
            ctx.prisma.address.findUnique.mockResolvedValue(updated); // for default logic
            ctx.prisma.address.updateMany.mockResolvedValue({});
            const resolver = (crudProcedure.updateAddress as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Address> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.address.update).toHaveBeenCalledWith({ where: { id: input.id }, data: input.data, include: { user: true } });
            expect(result).toEqual(updated);
        });

        it('findAddressById returns an address', async () => {
            const input = { id: '1' };
            const found: Address = {
                id: '1',
                userId: '2',
                address: 'New Address',
                city: '',
                state: '',
                country: '',
                zipCode: '',
                default: true,
            };
            ctx.prisma.address.findUnique.mockResolvedValue(found);
            const resolver = (crudProcedure.findAddressById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Address | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.address.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { user: true } });
            expect(result).toEqual(found);
        });
    });

    describe('WishList CRUD', () => {
        type WishList = {
            id: string;
            userId: string;
            user?: unknown;
            wishListItems?: unknown[];
        };
        it('createWishList creates a wishlist', async () => {
            const input = { userId: 'user1' };
            const created: WishList = { id: 'w1', userId: input.userId, user: {}, wishListItems: [] };
            ctx.prisma.wishList.create.mockResolvedValue(created);
            const resolver = (crudProcedure.createWishList as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<WishList> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(created);
            expect(ctx.prisma.wishList.create).toHaveBeenCalledWith({ data: { userId: input.userId }, include: { user: true, wishListItems: true } });
        });

        it('deleteWishList deletes wishlist and related items', async () => {
            const input = { id: 'w1' };
            ctx.prisma.wishListItem.deleteMany.mockResolvedValue({});
            const deleted: WishList = { id: 'w1', userId: 'user1' };
            ctx.prisma.wishList.delete.mockResolvedValue(deleted);
            const resolver = (crudProcedure.deleteWishList as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<WishList> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.wishListItem.deleteMany).toHaveBeenCalledWith({ where: { wishListId: input.id } });
            expect(ctx.prisma.wishList.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(result).toEqual(deleted);
        });

        it('deleteAllWishLists deletes all wishlists and items', async () => {
            ctx.prisma.wishListItem.deleteMany.mockResolvedValue({});
            ctx.prisma.wishList.deleteMany.mockResolvedValue({ count: 2 });
            const resolver = (crudProcedure.deleteAllWishLists as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.wishListItem.deleteMany).toHaveBeenCalledWith({});
            expect(ctx.prisma.wishList.deleteMany).toHaveBeenCalledWith({});
            expect(result).toEqual({ count: 2 });
        });

        it('updateWishList updates a wishlist', async () => {
            const input = { id: 'w1', data: { userId: 'user2' } };
            const updated: WishList = { id: 'w1', userId: 'user2', user: {}, wishListItems: [] };
            ctx.prisma.wishList.update.mockResolvedValue(updated);
            const resolver = (crudProcedure.updateWishList as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<WishList> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.wishList.update).toHaveBeenCalledWith({ where: { id: input.id }, data: input.data, include: { user: true, wishListItems: true } });
            expect(result).toEqual(updated);
        });

        it('findWishListById returns a wishlist', async () => {
            const input = { id: 'w1' };
            const found: WishList = { id: 'w1', userId: 'user1', user: {}, wishListItems: [] };
            ctx.prisma.wishList.findUnique.mockResolvedValue(found);
            const resolver = (crudProcedure.findWishListById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<WishList | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.wishList.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { user: true, wishListItems: true } });
            expect(result).toEqual(found);
        });
    });

    describe('WishListItem CRUD', () => {
        type WishListItem = {
            id: string;
            productId: string;
            wishListId: string | null;
            product?: unknown;
            WishList?: unknown;
        };
        it('getWishListItems returns wishlist items', async () => {
            const items: WishListItem[] = [
                { id: 'i1', productId: 'p1', wishListId: 'w1', product: {}, WishList: {} }
            ];
            ctx.prisma.wishListItem.findMany = vi.fn().mockResolvedValue(items);
            const resolver = (crudProcedure.getWishListItems as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<WishListItem[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(items);
            expect(ctx.prisma.wishListItem.findMany).toHaveBeenCalledWith({
                include: { product: true, WishList: true },
                where: { productId: { not: undefined } }
            });
        });
        it('createWishListItem creates a wishlist item', async () => {
            const input = { productId: 'p1', wishListId: 'w1' };
            const created: WishListItem = { id: 'i2', productId: input.productId, wishListId: input.wishListId, product: {}, WishList: {} };
            ctx.prisma.wishListItem.create = vi.fn().mockResolvedValue(created);
            const resolver = (crudProcedure.createWishListItem as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<WishListItem> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(created);
            expect(ctx.prisma.wishListItem.create).toHaveBeenCalledWith({ data: { productId: input.productId, wishListId: input.wishListId }, include: { product: true, WishList: true } });
        });
        it('deleteWishListItem deletes a wishlist item', async () => {
            const input = { id: 'i3' };
            const deleted: WishListItem = { id: 'i3', productId: 'p2', wishListId: 'w2' };
            ctx.prisma.wishListItem.delete = vi.fn().mockResolvedValue(deleted);
            const resolver = (crudProcedure.deleteWishListItem as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<WishListItem> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.wishListItem.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(result).toEqual(deleted);
        });
        it('deleteAllWishListItems deletes all wishlist items', async () => {
            ctx.prisma.wishListItem.deleteMany.mockResolvedValue({ count: 4 });
            const resolver = (crudProcedure.deleteAllWishListItems as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.wishListItem.deleteMany).toHaveBeenCalledWith({});
            expect(result).toEqual({ count: 4 });
        });
        it('updateWishListItem updates a wishlist item', async () => {
            const input = { id: 'i4', data: { productId: 'p3', wishListId: 'w3' } };
            const updated: WishListItem = { id: 'i4', productId: 'p3', wishListId: 'w3', product: {}, WishList: {} };
            ctx.prisma.wishListItem.update = vi.fn().mockResolvedValue(updated);
            const resolver = (crudProcedure.updateWishListItem as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<WishListItem> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.wishListItem.update).toHaveBeenCalledWith({ where: { id: input.id }, data: input.data, include: { product: true, WishList: true } });
            expect(result).toEqual(updated);
        });
        it('findWishListItemById returns a wishlist item', async () => {
            const input = { id: 'i5' };
            const found: WishListItem = { id: 'i5', productId: 'p4', wishListId: 'w4', product: {}, WishList: {} };
            ctx.prisma.wishListItem.findUnique = vi.fn().mockResolvedValue(found);
            const resolver = (crudProcedure.findWishListItemById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<WishListItem | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.wishListItem.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { product: true, WishList: true } });
            expect(result).toEqual(found);
        });
    });

    describe('Review CRUD', () => {
        type Review = {
            id: string;
            userId: string;
            productId: string;
            rating: number;
            comment?: string | null;
            createdAt: Date;
            updatedAt: Date;
        };

        it('getReviews returns reviews', async () => {
            const reviews: Review[] = [
                {
                    id: '1',
                    userId: 'u1',
                    productId: 'p1',
                    rating: 5,
                    comment: 'Great!',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            ctx.prisma.review.findMany = vi.fn().mockResolvedValue(reviews);
            const resolver = (crudProcedure.getReviews as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<Review[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(reviews);
            expect(ctx.prisma.review.findMany).toHaveBeenCalled();
        });

        it('createReview creates a review', async () => {
            const input = { userId: 'u1', productId: 'p1', rating: 4, comment: 'Nice' };
            const created: Review = { ...input, id: '2', createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.review.create.mockResolvedValue(created);
            // Mock allReviews for average rating calculation
            ctx.prisma.review.findMany.mockResolvedValue([]);
            ctx.prisma.product.update.mockResolvedValue({});
            const resolver = (crudProcedure.createReview as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Review> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(created);
            expect(ctx.prisma.review.create).toHaveBeenCalledWith({ data: input });
        });

        it('deleteReview deletes a review', async () => {
            const input = { id: '3' };
            const deleted: Review = { id: '3', userId: 'u2', productId: 'p2', rating: 3, comment: null, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.review.delete = vi.fn().mockResolvedValue(deleted);
            const resolver = (crudProcedure.deleteReview as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Review> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(deleted);
            expect(ctx.prisma.review.delete).toHaveBeenCalledWith({ where: { id: input.id } });
        });

        it('deleteAllReviews deletes all reviews', async () => {
            ctx.prisma.review.deleteMany = vi.fn().mockResolvedValue({ count: 5 });
            const resolver = (crudProcedure.deleteAllReviews as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.review.deleteMany).toHaveBeenCalled();
            expect(result).toEqual({ count: 5 });
        });

        it('updateReview updates a review', async () => {
            const input = { id: '1', data: { rating: 2, comment: 'Bad' } };
            const updated: Review = { id: '1', userId: 'u1', productId: 'p1', rating: 2, comment: 'Bad', createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.review.update.mockResolvedValue(updated);
            const resolver = (crudProcedure.updateReview as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Review> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(updated);
            expect(ctx.prisma.review.update).toHaveBeenCalledWith({ where: { id: input.id }, data: input.data, include: { product: true, user: true } });
        });

        it('findReviewById returns a review', async () => {
            const input = { id: '1' };
            const found: Review = { id: '1', userId: 'u1', productId: 'p1', rating: 5, comment: 'Great!', createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.review.findUnique.mockResolvedValue(found);
            const resolver = (crudProcedure.findReviewById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Review | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(found);
            expect(ctx.prisma.review.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { product: true, user: true } });
        });
    });

    describe('Order CRUD', () => {
        type Order = {
            id: string;
            userId: string;
            totalPrice?: number | null;
            status?: string;
            itemsCount?: number;
            orderItems?: unknown[];
            createdAt?: Date;
            updatedAt?: Date;
        };

        it('getOrders returns orders', async () => {
            const orders: Order[] = [
                { id: 'o1', userId: 'u1', totalPrice: 100, status: 'pending', itemsCount: 2, orderItems: [], createdAt: new Date(), updatedAt: new Date() }
            ];
            ctx.prisma.order.findMany.mockResolvedValue(orders);
            const resolver = (crudProcedure.getOrders as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<Order[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(orders);
            expect(ctx.prisma.order.findMany).toHaveBeenCalledWith({ include: { user: true, orderItems: { include: { product: { select: { id: true, name: true, price: true } } } } } });
        });

        it('createOrder creates an order', async () => {
            const input = { userId: 'u1', totalPrice: 200, status: 'pending', itemsCount: 2, orderItems: [{ productId: 'p1', quantity: 1, totalPrice: 100 }] };
            const created: Order = { id: 'o2', userId: input.userId, totalPrice: input.totalPrice, status: input.status, itemsCount: input.itemsCount, orderItems: input.orderItems, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.order.create.mockResolvedValue(created);
            const resolver = (crudProcedure.createOrder as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Order> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(created);
            expect(ctx.prisma.order.create).toHaveBeenCalledWith({ data: expect.any(Object), include: { orderItems: true } });
        });

        it('deleteOrder deletes an order', async () => {
            const input = { id: 'o3' };
            const deleted: Order = { id: 'o3', userId: 'u2', totalPrice: 50, status: 'cancelled', itemsCount: 1, orderItems: [], createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.order.delete.mockResolvedValue(deleted);
            ctx.prisma.orderItem.deleteMany.mockResolvedValue({});
            const resolver = (crudProcedure.deleteOrder as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Order> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.orderItem.deleteMany).toHaveBeenCalledWith({ where: { orderId: input.id } });
            expect(ctx.prisma.order.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(result).toEqual(deleted);
        });

        it('deleteAllOrders deletes all orders', async () => {
            ctx.prisma.orderItem.deleteMany.mockResolvedValue({});
            ctx.prisma.order.deleteMany.mockResolvedValue({ count: 3 });
            const resolver = (crudProcedure.deleteAllOrders as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.orderItem.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.order.deleteMany).toHaveBeenCalled();
            expect(result).toEqual({ count: 3 });
        });

        it('updateOrder updates an order', async () => {
            const input = { id: 'o1', data: { totalPrice: 300, status: 'shipped', itemsCount: 3 } };
            const updated: Order = { id: 'o1', userId: 'u1', totalPrice: 300, status: 'shipped', itemsCount: 3, orderItems: [], createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.order.update.mockResolvedValue(updated);
            const resolver = (crudProcedure.updateOrder as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Order> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(updated);
            expect(ctx.prisma.order.update).toHaveBeenCalledWith({ where: { id: input.id }, data: input.data });
        });

        it('findOrderById returns an order', async () => {
            const input = { id: 'o1' };
            const found: Order = { id: 'o1', userId: 'u1', totalPrice: 100, status: 'pending', itemsCount: 2, orderItems: [], createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.order.findUnique.mockResolvedValue(found);
            const resolver = (crudProcedure.findOrderById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Order | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(found);
            expect(ctx.prisma.order.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { user: true, orderItems: true } });
        });
    });

    describe('OrderItem CRUD', () => {
        type Product = { id: string; name?: string; price?: number };
        type Order = { id: string; userId?: string };
        type OrderItem = {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            totalPrice: number;
            order?: Order;
            product?: Product;
        };

        it('getOrderItems returns order items', async () => {
            const items: OrderItem[] = [
                { id: 'oi1', orderId: 'o1', productId: 'p1', quantity: 2, totalPrice: 100, order: { id: 'o1' }, product: { id: 'p1' } }
            ];
            ctx.prisma.orderItem.findMany = vi.fn().mockResolvedValue(items);
            const resolver = (crudProcedure.getOrderItems as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<OrderItem[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(items);
            expect(ctx.prisma.orderItem.findMany).toHaveBeenCalledWith({ include: { order: true, product: true } });
        });

        it('createOrderItem creates an order item and decrements product stock', async () => {
            const input = { orderId: 'o1', productId: 'p1', quantity: 2, totalPrice: 100 };
            const product = { id: 'p1', price: 50, stock: 10 };
            const created: OrderItem = { id: 'oi2', orderId: input.orderId, productId: input.productId, quantity: input.quantity, totalPrice: input.totalPrice, order: { id: 'o1' }, product: { id: 'p1' } };
            ctx.prisma.product.findUnique = vi.fn().mockResolvedValue(product);
            ctx.prisma.product.update = vi.fn().mockResolvedValue({ ...product, stock: 8 });
            ctx.prisma.orderItem.create = vi.fn().mockResolvedValue(created);
            const resolver = (crudProcedure.createOrderItem as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<OrderItem> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: input.productId } });
            expect(ctx.prisma.product.update).toHaveBeenCalledWith({ where: { id: input.productId }, data: { stock: { decrement: input.quantity } } });
            expect(ctx.prisma.orderItem.create).toHaveBeenCalledWith({ data: { orderId: input.orderId, productId: input.productId, quantity: input.quantity, totalPrice: input.totalPrice }, include: { order: true, product: true } });
            expect(result).toEqual(created);
        });

        it('deleteOrderItem deletes an order item and updates order totals', async () => {
            const input = { id: 'oi3' };
            const orderItem = { orderId: 'o2', totalPrice: 50 };
            const deleted: OrderItem = { id: 'oi3', orderId: 'o2', productId: 'p2', quantity: 1, totalPrice: 50 };
            ctx.prisma.orderItem.findUnique = vi.fn().mockResolvedValue(orderItem);
            ctx.prisma.orderItem.delete = vi.fn().mockResolvedValue(deleted);
            ctx.prisma.orderItem.findMany = vi.fn().mockResolvedValue([{ quantity: 2, totalPrice: 100 }]);
            ctx.prisma.order.update = vi.fn().mockResolvedValue({});
            const resolver = (crudProcedure.deleteOrderItem as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<OrderItem> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.orderItem.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, select: { orderId: true, totalPrice: true } });
            expect(ctx.prisma.orderItem.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(ctx.prisma.orderItem.findMany).toHaveBeenCalledWith({ where: { orderId: orderItem.orderId }, select: { quantity: true, totalPrice: true } });
            expect(ctx.prisma.order.update).toHaveBeenCalledWith({ where: { id: orderItem.orderId }, data: { itemsCount: 2, totalPrice: 100 } });
            expect(result).toEqual(deleted);
        });

        it('deleteAllOrderItems deletes all order items', async () => {
            ctx.prisma.orderItem.deleteMany = vi.fn().mockResolvedValue({ count: 4 });
            const resolver = (crudProcedure.deleteAllOrderItems as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.orderItem.deleteMany).toHaveBeenCalled();
            expect(result).toEqual({ count: 4 });
        });

        it('updateOrderItem updates an order item, adjusts stock, and updates order totals', async () => {
            const input = { id: 'oi4', data: { quantity: 3 } };
            const orderItem = { id: 'oi4', orderId: 'o3', productId: 'p3', quantity: 1, product: { id: 'p3', price: 20, stock: 10 } };
            const updated: OrderItem = { id: 'oi4', orderId: 'o3', productId: 'p3', quantity: 3, totalPrice: 60, order: { id: 'o3' }, product: { id: 'p3' } };
            ctx.prisma.orderItem.findUnique = vi.fn().mockResolvedValue(orderItem);
            ctx.prisma.product.update = vi.fn().mockResolvedValue({ ...orderItem.product, stock: 8 });
            ctx.prisma.orderItem.update = vi.fn().mockResolvedValue(updated);
            ctx.prisma.orderItem.findMany = vi.fn().mockResolvedValue([{ quantity: 3, totalPrice: 60 }]);
            ctx.prisma.order.update = vi.fn().mockResolvedValue({});
            const resolver = (crudProcedure.updateOrderItem as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<OrderItem> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.orderItem.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { product: true } });
            expect(ctx.prisma.product.update).toHaveBeenCalledWith({ where: { id: orderItem.product.id }, data: { stock: { decrement: 2 } } });
            expect(ctx.prisma.orderItem.update).toHaveBeenCalledWith({ where: { id: input.id }, data: { ...input.data, totalPrice: 60 }, include: { order: true, product: true } });
            expect(ctx.prisma.orderItem.findMany).toHaveBeenCalledWith({ where: { orderId: orderItem.orderId }, select: { quantity: true, totalPrice: true } });
            expect(ctx.prisma.order.update).toHaveBeenCalledWith({ where: { id: orderItem.orderId }, data: { itemsCount: 3, totalPrice: 60 } });
            expect(result).toEqual(updated);
        });

        it('findOrderItemById returns an order item', async () => {
            const input = { id: 'oi5' };
            const found: OrderItem = { id: 'oi5', orderId: 'o4', productId: 'p4', quantity: 1, totalPrice: 30, order: { id: 'o4' }, product: { id: 'p4' } };
            ctx.prisma.orderItem.findUnique = vi.fn().mockResolvedValue(found);
            const resolver = (crudProcedure.findOrderItemById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<OrderItem | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.orderItem.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { order: true, product: true } });
            expect(result).toEqual(found);
        });
    });

    describe('Cart CRUD', () => {
        type Cart = {
            id: string;
            userId: string;
            totalPrice?: number | null;
            itemsCount?: number;
            createdAt?: Date;
            updatedAt?: Date;
        };

        it('getCarts returns carts', async () => {
            const carts: Cart[] = [
                { id: 'c1', userId: 'u1', totalPrice: 100, itemsCount: 2, createdAt: new Date(), updatedAt: new Date() }
            ];
            ctx.prisma.cart.findMany = vi.fn().mockResolvedValue(carts);
            const resolver = (crudProcedure.getCarts as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<Cart[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(carts);
            expect(ctx.prisma.cart.findMany).toHaveBeenCalledWith({ include: { user: true, cartItems: true } });
        });

        it('createCart creates a cart', async () => {
            const input = { userId: 'u1', totalPrice: 150 };
            const created: Cart = { id: 'c2', userId: input.userId, totalPrice: input.totalPrice, itemsCount: 0, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.cart.create = vi.fn().mockResolvedValue(created);
            const resolver = (crudProcedure.createCart as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Cart> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(created);
            expect(ctx.prisma.cart.create).toHaveBeenCalledWith({ data: { userId: input.userId, totalPrice: input.totalPrice, itemsCount: 0 }, include: { user: true, cartItems: true } });
        });

        it('deleteCart deletes a cart and related cart items', async () => {
            const input = { id: 'c3' };
            ctx.prisma.cartItem.deleteMany = vi.fn().mockResolvedValue({});
            const deleted: Cart = { id: 'c3', userId: 'u2', totalPrice: 50, itemsCount: 1, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.cart.delete.mockResolvedValue(deleted);
            const resolver = (crudProcedure.deleteCart as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Cart> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: input.id } });
            expect(ctx.prisma.cart.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(result).toEqual(deleted);
        });

        it('deleteAllCarts deletes all carts and cart items', async () => {
            ctx.prisma.cartItem.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.cart.deleteMany = vi.fn().mockResolvedValue({ count: 2 });
            const resolver = (crudProcedure.deleteAllCarts as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.cartItem.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.cart.deleteMany).toHaveBeenCalled();
            expect(result).toEqual({ count: 2 });
        });

        it('updateCart updates a cart', async () => {
            const input = { id: 'c1', data: { totalPrice: 200, itemsCount: 3 } };
            const updated: Cart = { id: 'c1', userId: 'u1', totalPrice: 200, itemsCount: 3, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.cart.update = vi.fn().mockResolvedValue(updated);
            const resolver = (crudProcedure.updateCart as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Cart> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(updated);
            expect(ctx.prisma.cart.update).toHaveBeenCalledWith({ where: { id: input.id }, data: input.data, include: { user: true, cartItems: true } });
        });

        it('findCartById returns a cart', async () => {
            const input = { id: 'c1' };
            const found: Cart = { id: 'c1', userId: 'u1', totalPrice: 100, itemsCount: 2, createdAt: new Date(), updatedAt: new Date() };
            ctx.prisma.cart.findUnique.mockResolvedValue(found);
            const resolver = (crudProcedure.findCartById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Cart | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(result).toEqual(found);
            expect(ctx.prisma.cart.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { user: true, cartItems: true } });
        });
    });

    describe('CartItem CRUD', () => {
        type Product = { id: string; name?: string; price?: number };
        type Cart = { id: string; userId: string };
        type CartItem = {
            id: string;
            cartId: string;
            productId: string;
            quantity: number;
            totalPrice: number;
            cart?: Cart;
            product?: Product;
        };

        it('getCartItems returns cart items', async () => {
            const items: CartItem[] = [
                { id: 'ci1', cartId: 'c1', productId: 'p1', quantity: 2, totalPrice: 100, cart: { id: 'c1', userId: 'u1' }, product: { id: 'p1' } }
            ];
            ctx.prisma.cartItem.findMany = vi.fn().mockResolvedValue(items);
            const resolver = (crudProcedure.getCartItems as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<CartItem[]> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(result).toEqual(items);
            expect(ctx.prisma.cartItem.findMany).toHaveBeenCalledWith({ include: { cart: true, product: true } });
        });

        it('createCartItem creates a cart item and updates cart totals', async () => {
            const input = { cartId: 'c1', productId: 'p1', quantity: 2, totalPrice: 100 };
            const product = { id: 'p1', price: 50 };
            const created: CartItem = { id: 'ci2', cartId: input.cartId, productId: input.productId, quantity: input.quantity ?? 1, totalPrice: 100, cart: { id: 'c1', userId: 'u1' }, product: { id: 'p1' } };
            ctx.prisma.product.findUnique = vi.fn().mockResolvedValue(product);
            ctx.prisma.cartItem.create = vi.fn().mockResolvedValue(created);
            ctx.prisma.cartItem.findMany = vi.fn().mockResolvedValue([{ quantity: 2, totalPrice: 100 }]);
            ctx.prisma.cart.update = vi.fn().mockResolvedValue({});
            const resolver = (crudProcedure.createCartItem as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<CartItem> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: input.productId } });
            expect(ctx.prisma.cartItem.create).toHaveBeenCalledWith({ data: { cartId: input.cartId, productId: input.productId, quantity: input.quantity ?? 1, totalPrice: 100 }, include: { cart: true, product: true } });
            expect(ctx.prisma.cartItem.findMany).toHaveBeenCalledWith({ where: { cartId: input.cartId }, select: { quantity: true, totalPrice: true } });
            expect(ctx.prisma.cart.update).toHaveBeenCalledWith({ where: { id: input.cartId }, data: { itemsCount: 2, totalPrice: 100 } });
            expect(result).toEqual(created);
        });

        it('deleteCartItem deletes a cart item and updates cart totals', async () => {
            const input = { id: 'ci3' };
            const cartItem = { cartId: 'c2', totalPrice: 50 };
            const deleted: CartItem = { id: 'ci3', cartId: 'c2', productId: 'p2', quantity: 1, totalPrice: 50 };
            ctx.prisma.cartItem.findUnique = vi.fn().mockResolvedValue(cartItem);
            ctx.prisma.cartItem.delete = vi.fn().mockResolvedValue(deleted);
            ctx.prisma.cartItem.findMany = vi.fn().mockResolvedValue([{ quantity: 2, totalPrice: 100 }]);
            ctx.prisma.cart.update = vi.fn().mockResolvedValue({});
            const resolver = (crudProcedure.deleteCartItem as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<CartItem> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.cartItem.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, select: { cartId: true, totalPrice: true } });
            expect(ctx.prisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: input.id } });
            expect(ctx.prisma.cartItem.findMany).toHaveBeenCalledWith({ where: { cartId: cartItem.cartId }, select: { quantity: true, totalPrice: true } });
            expect(ctx.prisma.cart.update).toHaveBeenCalledWith({ where: { id: cartItem.cartId }, data: { itemsCount: 2, totalPrice: 100 } });
            expect(result).toEqual(deleted);
        });

        it('deleteAllCartItems deletes all cart items', async () => {
            ctx.prisma.cartItem.deleteMany = vi.fn().mockResolvedValue({ count: 3 });
            const resolver = (crudProcedure.deleteAllCartItems as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.cartItem.deleteMany).toHaveBeenCalledWith({});
            expect(result).toEqual({ count: 3 });
        });

        it('updateCartItem updates a cart item and updates cart totals', async () => {
            const input = { id: 'ci4', data: { quantity: 3 } };
            const cartItem = { id: 'ci4', cartId: 'c3', productId: 'p3', quantity: 1, product: { id: 'p3', price: 20 } };
            const updated: CartItem = { id: 'ci4', cartId: 'c3', productId: 'p3', quantity: 3, totalPrice: 60, cart: { id: 'c3', userId: 'u3' }, product: { id: 'p3' } };
            ctx.prisma.cartItem.findUnique = vi.fn().mockResolvedValue(cartItem);
            ctx.prisma.cartItem.update = vi.fn().mockResolvedValue(updated);
            ctx.prisma.cartItem.findMany = vi.fn().mockResolvedValue([{ quantity: 3, totalPrice: 60 }]);
            ctx.prisma.cart.update = vi.fn().mockResolvedValue({});
            const resolver = (crudProcedure.updateCartItem as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<CartItem> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.cartItem.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { product: true } });
            expect(ctx.prisma.cartItem.update).toHaveBeenCalledWith({ where: { id: input.id }, data: { ...input.data, totalPrice: 60 }, include: { cart: true, product: true } });
            expect(ctx.prisma.cartItem.findMany).toHaveBeenCalledWith({ where: { cartId: cartItem.cartId }, select: { quantity: true, totalPrice: true } });
            expect(ctx.prisma.cart.update).toHaveBeenCalledWith({ where: { id: cartItem.cartId }, data: { itemsCount: 3, totalPrice: 60 } });
            expect(result).toEqual(updated);
        });

        it('findCartItemById returns a cart item', async () => {
            const input = { id: 'ci5' };
            const found: CartItem = { id: 'ci5', cartId: 'c4', productId: 'p4', quantity: 1, totalPrice: 30, cart: { id: 'c4', userId: 'u4' }, product: { id: 'p4' } };
            ctx.prisma.cartItem.findUnique = vi.fn().mockResolvedValue(found);
            const resolver = (crudProcedure.findCartItemById as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<CartItem | null> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.cartItem.findUnique).toHaveBeenCalledWith({ where: { id: input.id }, include: { cart: true, product: true } });
            expect(result).toEqual(found);
        });
    });

    describe('Universal/Utility Procedures', () => {
        it('deleteAllData deletes all data in correct order', async () => {
            ctx.prisma.wishListItem.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.wishList.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.cartItem.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.cart.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.orderItem.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.order.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.review.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.product.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.category.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.brand.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.address.deleteMany = vi.fn().mockResolvedValue({});
            ctx.prisma.user.deleteMany = vi.fn().mockResolvedValue({ count: 5 });
            const resolver = (crudProcedure.deleteAllData as unknown as { _def: { resolver: (opts: { ctx: Ctx }) => Promise<{ count: number }> } })._def.resolver;
            const result = await resolver({ ctx });
            expect(ctx.prisma.wishListItem.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.wishList.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.cartItem.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.cart.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.orderItem.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.order.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.review.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.product.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.category.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.brand.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.address.deleteMany).toHaveBeenCalled();
            expect(ctx.prisma.user.deleteMany).toHaveBeenCalled();
            expect(result).toEqual({ count: 5 });
        });

        it('findProductByCartItemId returns products by cartItemId', async () => {
            const input = { cartItemId: 'ci1' };
            const products = [{ id: 'p1', name: 'Product 1', price: 10 }];
            ctx.prisma.product.findMany = vi.fn().mockResolvedValue(products);
            const resolver = (crudProcedure.findProductByCartItemId as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<typeof products> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.findMany).toHaveBeenCalledWith({ where: { cartItems: { some: { id: input.cartItemId } } } });
            expect(result).toEqual(products);
        });

        it('findProductByCategoryId returns products by categoryId', async () => {
            const input = { categoryId: 'cat1' };
            const products: Product[] = [];
            ctx.prisma.product.findMany.mockResolvedValue(products);
            const resolver = (crudProcedure.findProductByCategoryId as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Product[]> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.findMany).toHaveBeenCalledWith({
                where: { categoryId: input.categoryId },
                include: { brand: true, category: true }
            });
            expect(result).toEqual(products);
        });
        it('findProductByBrandId returns products by brandId', async () => {
            const input = { brandId: 'brand1' };
            const products: Product[] = [];
            ctx.prisma.product.findMany.mockResolvedValue(products);
            const resolver = (crudProcedure.findProductByBrandId as unknown as { _def: { resolver: (opts: { ctx: Ctx; input: typeof input }) => Promise<Product[]> } })._def.resolver;
            const result = await resolver({ ctx, input });
            expect(ctx.prisma.product.findMany).toHaveBeenCalledWith({
                where: { brandId: input.brandId },
                include: { brand: true, category: true }
            });
            expect(result).toEqual(products);
        });
    });
});
