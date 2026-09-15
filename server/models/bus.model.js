import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    route: {
      type: String,
      required: true,
      trim: true
    },
    from: {
      type: String,
      required: true,
      trim: true
    },
    to: {
      type: String,
      required: true,
      trim: true
    },
    time: {
      type: String,
      default: "08:00 AM",
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    totalSeats: {
      type: Number,
      default: 40
    },
    seatsLeft: {
      type: Number,
      default: 40
    },
    status: {
      type: String,
      default: "Active"
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop"
    },
    busImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200&auto=format&fit=crop"
    },
    isPopular: {
      type: Boolean,
      default: true
    },
    operator: {
      type: String,
      default: "SafarLink Executive"
    }
  },
  { timestamps: true }
);

const Bus = mongoose.model("Bus", busSchema);
export default Bus;
