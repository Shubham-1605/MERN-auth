import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not defined");
        }

        await mongoose.connect(uri);

        console.log("MongoDB connected successfully");

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB runtime error:", err.message);
        });

    } catch (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
};

export default connectDB;