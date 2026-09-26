import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Promotion title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Promotion message/description is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Promo code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [1, "Discount value must be greater than 0"],
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    minBookingAmount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    notifiedSubscribers: {
      type: Boolean,
      default: false,
    },
    subscribersNotifiedCount: {
      type: Number,
      default: 0,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      default: "Super Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual helper to check if promotion is currently valid and active
promotionSchema.virtual("isExpired").get(function () {
  if (!this.expiryDate) return false;
  return new Date() > new Date(this.expiryDate);
});

// Configure JSON serialization to include virtuals
promotionSchema.set("toJSON", { virtuals: true });
promotionSchema.set("toObject", { virtuals: true });

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;
