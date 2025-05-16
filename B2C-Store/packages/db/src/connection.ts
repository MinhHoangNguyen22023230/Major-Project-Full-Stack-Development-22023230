import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
 
// Load environment variables from .env file
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

if (!uri) {
    throw new Error("MONGO_URI environment variable is not set");
}

export async function connectToDatabase() {
    await client.connect();
    return client.db();
}