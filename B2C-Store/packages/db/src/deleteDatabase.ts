import { connectToDatabase } from "./connection";

async function deleteDatabase() {
    try {
        const db = await connectToDatabase();

        // Get all collection names
        const collections = await db.collections();

        // Drop each collection
        for (const collection of collections) {
            await db.collection(collection.collectionName).drop();
            console.log(`Dropped collection: ${collection.collectionName}`);
        }

        console.log("All collections have been deleted successfully.");
    } catch (error) {
        console.error("Error deleting the database:", error);
    } finally {
        process.exit();
    }
}

deleteDatabase();