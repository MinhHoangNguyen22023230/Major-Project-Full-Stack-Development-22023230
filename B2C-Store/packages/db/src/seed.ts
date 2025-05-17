

import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function main() {
    // Seed Categories
    const electronics = await prisma.category.create({
        data: {
            name: 'Electronics',
        },
    });

    const clothing = await prisma.category.create({
        data: {
            name: 'Clothing',
        },
    });

    // Seed Brands
    const apple = await prisma.brand.create({
        data: {
            name: 'Apple',
        },
    });

    const nike = await prisma.brand.create({
        data: {
            name: 'Nike',
        },
    });

    // Seed Products
    const iphone = await prisma.product.create({
        data: {
            name: 'iPhone 14',
            price: 999.99,
            description: 'The latest iPhone model.',
            imageUrl: 'https://iili.io/36IQswv.md.png',
            categoryId: electronics.id,
            brandId: apple.id,
        },
    });

    const airMax = await prisma.product.create({
        data: {
            name: 'Nike Air Max',
            price: 199.99,
            description: 'Comfortable and stylish sneakers.',
            imageUrl: 'https://iili.io/36IQswv.md.png',
            categoryId: clothing.id,
            brandId: nike.id,
        },
    });

    // Seed Users
    const user = await prisma.user.create({
        data: {
            username: 'john_doe',
            email: 'john.doe@example.com',
            hashedPassword: 'hashedpassword123',
        },
    });

    // Seed Cart
    await prisma.cart.create({
        data: {
            userId: user.id,
        },
    });

    console.log('Database seeded successfully!');
}

main()
    .catch(async (e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });