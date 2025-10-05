import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  console.log("Mongo URI not found please set it in .env file");
}

const connectDB = async () => {
  try {
    const db = await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected", db);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed", err);
    process.exit(1);
  }
};


export default connectDB;