import { connectToDatabase } from "@/connection";
import { User, Product, Order } from "@/models/models";

async function generateDatabase() {
    try {
        const db = await connectToDatabase();

        // Insert sample users
        const usersCollection = db.collection<User>("users");
        await usersCollection.insertMany([
            { name: "Admin", email: "admin@example.com", role: "admin", createdAt: new Date() },
            { name: "John Doe", email: "john@example.com", role: "user", createdAt: new Date() },
        ]);

        // Insert sample products
        const productsCollection = db.collection<Product>("products");
        await productsCollection.insertMany([
            { name: "Laptop", description: "A powerful laptop", price: 1200, stock: 10, createdAt: new Date() },
            { name: "Phone", description: "A smartphone", price: 800, stock: 20, createdAt: new Date() },
        ]);

        // Insert sample orders
        const ordersCollection = db.collection<Order>("orders");
        await ordersCollection.insertMany([
            { userId: "1", productIds: ["1", "2"], totalAmount: 2000, createdAt: new Date() },
        ]);

        console.log("Database setup completed successfully.");
    } catch (error) {
        console.error("Error setting up the database:", error);
    } finally {
        process.exit();
    }
}

generateDatabase();