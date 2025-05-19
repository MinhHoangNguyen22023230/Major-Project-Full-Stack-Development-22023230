import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()

async function main() {
    // Seed Brands
    const brand1 = await prisma.brand.create({
        data: {
            name: "Apple",
            description: "Innovative Product",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/brand/apple.svg"
        },
    })

    const brand2 = await prisma.brand.create({
        data: {
            name: "Dell",
            description: "Best computer brand",
            imageUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/brand/dell.svg"
        },
    })

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
        },
    })

    // Seed Users
    const user1 = await prisma.user.create({
        data: {
            username: "hoang",
            email: "hoang@example.com",
            hashedPassword: "hashedpassword1",
            imgUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+user.png",
        },
    })

    const user2 = await prisma.user.create({
        data: {
            username: "son",
            email: "son@example.com",
            hashedPassword: "hashedpassword2",
            imgUrl: "https://b2cstorage.s3.ap-southeast-2.amazonaws.com/default/no+image+user.png",
        },
    })

    // Seed Addresses
    await prisma.address.create({
        data: {
            userId: user1.id,
            address: "123 Main St",
            city: "City A",
            state: "State A",
            country: "Country A",
            zipCode: "12345",
        },
    })

    await prisma.address.create({
        data: {
            userId: user2.id,
            address: "456 Elm St",
            city: "City B",
            state: "State B",
            country: "Country B",
            zipCode: "67890",
        },
    })

    console.log("Seeding completed!")
}

main()
    .catch(async (e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })