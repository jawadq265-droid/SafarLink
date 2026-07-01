import "dotenv/config";
import db from "./config/db.js";
import Booking from "./models/booking.model.js";

const clearData = async () => {
  await db();
  try {
    const res = await Booking.deleteMany({});
    console.log(`Successfully cleared ${res.deletedCount} booking records from database.`);
    process.exit(0);
  } catch (error) {
    console.error("Error clearing bookings:", error);
    process.exit(1);
  }
};

clearData();
