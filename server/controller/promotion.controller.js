import Promotion from "../models/promotion.model.js";
import Subscriber from "../models/subscriber.model.js";
import nodemailer from "nodemailer";

const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Format date for friendly email display
 */
const formatFriendlyDate = (date) => {
  if (!date) return "Limited Time";
  try {
    const d = new Date(date);
    return d.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
};

/**
 * Dispatches the promotion notification email to all active newsletter subscribers
 */
export const sendPromotionToSubscribers = async (promotion) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("[Promotion Email]: EMAIL_USER or EMAIL_PASS not set. Skipping subscriber broadcast.");
      return { success: false, sentCount: 0, reason: "Mail credentials not configured" };
    }

    const subscribers = await Subscriber.find({});
    if (!subscribers || subscribers.length === 0) {
      console.log("[Promotion Email]: No subscribers found in database.");
      return { success: true, sentCount: 0, reason: "No subscribers found" };
    }

    const transporter = createGmailTransporter();
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    const formattedExpiry = formatFriendlyDate(promotion.expiryDate);
    const discountDisplay =
      promotion.discountType === "percentage"
        ? `${promotion.discountValue}% OFF`
        : `Rs. ${promotion.discountValue} FLAT DISCOUNT`;

    const bannerHtml = promotion.imageUrl
      ? `
        <div style="margin-bottom: 24px; text-align: center;">
          <img src="${promotion.imageUrl}" alt="${promotion.title}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 8px; border: 1px solid #e5dfd5;" />
        </div>
      `
      : "";

    const minAmountHtml =
      promotion.minBookingAmount && promotion.minBookingAmount > 0
        ? `<p style="margin: 6px 0 0 0; font-size: 12px; color: #888;">* Applicable on bookings of Rs. ${promotion.minBookingAmount} or more.</p>`
        : "";

    let successfulDispatches = 0;
    const recipientEmails = subscribers.map((s) => s.email).filter(Boolean);

    // Send emails in concurrent batches to avoid SMTP throttling
    const emailPromises = recipientEmails.map(async (email) => {
      try {
        await transporter.sendMail({
          from: `"SafarLink Special Offers" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `✨ Exclusive Deal: ${promotion.title} - ${discountDisplay}!`,
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 25px; color: #222; max-width: 600px; margin: auto; background-color: #fcfaf7; border: 1px solid #e5dfd5; border-radius: 10px;">
              
              <!-- Brand Header -->
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1b1b1b; margin: 0; font-size: 28px; letter-spacing: 3px;">SAFAR<span style="color: #aa8453; font-style: italic;">LINK</span></h1>
                <p style="color: #aa8453; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px; font-weight: bold;">VIP Subscriber Exclusive Offer</p>
              </div>

              <!-- Picture Banner if provided -->
              ${bannerHtml}

              <!-- Main Hero Box -->
              <div style="background-color: #1b1b1b; color: #ffffff; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px; border: 1px solid #aa8453;">
                <span style="display: inline-block; background-color: #aa8453; color: #ffffff; font-size: 12px; font-weight: bold; letter-spacing: 2px; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px;">
                  ${discountDisplay}
                </span>
                <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">${promotion.title}</h2>
                <p style="color: #d1c7bc; font-size: 14px; line-height: 1.6; margin: 0;">
                  ${promotion.message}
                </p>
              </div>

              <!-- Promo Code Voucher Box -->
              <div style="background: #ffffff; padding: 22px; border-radius: 8px; border: 2px dashed #aa8453; text-align: center; margin-bottom: 24px;">
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; font-weight: bold;">Use Promo Code at Checkout</p>
                <div style="display: inline-block; background: #fdf8f0; border: 1px solid #aa8453; padding: 10px 24px; border-radius: 6px; font-size: 26px; font-weight: bold; letter-spacing: 4px; color: #1b1b1b;">
                  ${promotion.code}
                </div>
                <div style="margin-top: 14px; color: #b45309; font-size: 13px; font-weight: bold;">
                  ⏰ Valid until: <span style="color: #1b1b1b;">${formattedExpiry}</span>
                </div>
                ${minAmountHtml}
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${clientUrl}/bus" style="background-color: #aa8453; color: #ffffff; text-decoration: none; padding: 14px 36px; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border-radius: 4px; display: inline-block; box-shadow: 0 4px 12px rgba(170, 132, 83, 0.35);">
                  Book Your Seat Now
                </a>
              </div>

              <!-- Footer -->
              <hr style="border: 0; border-top: 1px solid #e5dfd5; margin: 20px 0;" />
              <div style="text-align: center; color: #888; font-size: 11px; line-height: 1.5;">
                <p style="margin: 0 0 5px 0;">You received this exclusive promotion because you are subscribed to SafarLink Newsletter.</p>
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} SafarLink Luxury Inter-City Transit. All rights reserved.</p>
              </div>

            </div>
          `,
        });
        successfulDispatches++;
      } catch (err) {
        console.error(`[Promotion Email] Failed to send to ${email}:`, err.message);
      }
    });

    await Promise.allSettled(emailPromises);

    console.log(`[Promotion Email] Broadcast complete: ${successfulDispatches}/${recipientEmails.length} sent successfully.`);

    // Update promotion with notification stats
    await Promotion.findByIdAndUpdate(promotion._id, {
      notifiedSubscribers: true,
      subscribersNotifiedCount: successfulDispatches,
      lastNotifiedAt: new Date(),
    });

    return {
      success: true,
      sentCount: successfulDispatches,
      totalSubscribers: recipientEmails.length,
    };
  } catch (error) {
    console.error("[Promotion Email] General dispatch error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * GET /api/v1/promotions
 * Retrieve all promotions (supports filter by status)
 */
export const getPromotions = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status === "active") {
      filter.isActive = true;
      filter.expiryDate = { $gte: new Date() };
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status === "expired") {
      filter.expiryDate = { $lt: new Date() };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const promotions = await Promotion.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: promotions.length,
      promotions,
    });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch promotions" });
  }
};

