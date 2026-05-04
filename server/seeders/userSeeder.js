import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import db from "../config/db.js";
import "dotenv/config";

const seedUsers = async () => {
  try {
    await db();

    // Clear existing users if needed (optional)
    // await User.deleteMany({});

    const users = [
      {
        name: "Super Admin",
        email: "superadmin@safarlink.com",
        password: await bcrypt.hash("admin123", 10),
        role: "superadmin",
      },
    ];

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create(user);
        console.log(`User ${user.email} created successfully.`);
      } else {
        await User.findOneAndUpdate({ email: user.email }, user);
        console.log(`User ${user.email} updated successfully.`);
      }
    }

    console.log("Seeding completed.");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedUsers();
