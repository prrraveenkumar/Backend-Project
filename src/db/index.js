import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        
        console.log(`\n✅ MONGODB connected! HOST: ${conn.connection.host}\n`);

    } catch (error) {
        console.error("❌ MONGODB CONNECTION ERROR:", error.message);
        process.exit(1);
    }
};

export default connectDB;
