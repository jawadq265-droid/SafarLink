import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    passengerPhone: { type: String, required: true },
    passengerCnic: { type: String, required: true },
    passengerEmail: { type: String, required: true },
    userEmail: { type: String },
    bus: { type: String, required: true },
    date: { type: String, required: true }, // e.g. "2026-07-02"
    amount: { type: String, required: true },
    seats: { type: [String], required: true },
    routeFrom: { type: String, required: true },
    routeTo: { type: String, required: true },
    departureTime: { type: String, required: true },
    txnRefNo: { type: String },
    status: {
      type: String,
      enum: ["Upcoming", "Boarded", "Completed", "Cancelled", "Refunded"],
      default: "Upcoming"
    },
    type: { type: String, default: "Upcoming" }, // Backwards compatibility
    refundAmount: { type: Number, default: 0 },
    refundPercentage: { type: Number, default: 0 },
    refundStatus: {
      type: String,
      enum: ["None", "Pending", "Processed", "Failed"],
      default: "None"
    },
    cancelledAt: { type: Date },
    cancelledBy: { type: String },
    cancellationReason: { type: String },
    boardedAt: { type: Date },
    qrCodeDataUrl: { type: String },
    promoCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    originalAmount: { type: String, default: null },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
