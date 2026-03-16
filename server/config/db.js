import mongoose from "mongoose";

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB connection failed");
    console.error(error);
    process.exit(1);
  }
};

export default db;