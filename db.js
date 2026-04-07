import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://mdkg202_db_user:qwer1234@cluster0.08saakj.mongodb.net/video_app");
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
}; 

export default connectDB;