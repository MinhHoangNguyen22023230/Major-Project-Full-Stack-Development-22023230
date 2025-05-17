import { connectToDatabase } from "./connection";
import { User, Product, Order, Review, Category, Brand } from "@/models/models";
import * as fs from "fs/promises";
import * as path from "path";

// Utility function to load JSON data
async function loadJSON<T>(filePath: string): Promise<T[]> {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
}

async function generateDatabase() {
    try {
        const db = await connectToDatabase();

        // Load sample data from JSON files
        const users = await loadJSON<User>(path.join(__dirname, "data/users.json"));
        const products = await loadJSON<Product>(path.join(__dirname, "data/products.json"));
        const reviews = await loadJSON<Review>(path.join(__dirname, "data/reviews.json"));
        const categories = await loadJSON<Category>(path.join(__dirname, "data/categories.json"));
        const brands = await loadJSON<Brand>(path.join(__dirname, "data/brands.json"));

        // Insert sample users
        const usersCollection = db.collection<User>("users");
        await usersCollection.insertMany(users);

        // Insert sample products
        const productsCollection = db.collection<Product>("products");
        await productsCollection.insertMany(products);

        // Insert sample reviews
        const reviewsCollection = db.collection<Review>("reviews");
        await reviewsCollection.insertMany(reviews);

        // Insert sample categories
        const categoriesCollection = db.collection<Category>("categories");
        await categoriesCollection.insertMany(categories);

        // Insert sample brands
        const brandsCollection = db.collection<Brand>("brands");
        await brandsCollection.insertMany(brands);

        console.log("Database setup completed successfully.");
    } catch (error) {
        console.error("Error setting up the database:", error);
    } finally {
        process.exit();
    }
}

generateDatabase();