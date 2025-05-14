import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/major_project";

export const connectToDatabase = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("Connected to MongoDB");
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};