/**
 * GET /api/v1/promotions/:id
 * Retrieve a single promotion
 */
export const getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found" });
    }
    return res.status(200).json({ success: true, promotion });
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/promotions
 * Super Admin: Create a new promotion & optionally notify newsletter subscribers
 */
export const createPromotion = async (req, res) => {
  try {
    const {
      title,
      message,
      code,
      discountType = "percentage",
      discountValue,
      maxDiscount,
      minBookingAmount,
      expiryDate,
      startDate,
      imageUrl,
      isActive = true,
      usageLimit,
      notifySubscribers = true,
    } = req.body;

    if (!title || !message || !code || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Title, message, promo code, discount value, and expiry date are required.",
      });
    }

    const cleanCode = String(code).trim().toUpperCase();

    // Check uniqueness of code
    const existing = await Promotion.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Promo code "${cleanCode}" already exists. Please choose a unique code.`,
      });
    }

    // Validate expiry date
    const parsedExpiry = new Date(expiryDate);
    if (isNaN(parsedExpiry.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid expiry date provided." });
    }

    const newPromotion = await Promotion.create({
      title: title.trim(),
      message: message.trim(),
      code: cleanCode,
      discountType: discountType === "fixed" ? "fixed" : "percentage",
      discountValue: Number(discountValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minBookingAmount: minBookingAmount ? Number(minBookingAmount) : 0,
      expiryDate: parsedExpiry,
      startDate: startDate ? new Date(startDate) : new Date(),
      imageUrl: imageUrl ? imageUrl.trim() : "",
      isActive: Boolean(isActive),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      createdBy: req.body.createdBy || "Super Admin",
    });

    let notifyResult = null;
    if (notifySubscribers && newPromotion.isActive && new Date(newPromotion.expiryDate) >= new Date()) {
      // Trigger notification in background or async
      notifyResult = await sendPromotionToSubscribers(newPromotion);
    }

    return res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      promotion: newPromotion,
      notifyResult,
    });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create promotion" });
  }
};

/**
 * PUT /api/v1/promotions/:id
 * Super Admin: Update an existing promotion
 */
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      message,
      code,
      discountType,
      discountValue,
      maxDiscount,
      minBookingAmount,
      expiryDate,
      startDate,
      imageUrl,
      isActive,
      usageLimit,
    } = req.body;

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found" });
    }

    if (code) {
      const cleanCode = String(code).trim().toUpperCase();
      if (cleanCode !== promotion.code) {
        const existing = await Promotion.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `Promo code "${cleanCode}" is already in use by another promotion.`,
          });
        }
        promotion.code = cleanCode;
      }
    }

    if (title !== undefined) promotion.title = title.trim();
    if (message !== undefined) promotion.message = message.trim();
    if (discountType !== undefined) promotion.discountType = discountType;
    if (discountValue !== undefined) promotion.discountValue = Number(discountValue);
    if (maxDiscount !== undefined) promotion.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (minBookingAmount !== undefined) promotion.minBookingAmount = Number(minBookingAmount);
    if (expiryDate !== undefined) promotion.expiryDate = new Date(expiryDate);
    if (startDate !== undefined) promotion.startDate = new Date(startDate);
    if (imageUrl !== undefined) promotion.imageUrl = imageUrl.trim();
    if (isActive !== undefined) promotion.isActive = Boolean(isActive);
    if (usageLimit !== undefined) promotion.usageLimit = usageLimit ? Number(usageLimit) : null;

    await promotion.save();

    return res.status(200).json({
      success: true,
      message: "Promotion updated successfully",
      promotion,
    });
  } catch (error) {
    console.error("Error updating promotion:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update promotion" });
  }
};

/**
 * DELETE /api/v1/promotions/:id
 * Super Admin: Delete a promotion
 */
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Promotion.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Promotion not found" });
    }
    return res.status(200).json({
      success: true,
      message: `Promotion "${deleted.code}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete promotion" });
  }
};

