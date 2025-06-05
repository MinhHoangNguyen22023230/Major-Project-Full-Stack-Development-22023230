import { z } from "zod";
import { router, publicProcedure } from "../router";
import { hashPassword } from "../utils/hash";

export const crudProcedure = router({
    /*----------------------Brand-------------------------*/
    getBrands: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.brand.findMany({
            include: {
                products: true
            },
        });
    }),

    createBrand: publicProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string().optional(),
                imageUrl: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.brand.create({ data: input });
        }),

    deleteBrand: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {

            // Delete related product
            await ctx.prisma.product.deleteMany({
                where: { brandId: input.id },
            });

            return ctx.prisma.brand.delete({ where: { id: input.id } });
        }),

    deleteAllBrands: publicProcedure.mutation(async ({ ctx }) => {

        await ctx.prisma.product.deleteMany({});

        return ctx.prisma.brand.deleteMany({});
    }),

    updateBrand: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    name: z.string().optional(),
                    description: z.string().optional(),
                    imageUrl: z.string().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.brand.update({
                where: { id: input.id },
                data: input.data,
            });
        }),

    findBrandById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.brand.findUnique({
                where: { id: input.id },
                include: {
                    products: true,
                },
            });
        }),

    /*----------------------Category-------------------------*/
    getCategories: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.category.findMany({
            include: {
                products: true,
            },
        });
    }),

    createCategory: publicProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string().optional(),
                imageUrl: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.category.create({
                data: input,
            });
        }),

    deleteCategory: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {

            // Delete related product
            await ctx.prisma.product.deleteMany({
                where: { categoryId: input.id },
            });
            return ctx.prisma.category.delete({
                where: { id: input.id },
            });
        }),

    deleteAllCategories: publicProcedure.mutation(async ({ ctx }) => {
        await ctx.prisma.product.deleteMany({});
        return ctx.prisma.category.deleteMany({});
    }),

    updateCategory: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    name: z.string().optional(),
                    description: z.string().optional(),
                    imageUrl: z.string().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.category.update({
                where: { id: input.id },
                data: input.data,
            });
        }),

    findCategoryById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.category.findUnique({
                where: { id: input.id },
                include: {
                    products: true,
                },
            });
        }),
    /*----------------------Product-------------------------*/
    getProducts: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.product.findMany({
            include: {
                category: true,
                brand: true,
                wishListItems: true,
                cartItems: true,
                orderItems: true,
                reviews: true,
            },
        });
    }),

    createProduct: publicProcedure
        .input(
            z.object({
                name: z.string(),
                price: z.number(),
                description: z.string(),
                imageUrl: z.string(),
                stock: z.number(),
                salePrice: z.number().optional(),
                releaseDate: z.string().optional(),
                rating: z.number().optional(),
                categoryId: z.string(),
                brandId: z.string()
            }))

        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.product.create({
                data: {
                    ...input,
                    releaseDate: input.releaseDate ? new Date(input.releaseDate) : undefined,
                },
                include: {
                    category: true,
                    brand: true,
                    wishListItems: true,
                    cartItems: true,
                    orderItems: true,
                    reviews: true,
                },
            });
        }),

    deleteProduct: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Delete related wishlist items
            await ctx.prisma.wishListItem.deleteMany({
                where: { productId: input.id },
            });

            // Delete related order items
            await ctx.prisma.orderItem.deleteMany({
                where: { productId: input.id },
            });

            // Delete related cart items
            await ctx.prisma.cartItem.deleteMany({
                where: { productId: input.id },
            });

            // Delete related review
            await ctx.prisma.review.deleteMany({
                where: { productId: input.id },
            });

            // Finally, delete the product
            return ctx.prisma.product.delete({
                where: { id: input.id },
            });
        }),

    deleteAllProducts: publicProcedure.mutation(async ({ ctx }) => {
        // Delete all related wishlist items
        await ctx.prisma.wishListItem.deleteMany({});

        // Delete all related order items
        await ctx.prisma.orderItem.deleteMany({});

        // Delete all related cart items
        await ctx.prisma.cartItem.deleteMany({});

        // Delete all related review
        await ctx.prisma.review.deleteMany({});

        // Finally, delete all products
        return ctx.prisma.product.deleteMany({});
    }),

    updateProduct: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    name: z.string().optional(),
                    price: z.number().optional(),
                    description: z.string().optional(),
                    imageUrl: z.string().optional(),
                    stock: z.number().optional(),
                    salePrice: z.number().optional(),
                    releaseDate: z.string().optional(),
                    rating: z.number().optional(),
                    categoryId: z.string().optional(),
                    brandId: z.string().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.product.update({
                where: { id: input.id },
                data: {
                    ...input.data,
                    releaseDate: input.data.releaseDate
                        ? new Date(input.data.releaseDate)
                        : undefined,
                },
                include: {
                    category: true,
                    brand: true,
                    wishListItems: true,
                    cartItems: true,
                    orderItems: true,
                    reviews: true,
                },
            });
        }),

    findProductById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.product.findUnique({
                where: { id: input.id },
                include: {
                    category: true,
                    brand: true,
                    wishListItems: true,
                    cartItems: true,
                    orderItems: true,
                    reviews: true,
                },
            });
        }),
    /*----------------------User-------------------------*/
    getUsers: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.user.findMany({
            include: {
                cart: true,
                orders: true,
                addresses: true,
                wishList: true,
                reviews: true,
            },
        });
    }),

    createUser: publicProcedure
        .input(
            z.object({
                username: z.string(),
                email: z.string(),
                password: z.string(), // Accept plain password from input
                imgUrl: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const hashedPassword = await hashPassword(input.password);
            return ctx.prisma.user.create({
                data: {
                    username: input.username,
                    email: input.email,
                    hashedPassword,
                    imgUrl: input.imgUrl,
                },
            });
        }),

    deleteUser: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Delete related reviews
            await ctx.prisma.review.deleteMany({
                where: { userId: input.id },
            });

            // Delete related addresses
            await ctx.prisma.address.deleteMany({
                where: { userId: input.id },
            });

            // Delete related orderItems for all user's orders
            const userOrders = await ctx.prisma.order.findMany({
                where: { userId: input.id },
                select: { id: true },
            });
            const orderIds = userOrders.map((order) => order.id);
            if (orderIds.length > 0) {
                await ctx.prisma.orderItem.deleteMany({
                    where: { orderId: { in: orderIds } },
                });
            }

            // Delete related orders
            await ctx.prisma.order.deleteMany({
                where: { userId: input.id },
            });

            // Delete related wish list items and wish list
            const wishList = await ctx.prisma.wishList.findUnique({
                where: { userId: input.id },
            });
            if (wishList) {
                await ctx.prisma.wishListItem.deleteMany({
                    where: { wishListId: wishList.id },
                });
                await ctx.prisma.wishList.delete({
                    where: { id: wishList.id },
                });
            }

            // Delete related cart items and cart
            const cart = await ctx.prisma.cart.findUnique({
                where: { userId: input.id },
            });
            if (cart) {
                await ctx.prisma.cartItem.deleteMany({
                    where: { cartId: cart.id },
                });
                await ctx.prisma.cart.delete({
                    where: { id: cart.id },
                });
            }

            // Finally, delete the user
            return ctx.prisma.user.delete({
                where: { id: input.id },
            });
        }),

    deleteAllUsers: publicProcedure.mutation(async ({ ctx }) => {
        // Delete all related reviews
        await ctx.prisma.review.deleteMany({});

        // Delete all related addresses
        await ctx.prisma.address.deleteMany({});

        // Delete all related orders
        await ctx.prisma.order.deleteMany({});

        // Delete all related wish lists and their items
        await ctx.prisma.wishListItem.deleteMany({});
        await ctx.prisma.wishList.deleteMany({});

        // Delete all related carts and their items
        await ctx.prisma.cartItem.deleteMany({});
        await ctx.prisma.cart.deleteMany({});

        // Finally, delete all users
        return ctx.prisma.user.deleteMany({});
    }),

    updateUser: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    username: z.string().optional(),
                    email: z.string().optional(),
                    hashedPassword: z.string().optional(),
                    imgUrl: z.string().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const updateData = { ...input.data };
            if (updateData.hashedPassword) {
                updateData.hashedPassword = await hashPassword(updateData.hashedPassword);
            }
            return ctx.prisma.user.update({
                where: { id: input.id },
                data: updateData,
                include: {
                    cart: true,
                    orders: true,
                    addresses: true,
                    wishList: true,
                    reviews: true,
                },
            });
        }),

    findUserById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.user.findUnique({
                where: { id: input.id },
                include: {
                    cart: true,
                    orders: true,
                    addresses: true,
                    wishList: true,
                    reviews: true,
                },
            });
        }),

    /*----------------------Admin-------------------------*/
    updateAdmin: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    username: z.string().optional(),
                    email: z.string().optional(),
                    hashedPassword: z.string().optional(),
                    imageUrl: z.string().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.admin.update({
                where: { id: input.id },
                data: input.data,
            });
        }),

    findAdminById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.admin.findUnique({
                where: { id: input.id },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    imageUrl: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        }),

    /*----------------------Address-------------------------*/
    getAddresses: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.address.findMany({
            include: {
                user: true, // Include the related user
            },
        });
    }),

    createAddress: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                address: z.string(),
                city: z.string(),
                state: z.string(),
                country: z.string(),
                zipCode: z.string(),
                default: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // If default is true, unset default for all other addresses for this user
            if (input.default) {
                await ctx.prisma.address.updateMany({
                    where: { userId: input.userId },
                    data: { default: false },
                });
            }
            return ctx.prisma.address.create({
                data: {
                    userId: input.userId,
                    address: input.address,
                    city: input.city,
                    state: input.state,
                    country: input.country,
                    zipCode: input.zipCode,
                    default: input.default ?? false,
                },
                include: { user: true },
            });
        }),

    deleteAddress: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.address.delete({
                where: { id: input.id },
            });
        }),

    deleteAllAddresses: publicProcedure.mutation(async ({ ctx }) => {
        return ctx.prisma.address.deleteMany({});
    }),

    updateAddress: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    address: z.string().optional(),
                    city: z.string().optional(),
                    state: z.string().optional(),
                    country: z.string().optional(),
                    zipCode: z.string().optional(),
                    default: z.boolean().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // If setting this address as default, unset default for all other addresses for this user
            if (input.data.default) {
                // Find the address to get userId
                const addr = await ctx.prisma.address.findUnique({ where: { id: input.id } });
                if (addr) {
                    await ctx.prisma.address.updateMany({
                        where: { userId: addr.userId, NOT: { id: input.id } },
                        data: { default: false },
                    });
                }
            }
            return ctx.prisma.address.update({
                where: { id: input.id },
                data: input.data,
                include: { user: true },
            });
        }),

    findAddressById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.address.findUnique({
                where: { id: input.id },
                include: {
                    user: true, // Include the related user
                },
            });
        }),
    /*----------------------Cart-------------------------*/
    getCarts: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.cart.findMany({
            include: {
                user: true, // Include the related user
                cartItems: true, // Include related cart items
            },
        });
    }),

    createCart: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                totalPrice: z.number().optional(), // Optional field
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.cart.create({
                data: {
                    userId: input.userId,
                    totalPrice: input.totalPrice || 0,
                    itemsCount: 0,
                },
                include: {
                    user: true, cartItems: true,
                },
            });
        }),

    deleteCart: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // First, delete all related cart items
            await ctx.prisma.cartItem.deleteMany({
                where: { cartId: input.id },
            });

            // Then, delete the cart
            return ctx.prisma.cart.delete({
                where: { id: input.id },
            });
        }),

    deleteAllCarts: publicProcedure.mutation(async ({ ctx }) => {
        // First, delete all related cart items
        await ctx.prisma.cartItem.deleteMany({});

        // Then, delete all carts
        return ctx.prisma.cart.deleteMany({});
    }),

    updateCart: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    userId: z.string().optional(),
                    totalPrice: z.number().optional(), // Optional field
                    itemsCount: z.number().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.cart.update({
                where: { id: input.id },
                data: input.data,
                include: {
                    user: true, cartItems: true,
                },
            });
        }),

    findCartById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.cart.findUnique({
                where: { id: input.id },
                include: {
                    user: true, // Include the related user
                    cartItems: true, // Include related cart items
                },
            });
        }),
    /*----------------------CartItem-------------------------*/
    getCartItems: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.cartItem.findMany({
            include: {
                cart: true, // Include the related cart
                product: true, // Include the related product
            },
        });
    }),

    createCartItem: publicProcedure
        .input(
            z.object({
                cartId: z.string(),
                productId: z.string(),
                quantity: z.number().optional(),
                totalPrice: z.number().optional(), // Optional field
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Default quantity to 1 if not provided or invalid
            const quantity = typeof input.quantity === 'number' && input.quantity > 0 ? input.quantity : 1;
            // Fetch product to get price
            const product = await ctx.prisma.product.findUnique({ where: { id: input.productId } });
            if (!product) throw new Error('Product not found');
            const itemTotalPrice = product.price * quantity;
            const cartItem = await ctx.prisma.cartItem.create({
                data: {
                    cartId: input.cartId,
                    productId: input.productId,
                    quantity,
                    totalPrice: itemTotalPrice,
                },
                include: {
                    cart: true, // Include the related cart
                    product: true, // Include the related product
                },
            });
            // Update the cart's itemsCount and totalPrice
            const allItems = await ctx.prisma.cartItem.findMany({
                where: { cartId: input.cartId },
                select: { quantity: true, totalPrice: true },
            });
            const itemsCount = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const totalPrice = allItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            await ctx.prisma.cart.update({
                where: { id: input.cartId },
                data: { itemsCount, totalPrice },
            });
            return cartItem;
        }),

    deleteCartItem: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Find the cartId and totalPrice before deleting
            const cartItem = await ctx.prisma.cartItem.findUnique({
                where: { id: input.id },
                select: { cartId: true, totalPrice: true },
            });
            const deleted = await ctx.prisma.cartItem.delete({
                where: { id: input.id },
            });
            // After deletion, recalculate itemsCount and totalPrice for the cart
            if (cartItem && cartItem.cartId) {
                const allItems = await ctx.prisma.cartItem.findMany({
                    where: { cartId: cartItem.cartId },
                    select: { quantity: true, totalPrice: true },
                });
                const itemsCount = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                const totalPrice = allItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
                await ctx.prisma.cart.update({
                    where: { id: cartItem.cartId },
                    data: { itemsCount, totalPrice },
                });
            }
            return deleted;
        }),

    deleteAllCartItems: publicProcedure.mutation(async ({ ctx }) => {
        return ctx.prisma.cartItem.deleteMany({});
    }),

    updateCartItem: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    cartId: z.string().optional(),
                    productId: z.string().optional(),
                    quantity: z.number().optional(),
                    totalPrice: z.number().optional(), // Optional field
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // If quantity is provided and invalid, default to 1
            const updateData = { ...input.data };
            if ('quantity' in updateData && (typeof updateData.quantity !== 'number' || updateData.quantity < 1)) {
                updateData.quantity = 1;
            }
            // Fetch the cart item and product
            const cartItem = await ctx.prisma.cartItem.findUnique({
                where: { id: input.id },
                include: { product: true },
            });
            if (!cartItem) throw new Error('Cart item not found');
            // If quantity or productId is being updated, recalculate totalPrice
            const newQuantity = updateData.quantity ?? cartItem.quantity;
            const product = updateData.productId && updateData.productId !== cartItem.productId
                ? (await ctx.prisma.product.findUnique({ where: { id: updateData.productId } }) ?? (() => { throw new Error('Product not found'); })())
                : cartItem.product;
            updateData.totalPrice = product.price * newQuantity;
            const updatedCartItem = await ctx.prisma.cartItem.update({
                where: { id: input.id },
                data: updateData,
                include: {
                    cart: true, // Include the related cart
                    product: true, // Include the related product
                },
            });
            // After update, recalculate itemsCount and totalPrice for the cart
            const cartId = updateData.cartId || updatedCartItem.cartId;
            const allItems = await ctx.prisma.cartItem.findMany({
                where: { cartId },
                select: { quantity: true, totalPrice: true },
            });
            const itemsCount = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const totalPrice = allItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            await ctx.prisma.cart.update({
                where: { id: cartId },
                data: { itemsCount, totalPrice },
            });
            return updatedCartItem;
        }),

    findCartItemById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.cartItem.findUnique({
                where: { id: input.id },
                include: {
                    cart: true, // Include the related cart
                    product: true, // Include the related product
                },
            });
        }),
    /*----------------------Order-------------------------*/
    getOrders: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.order.findMany({
            include: {
                user: true,
                orderItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });
    }),

    createOrder: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                totalPrice: z.number().optional(),
                status: z.string().optional(),
                itemsCount: z.number().optional(),
                orderItems: z.array(
                    z.object({
                        productId: z.string(),
                        quantity: z.number(),
                        totalPrice: z.number(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const order = await ctx.prisma.order.create({
                data: {
                    userId: input.userId,
                    totalPrice: input.totalPrice,
                    status: input.status,
                    itemsCount: input.itemsCount ?? input.orderItems.reduce((sum, item) => sum + item.quantity, 0),
                    orderItems: {
                        create: input.orderItems,
                    },
                },
                include: {
                    orderItems: true,
                },
            });
            return order;
        }),

    deleteOrder: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Delete related order items
            await ctx.prisma.orderItem.deleteMany({
                where: { orderId: input.id },
            });

            // Finally, delete the order
            return ctx.prisma.order.delete({
                where: { id: input.id },
            });
        }),

    deleteAllOrders: publicProcedure.mutation(async ({ ctx }) => {
        // Delete all related order items
        await ctx.prisma.orderItem.deleteMany({});

        // Finally, delete all orders
        return ctx.prisma.order.deleteMany({});
    }),

    updateOrder: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    totalPrice: z.number().optional(),
                    status: z.string().optional(),
                    itemsCount: z.number().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.order.update({
                where: { id: input.id },
                data: input.data,
            });
        }),

    findOrderById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.order.findUnique({
                where: { id: input.id },
                include: {
                    user: true, // Include the related user
                    orderItems: true, // Include related order items
                },
            });
        }),
    /*----------------------OrderItem-------------------------*/
    getOrderItems: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.orderItem.findMany({
            include: {
                order: true, // Include the related order
                product: true, // Include the related product
            },
        });
    }),

    createOrderItem: publicProcedure
        .input(
            z.object({
                orderId: z.string(),
                productId: z.string(),
                quantity: z.number().optional(),
                totalPrice: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Default quantity to 1 if not provided or invalid
            const quantity = typeof input.quantity === 'number' && input.quantity > 0 ? input.quantity : 1;
            // Deduct stock from product
            const product = await ctx.prisma.product.findUnique({ where: { id: input.productId } });
            if (!product) throw new Error('Product not found');
            if ((product.stock ?? 0) < quantity) throw new Error('Not enough stock');
            await ctx.prisma.product.update({
                where: { id: input.productId },
                data: { stock: { decrement: quantity } },
            });
            // Create order item
            return ctx.prisma.orderItem.create({
                data: {
                    orderId: input.orderId,
                    productId: input.productId,
                    quantity,
                    totalPrice: input.totalPrice ?? 0,
                },
                include: {
                    order: true,
                    product: true,
                },
            });
        }),

    deleteOrderItem: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Find the orderId and totalPrice before deleting
            const orderItem = await ctx.prisma.orderItem.findUnique({
                where: { id: input.id },
                select: { orderId: true, totalPrice: true },
            });
            const deleted = await ctx.prisma.orderItem.delete({
                where: { id: input.id },
            });
            // After deletion, recalculate itemsCount and totalPrice for the order
            if (orderItem && orderItem.orderId) {
                const allItems = await ctx.prisma.orderItem.findMany({
                    where: { orderId: orderItem.orderId },
                    select: { quantity: true, totalPrice: true },
                });
                const itemsCount = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                const totalPrice = allItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
                await ctx.prisma.order.update({
                    where: { id: orderItem.orderId },
                    data: { itemsCount, totalPrice },
                });
            }
            return deleted;
        }),

    deleteAllOrderItems: publicProcedure.mutation(async ({ ctx }) => {
        return ctx.prisma.orderItem.deleteMany({});
    }),

    updateOrderItem: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    orderId: z.string().optional(),
                    productId: z.string().optional(),
                    quantity: z.number().optional(),
                    totalPrice: z.number().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Find the existing order item
            const orderItem = await ctx.prisma.orderItem.findUnique({ where: { id: input.id }, include: { product: true } });
            if (!orderItem) throw new Error('Order item not found');
            // If quantity is being updated, adjust product stock accordingly
            const newQuantity = input.data.quantity ?? orderItem.quantity;
            const oldQuantity = orderItem.quantity;
            const product = input.data.productId && input.data.productId !== orderItem.productId
                ? (await ctx.prisma.product.findUnique({ where: { id: input.data.productId } }) ?? (() => { throw new Error('Product not found'); })())
                : orderItem.product;
            if (newQuantity !== oldQuantity) {
                const diff = newQuantity - oldQuantity;
                if (diff > 0 && (product.stock ?? 0) < diff) throw new Error('Not enough stock');
                await ctx.prisma.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: diff } },
                });
            }
            // Always recalculate totalPrice
            const updateData = { ...input.data };
            updateData.totalPrice = product.price * newQuantity;
            const updatedOrderItem = await ctx.prisma.orderItem.update({
                where: { id: input.id },
                data: updateData,
                include: {
                    order: true,
                    product: true,
                },
            });
            // After update, recalculate itemsCount and totalPrice for the order
            const orderId = updateData.orderId || updatedOrderItem.orderId;
            const allItems = await ctx.prisma.orderItem.findMany({
                where: { orderId },
                select: { quantity: true, totalPrice: true },
            });
            const itemsCount = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const totalPrice = allItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            await ctx.prisma.order.update({
                where: { id: orderId },
                data: { itemsCount, totalPrice },
            });
            return updatedOrderItem;
        }),

    findOrderItemById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.orderItem.findUnique({
                where: { id: input.id },
                include: {
                    order: true, // Include the related order
                    product: true, // Include the related product
                },
            });
        }),
    /*----------------------WishList-------------------------*/
    getWishLists: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.wishList.findMany({
            include: {
                user: true, // Include the related user
                wishListItems: true, // Include related wishlist items
            },
        });
    }),

    createWishList: publicProcedure
        .input(
            z.object({
                userId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.wishList.create({
                data: {
                    userId: input.userId,
                },
                include: {
                    user: true, // Include the related user
                    wishListItems: true, // Include related wishlist items
                },
            });
        }),

    deleteWishList: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Delete related wishlist items
            await ctx.prisma.wishListItem.deleteMany({
                where: { wishListId: input.id },
            });

            // Finally, delete the wishlist
            return ctx.prisma.wishList.delete({
                where: { id: input.id },
            });
        }),

    deleteAllWishLists: publicProcedure.mutation(async ({ ctx }) => {
        // Delete all related wishlist items
        await ctx.prisma.wishListItem.deleteMany({});

        // Finally, delete all wishlists
        return ctx.prisma.wishList.deleteMany({});
    }),

    updateWishList: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    userId: z.string().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.wishList.update({
                where: { id: input.id },
                data: input.data,
                include: {
                    user: true, // Include the related user
                    wishListItems: true, // Include related wishlist items
                },
            });
        }),

    findWishListById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.wishList.findUnique({
                where: { id: input.id },
                include: {
                    user: true, // Include the related user
                    wishListItems: true, // Include related wishlist items
                },
            });
        }),
    /*----------------------WishListItem-------------------------*/
    getWishListItems: publicProcedure.query(async ({ ctx }) => {
        // Only return wishlist items where the related product exists
        return ctx.prisma.wishListItem.findMany({
            where: {
                productId: { not: undefined }, // Only include items with a valid productId
            },
            include: {
                product: true, // Include the related product
                WishList: true, // Include the related wishlist
            },
        });
    }),

    createWishListItem: publicProcedure
        .input(
            z.object({
                productId: z.string(),
                wishListId: z.string().optional(), // Optional field
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.wishListItem.create({
                data: {
                    productId: input.productId,
                    wishListId: input.wishListId || null, // Default to null if not provided
                },
                include: {
                    product: true, // Include the related product
                    WishList: true, // Include the related wishlist
                },
            });
        }),

    deleteWishListItem: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.wishListItem.delete({
                where: { id: input.id },
            });
        }),

    deleteAllWishListItems: publicProcedure.mutation(async ({ ctx }) => {
        return ctx.prisma.wishListItem.deleteMany({});
    }),

    updateWishListItem: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    productId: z.string().optional(),
                    wishListId: z.string().optional(), // Optional field
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.wishListItem.update({
                where: { id: input.id },
                data: input.data,
                include: {
                    product: true, // Include the related product
                    WishList: true, // Include the related wishlist
                },
            });
        }),

    findWishListItemById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.wishListItem.findUnique({
                where: { id: input.id },
                include: {
                    product: true, // Include the related product
                    WishList: true, // Include the related wishlist
                },
            });
        }),
    /*----------------------Review-------------------------*/
    getReviews: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.review.findMany({
            include: {
                user: true, // Include the related user
                product: true, // Include the related product
            },
        });
    }),

    createReview: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                productId: z.string(),
                rating: z.number(),
                comment: z.string().optional(), // Optional field
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.review.create({
                data: {
                    userId: input.userId,
                    productId: input.productId,
                    rating: input.rating,
                    comment: input.comment || null, // Default to null if not provided
                },
                include: {
                    user: true, // Include the related user
                    product: true, // Include the related product
                },
            });
        }),

    deleteReview: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.review.delete({
                where: { id: input.id },
            });
        }),

    deleteAllReviews: publicProcedure.mutation(async ({ ctx }) => {
        return ctx.prisma.review.deleteMany({});
    }),

    updateReview: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    rating: z.number().optional(),
                    comment: z.string().optional(), // Optional field
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.review.update({
                where: { id: input.id },
                data: input.data,
                include: {
                    user: true, // Include the related user
                    product: true, // Include the related product
                },
            });
        }),

    findReviewById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.review.findUnique({
                where: { id: input.id },
                include: {
                    user: true, // Include the related user
                    product: true, // Include the related product
                },
            });
        }),
    /*----------------------Universal-------------------------*/

    /*----------------------Delete All Data-------------------------*/
    deleteAllData: publicProcedure.mutation(async ({ ctx }) => {
        // Delete all related data in the correct order to respect relationships

        // Delete all related wishlist items
        await ctx.prisma.wishListItem.deleteMany({});

        // Delete all related wishlists
        await ctx.prisma.wishList.deleteMany({});

        // Delete all related cart items
        await ctx.prisma.cartItem.deleteMany({});

        // Delete all related carts
        await ctx.prisma.cart.deleteMany({});

        // Delete all related order items
        await ctx.prisma.orderItem.deleteMany({});

        // Delete all related orders
        await ctx.prisma.order.deleteMany({});

        // Delete all related reviews
        await ctx.prisma.review.deleteMany({});

        // Delete all related products
        await ctx.prisma.product.deleteMany({});

        // Delete all related categories
        await ctx.prisma.category.deleteMany({});

        // Delete all related brands
        await ctx.prisma.brand.deleteMany({});

        // Delete all related addresses
        await ctx.prisma.address.deleteMany({});


        // Finally, delete all users
        return ctx.prisma.user.deleteMany({});
    }),

    findProductByCartItemId: publicProcedure
        .input(z.object({ cartItemId: z.string() }))
        .query(async ({ ctx, input }) => {
            // Find all products by cartItemId
            return ctx.prisma.product.findMany({
                where: { cartItems: { some: { id: input.cartItemId } } },
            });
        }),

    findProductByCategoryId: publicProcedure
        .input(z.object({ categoryId: z.string() }))
        .query(async ({ ctx, input }) => {
            // Find all products by categoryId, include category and brand for UI
            return ctx.prisma.product.findMany({
                where: { categoryId: input.categoryId },
                include: {
                    category: true,
                    brand: true,
                },
            });
        }),

    findProductByBrandId: publicProcedure
        .input(z.object({ brandId: z.string() }))
        .query(async ({ ctx, input }) => {
            // Find all products by brandId, include category and brand for UI
            return ctx.prisma.product.findMany({
                where: { brandId: input.brandId },
                include: {
                    category: true,
                    brand: true,
                },
            });
        }),
})