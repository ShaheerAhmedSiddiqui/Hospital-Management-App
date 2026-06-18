import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected ${conn.connection.host}`);
    } catch (error) {
        console.log(`Failed to connected ${error}`);
        process.exit(1);
    }
}
export default  connectDB;