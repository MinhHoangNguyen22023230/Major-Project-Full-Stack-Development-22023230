import { PrismaClient } from '../generated/client'

export async function main() {
    const prisma = new PrismaClient();
    console.log("🌱 Seeding started...")
    // Seed Brands
    const brand1 = await prisma.brand.create({
        data: {
            name: "Apple",
            description: "Innovative Product",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/brand/682b0b7d587843c2fc3b075f/apple.svg"
        },
    })

    const brand2 = await prisma.brand.create({
        data: {
            name: "Dell",
            description: "Best computer brand",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/brand/682b0b7d587843c2fc3b0760/dell.svg"
        },
    })

    console.log("Brands seeded:", { brand1, brand2 })

    // Seed Categories
    const category1 = await prisma.category.create({
        data: {
            name: "Phone",
            description: "device use for calling",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/category/phone.jpg"
        },
    })

    const category2 = await prisma.category.create({
        data: {
            name: "Computer",
            description: "device use for calling",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/category/computer.jpg"
        },
    })

    console.log("Categories seeded:", { category1, category2 })

    // Seed Products
    const product1 = await prisma.product.create({
        data: {
            name: "Iphone 14",
            price: 100.0,
            description: "Best Iphone",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+product+image.png",
            categoryId: category1.id,
            brandId: brand1.id,
            stock: 50,
            // Optional fields
            salePrice: 90.0,
            releaseDate: new Date(),
            rating: 4.5,
        },
    })

    const product2 = await prisma.product.create({
        data: {
            name: "Dell xps 13",
            price: 200.0,
            description: "smallest laptop",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+product+image.png",
            categoryId: category2.id,
            brandId: brand2.id,
            stock: 30,
            salePrice: 180.0,
            releaseDate: new Date(),
            rating: 4.2,
        },
    })

    const product3 = await prisma.product.create({
        data: {
            name: "Iphone 15",
            price: 100.0,
            description: "Best Iphone",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+product+image.png",
            categoryId: category1.id,
            brandId: brand1.id,
            stock: 50,
            salePrice: 95.0,
            releaseDate: new Date(),
            rating: 4.8,
        },
    })

    const product4 = await prisma.product.create({
        data: {
            name: "Dell xps 14",
            price: 200.0,
            description: "smallest laptop",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+product+image.png",
            categoryId: category2.id,
            brandId: brand2.id,
            stock: 30,
            salePrice: 185.0,
            releaseDate: new Date(),
            rating: 4.3,
        },
    })

    console.log("Products seeded:", { product1, product2, product3, product4 })

    // Seed Users
    const user1 = await prisma.user.create({
        data: {
            username: "hoang",
            email: "hoang@example.com",
            hashedPassword: "$2b$10$eANxaIX6mUbhgZfJ6bRWteNXC8eE43xsHEXZEpJF0J.ELbgP3T67m",
            imgUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+user.png",
            lastLogin: new Date(),
        },
    })

    const user2 = await prisma.user.create({
        data: {
            username: "son",
            email: "son@example.com",
            hashedPassword: "$2b$10$eANxaIX6mUbhgZfJ6bRWteNXC8eE43xsHEXZEpJF0J.ELbgP3T67m",
            imgUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+user.png",
            lastLogin: new Date(),
        },
    })

    console.log("Users seeded:", { user1, user2 })

    // Seed Addresses
    const address1 = await prisma.address.create({
        data: {
            userId: user1.id,
            address: "123 Main St",
            city: "City A",
            state: "State A",
            country: "Country A",
            zipCode: "12345",
            default: true,
        },
    })

    const address2 = await prisma.address.create({
        data: {
            userId: user2.id,
            address: "456 Elm St",
            city: "City B",
            state: "State B",
            country: "Country B",
            zipCode: "67890",
            default: false,
        },
    })

    console.log("Addresses seeded", { address1, address2 })

    // Seed Admin
    const admin1 = await prisma.admin.create({
        data: {
            username: "admin",
            email: "admin@example.com",
            hashedPassword: "$2b$10$dHxT2SChpe8TuYHklkYnZuhYa6ex4bLhrbUtdYtDb8qvdSKZW1feq",
            role: "superadmin",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+user.png",
            lastLogin: new Date(),
        },
    })

    console.log("Admin seeded:", { admin1 })

    // Optionally, seed more related data (orders, reviews, etc.) as needed
    console.log("Seeding completed!")
    await prisma.$disconnect();
}

// Only run main() if this file is executed directly (not imported)
if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
    main()
        .catch(async (e) => {
            console.error(e)
            process.exit(1)
        })
}