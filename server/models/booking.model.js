import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    passengerPhone: { type: String, required: true },
    passengerCnic: { type: String, required: true },
    passengerEmail: { type: String, required: true },
    bus: { type: String, required: true },
    date: { type: String, required: true }, // e.g. "2026-07-02"
    amount: { type: String, required: true },
    seats: { type: [String], required: true },
    routeFrom: { type: String, required: true },
    routeTo: { type: String, required: true },
    departureTime: { type: String, required: true },
    txnRefNo: { type: String },
    type: { type: String, default: "Upcoming" }, // "Upcoming", "Completed"
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
