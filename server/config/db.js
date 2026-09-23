import mongoose from "mongoose";
import dns from "node:dns";

// Fix Node.js DNS SRV resolution issue on Windows for mongodb+srv://
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // fallback silently if not allowed
}

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("MongoDB connection failed");
    console.error(error);
    process.exit(1);
  }
};

export default db;