/**
 * PATCH /api/v1/promotions/:id/toggle-status
 * Super Admin: Toggle active / inactive status
 */
export const togglePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found" });
    }

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    return res.status(200).json({
      success: true,
      message: `Promotion "${promotion.code}" is now ${promotion.isActive ? "Active" : "Deactivated"}`,
      promotion,
    });
  } catch (error) {
    console.error("Error toggling promotion status:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/promotions/:id/notify-subscribers
 * Super Admin: Broadcast / re-broadcast promotion to all newsletter subscribers
 */
export const notifySubscribers = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found" });
    }

    if (!promotion.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot send notification for an inactive promotion. Please activate it first.",
      });
    }

    if (new Date(promotion.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send notification for an expired promotion.",
      });
    }

    const result = await sendPromotionToSubscribers(promotion);

    return res.status(200).json({
      success: true,
      message: `Notification broadcast completed: ${result.sentCount || 0} emails dispatched.`,
      result,
    });
  } catch (error) {
    console.error("Error notifying subscribers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/promotions/validate
 * Public / Booking User: Validates a promo code against a booking total amount
 */
export const validatePromoCode = async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Promo code is required",
      });
    }

    const bookingAmount = Number(amount) || 0;
    if (bookingAmount <= 0) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "A valid booking amount is required to apply a promo code.",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const promotion = await Promotion.findOne({ code: cleanCode });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Promo code "${cleanCode}" does not exist.`,
      });
    }

    // 1. Check if active
    if (!promotion.isActive) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Promo code "${cleanCode}" is currently inactive.`,
      });
    }

    // 2. Check if expired
    const now = new Date();
    if (new Date(promotion.expiryDate) < now) {
      const expiryFormatted = formatFriendlyDate(promotion.expiryDate);
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Promo code "${cleanCode}" expired on ${expiryFormatted}.`,
      });
    }

    // 3. Check start date if scheduled for future
    if (promotion.startDate && new Date(promotion.startDate) > now) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Promo code "${cleanCode}" is not active yet.`,
      });
    }

    // 4. Check usage limit if configured
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Promo code "${cleanCode}" has reached its maximum usage limit.`,
      });
    }

    // 5. Check minimum booking amount
    if (promotion.minBookingAmount && bookingAmount < promotion.minBookingAmount) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Promo code requires a minimum booking amount of Rs. ${promotion.minBookingAmount}. (Your current amount: Rs. ${bookingAmount})`,
      });
    }

    // 6. Calculate discount amount
    let discountAmount = 0;
    if (promotion.discountType === "percentage") {
      discountAmount = Math.round((bookingAmount * promotion.discountValue) / 100);
      if (promotion.maxDiscount && promotion.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscount);
      }
    } else {
      // Fixed discount
      discountAmount = Math.min(promotion.discountValue, bookingAmount);
    }

    const finalAmount = Math.max(0, bookingAmount - discountAmount);

    return res.status(200).json({
      success: true,
      valid: true,
      message: `Promo code "${cleanCode}" applied successfully! You saved Rs. ${discountAmount}.`,
      discountDetails: {
        code: promotion.code,
        title: promotion.title,
        message: promotion.message,
        imageUrl: promotion.imageUrl,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        discountAmount: discountAmount,
        originalAmount: bookingAmount,
        finalAmount: finalAmount,
        expiryDate: promotion.expiryDate,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return res.status(500).json({ success: false, valid: false, message: error.message || "Failed to validate promo code" });
  }
};
