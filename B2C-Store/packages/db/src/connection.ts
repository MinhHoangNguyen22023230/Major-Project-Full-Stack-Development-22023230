import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;

if (!uri) {
    throw new Error("MONGO_URI environment variable is not set");
}

if (!dbName) {
    throw new Error("MONGO_DB_NAME environment variable is not set");
}

const client = new MongoClient(uri);

export async function connectToDatabase() {
    await client.connect();
    console.log(`Connected to database: ${dbName}`);
    return client.db(dbName); // Use the database name from the environment variable
}