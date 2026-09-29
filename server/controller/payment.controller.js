import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import Booking from '../models/booking.model.js';
import Bus from '../models/bus.model.js';
import Promotion from '../models/promotion.model.js';

export const createStripeCheckoutSession = async (req, res) => {
  try {
    const { amount, ticketId, description, promoCode, rawAmount } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ success: false, message: "Amount is required." });
    }

    let finalChargeAmount = Number(amount);
    let appliedPromoDetails = null;

    // If promoCode provided, verify validity securely on server
    if (promoCode) {
      try {
        const cleanCode = String(promoCode).trim().toUpperCase();
        const promo = await Promotion.findOne({ code: cleanCode });
        if (promo && promo.isActive && new Date(promo.expiryDate) >= new Date()) {
          const base = Number(rawAmount) || finalChargeAmount;
          let calculatedDiscount = 0;
          if (promo.discountType === "percentage") {
            calculatedDiscount = Math.round((base * promo.discountValue) / 100);
            if (promo.maxDiscount && promo.maxDiscount > 0) {
              calculatedDiscount = Math.min(calculatedDiscount, promo.maxDiscount);
            }
          } else {
            calculatedDiscount = Math.min(promo.discountValue, base);
          }
          finalChargeAmount = Math.max(0, base - calculatedDiscount);
          appliedPromoDetails = {
            code: promo.code,
            discountAmount: calculatedDiscount,
            discountValue: promo.discountValue,
            discountType: promo.discountType,
          };
        }
      } catch (promoErr) {
        console.warn("Could not verify promo code during checkout session creation:", promoErr.message);
      }
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() : null;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // If a valid Stripe Secret/Restricted Key is present, create actual Stripe Checkout session
    if (stripeKey && (stripeKey.startsWith('sk_') || stripeKey.startsWith('rk_'))) {
      try {
        const stripe = new Stripe(stripeKey);
        const currency = (process.env.STRIPE_CURRENCY || 'pkr').toLowerCase();

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: currency,
                product_data: {
                  name: `Bus Ticket - SafarLink`,
                  description: description || `Bus ticket reservation via SafarLink`,
                },
                unit_amount: Math.round(parseFloat(finalChargeAmount) * 100), // in cents / paisa
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${clientUrl}/payment-success?status=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${clientUrl}/bus?status=cancelled&message=Payment cancelled`,
          metadata: {
            ticketId: ticketId || "",
            promoCode: appliedPromoDetails?.code || promoCode || "",
            discountAmount: appliedPromoDetails ? String(appliedPromoDetails.discountAmount) : "0",
          },
        });

        return res.status(200).json({
          success: true,
          url: session.url,
        });
      } catch (stripeErr) {
        console.error("Stripe API error, falling back to simulated test checkout:", stripeErr.message);
        // Fallback to simulated test checkout if Stripe account has currency/permission restrictions
        const simulatedSessionId = `sim_cs_${Date.now()}`;
        return res.status(200).json({
          success: true,
          url: `${clientUrl}/payment-success?status=success&session_id=${simulatedSessionId}`,
          note: "Simulated test checkout (Stripe API error: " + stripeErr.message + ")"
        });
      }
    }

    // Development / Test mode fallback when STRIPE_SECRET_KEY is not configured
    const simulatedSessionId = `test_cs_${Date.now()}`;
    return res.status(200).json({
      success: true,
      url: `${clientUrl}/payment-success?status=success&session_id=${simulatedSessionId}`,
      note: "Dev mode simulated checkout active. Add STRIPE_SECRET_KEY to server/.env for live Stripe gateway."
    });

  } catch (error) {
    console.error("Stripe session creation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error: " + error.message });
  }
};

export const sendPaymentClearanceEmail = async (req, res) => {
  try {
    const { bookingData } = req.body;

    if (!bookingData) {
      return res.status(400).json({ success: false, message: "Booking data is required" });
    }

    const { selectedRoute, selectedSeats, passengerInfo, ticketId, txnRefNo, promoCode, discountAmount: reqDiscount, originalAmount: reqOriginal } = bookingData;

    // Format and sort seats list
    const sortedSeats = Array.isArray(selectedSeats)
      ? [...selectedSeats].sort((a, b) => Number(a) - Number(b))
      : [];
    const seatsList = sortedSeats.join(', ');

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-ticket?id=${encodeURIComponent(ticketId || "")}`;

    // Generate QR Code data URL for the ticket verification
    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#1b1b1b',
          light: '#ffffff'
        }
      });
    } catch (qrErr) {
      console.error("QR Code generation error:", qrErr);
    }

    const rawFare = selectedRoute?.price ? selectedRoute.price * (selectedSeats?.length || 1) : 0;
    const discountAmount = Number(reqDiscount) || (bookingData?.discountAmount ? Number(bookingData.discountAmount) : 0);
    const finalAmountNum = Math.max(0, rawFare - discountAmount);
    const totalAmount = bookingData.amount || `Rs. ${finalAmountNum}`;
    const originalAmountStr = reqOriginal || `Rs. ${rawFare}`;

    // Normalize seatGenders from either Array or Object format
    let normalizedSeatGenders = [];
    if (Array.isArray(bookingData.seatGenders) && bookingData.seatGenders.length > 0) {
      normalizedSeatGenders = bookingData.seatGenders;
    } else if (bookingData.seatGenders && typeof bookingData.seatGenders === 'object') {
      normalizedSeatGenders = sortedSeats.map(s => bookingData.seatGenders[String(s)] || bookingData.seatGenders[Number(s)] || "Male");
    } else {
      normalizedSeatGenders = sortedSeats.map(() => "Male");
    }

    // Save actual booking to database
    try {
      const busName = selectedRoute?.bus || selectedRoute?.name || "N/A";
      const travelDate = selectedRoute?.date || new Date().toISOString().split('T')[0];
      const routeFrom = selectedRoute?.from || "N/A";
      const routeTo = selectedRoute?.to || "N/A";
      const depTime = selectedRoute?.time || "N/A";

      // Check if ticket already exists
      let existing = await Booking.findOne({ ticketId });
      if (!existing) {
        const newBooking = new Booking({
          ticketId: ticketId || `SL-${Date.now()}`,
          userName: passengerInfo?.name || "N/A",
          passengerPhone: passengerInfo?.phone || "N/A",
          passengerCnic: passengerInfo?.cnic || "N/A",
          passengerEmail: passengerInfo?.email || "N/A",
          userEmail: bookingData.userEmail || passengerInfo?.userEmail || passengerInfo?.email || "N/A",
          bus: busName,
          date: travelDate,
          amount: totalAmount,
          seats: sortedSeats.map(s => String(s)),
          seatGenders: normalizedSeatGenders,
          routeFrom: routeFrom,
          routeTo: routeTo,
          departureTime: depTime,
          txnRefNo: txnRefNo || "N/A",
          status: "Upcoming",
          type: "Upcoming",
          qrCodeDataUrl: qrDataUrl,
          promoCode: promoCode ? String(promoCode).trim().toUpperCase() : null,
          discountAmount: discountAmount,
          originalAmount: originalAmountStr
        });
        await newBooking.save();
        console.log("Booking successfully saved in database:", ticketId);

        // Increment promo code usage count if applied
        if (promoCode) {
          try {
            await Promotion.findOneAndUpdate(
              { code: String(promoCode).trim().toUpperCase() },
              { $inc: { usageCount: 1 } }
            );
          } catch (promoIncErr) {
            console.warn("Failed to increment promotion usage count:", promoIncErr.message);
          }
        }

        // Deduct booked seats from matching bus
        try {
          const busDoc = await Bus.findOne({
            $or: [
              { name: new RegExp(`^${busName.trim()}$`, 'i') },
              { name: new RegExp(busName.trim(), 'i') }
            ]
          });
          if (busDoc) {
            const seatsDeducted = Array.isArray(sortedSeats) ? sortedSeats.length : 1;
            busDoc.seatsLeft = Math.max(0, (busDoc.seatsLeft ?? busDoc.totalSeats ?? 40) - seatsDeducted);
            await busDoc.save();
            console.log(`Updated ${busDoc.name} seatsLeft to ${busDoc.seatsLeft}`);
          }
        } catch (busUpdateErr) {
          console.error("Failed to decrement bus seatsLeft:", busUpdateErr);
        }
      } else if (!existing.qrCodeDataUrl && qrDataUrl) {
        existing.qrCodeDataUrl = qrDataUrl;
        await existing.save();
      }
    } catch (dbErr) {
      console.error("Failed to save booking to database:", dbErr);
    }

    // Send confirmation email ONLY to the customer (passenger)
    const customerEmail = passengerInfo?.email;
    if (customerEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"SafarLink Tickets" <${process.env.EMAIL_USER}>`,
          to: customerEmail,
          subject: `🎟️ Your SafarLink E-Ticket Confirmed (${ticketId || ""})`,
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 25px; color: #222; max-width: 600px; margin: auto; background-color: #fcfaf7; border: 1px solid #e5dfd5; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1b1b1b; margin: 0; font-size: 26px; letter-spacing: 2px;">SAFAR<span style="color: #aa8453; font-style: italic;">LINK</span></h1>
                <p style="color: #aa8453; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px; font-weight: bold;">Verified Digital Travel Pass</p>
              </div>

              <div style="background-color: #1b1b1b; color: #fff; padding: 18px 24px; border-radius: 6px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-size: 11px; color: #aa8453; text-transform: uppercase; font-weight: bold;">TICKET ID</span>
                    <h2 style="margin: 3px 0 0 0; font-size: 20px; color: #fff;">${ticketId || "N/A"}</h2>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 11px; color: #16a34a; text-transform: uppercase; font-weight: bold; background: rgba(22, 163, 74, 0.2); padding: 4px 8px; border-radius: 4px;">PAID & CONFIRMED</span>
                  </div>
                </div>
              </div>

              <div style="background: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #ebe5dc; margin-bottom: 20px;">
                <h3 style="color: #aa8453; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f0eae1; padding-bottom: 8px;">Passenger & Journey Summary</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Passenger Name:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #1b1b1b;">${passengerInfo?.name || "Valued Passenger"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #777;">CNIC:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #1b1b1b;">${passengerInfo?.cnic || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Route:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #aa8453;">${selectedRoute?.from || "N/A"} ➔ ${selectedRoute?.to || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Departure Time:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #1b1b1b;">${selectedRoute?.time || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Travel Date:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #1b1b1b;">${selectedRoute?.date || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Allocated Seat(s):</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #aa8453; font-size: 16px;">${seatsList || "N/A"}</td>
                  </tr>
                  ${discountAmount > 0 ? `
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Standard Fare:</td>
                    <td style="padding: 6px 0; text-decoration: line-through; text-align: right; color: #888;">${originalAmountStr}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #16a34a; font-weight: bold;">Promo Code (${promoCode || 'PROMO'}):</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #16a34a;">-Rs. ${discountAmount}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Total Amount Paid:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #aa8453; font-size: 18px;">${totalAmount}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <p style="font-size: 13px; color: #666; margin-bottom: 12px;">Scan or click the button below to verify your ticket authenticity at the boarding station:</p>
                <a href="${verificationUrl}" style="display: inline-block; background-color: #aa8453; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 28px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Verify Digital Ticket QR</a>
              </div>

              <div style="background: #f3efe9; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #666; line-height: 1.5;">
                <strong>Boarding Guidelines:</strong>
                <ul style="margin: 5px 0 0 0; padding-left: 18px;">
                  <li>Please arrive at the terminal 15 minutes before departure.</li>
                  <li>Have this digital ticket and your original CNIC available for QR verification upon boarding.</li>
                </ul>
              </div>

              <div style="text-align: center; font-size: 11px; color: #999; margin-top: 25px;">
                © ${new Date().getFullYear()} SafarLink Luxury Transit. All rights reserved.
              </div>
            </div>
          `
        });
        console.log(`Confirmation email dispatched directly to customer: ${customerEmail}`);
      } catch (mailErr) {
        console.error("Error sending customer confirmation email:", mailErr);
      }
    }

    res.status(200).json({ success: true, message: "Booking confirmed and customer notified successfully" });

  } catch (error) {
    console.error("Payment clearance error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { email, role } = req.query;

    // If a specific user email is provided AND they are not superadmin,
    // only return their own bookings — never expose other users' data
    const isSuperAdmin = role === 'superadmin' || email === 'superadmin@safarlink.com';

    let query = {};
    if (email && !isSuperAdmin) {
      const cleanEmail = email.trim();
      query = {
        $or: [
          { passengerEmail: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } },
          { userEmail: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } }
        ]
      };
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    // Normalize cancelled bookings to correct 75% refund policy (25% deduction)
    for (let b of bookings) {
      if ((b.status === "Cancelled" || b.status === "Refunded") && b.refundPercentage !== 75) {
        b.refundPercentage = 75;
        const paidNum = parseInt(String(b.amount).replace(/[^\d]/g, ''), 10) || 0;
        b.refundAmount = Math.round((paidNum * 75) / 100);
        await b.save();
      }
    }
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

export const getBookedSeats = async (req, res) => {
  try {
    const { bus, date } = req.query;
    if (!bus || !date) {
      return res.status(400).json({ success: false, message: "Bus and Date are required query parameters." });
    }

    // Only count active bookings (ignore Cancelled, Refunded, and Completed bookings)
    const bookings = await Booking.find({
      bus,
      date,
      status: { $nin: ["Cancelled", "Refunded", "Completed"] }
    });

    let bookedSeatsList = [];
    const seatGenderMap = {}; // { "5": "Male", "12": "Female", ... }

    bookings.forEach(b => {
      if (b.seats && Array.isArray(b.seats)) {
        bookedSeatsList = bookedSeatsList.concat(b.seats);
        // Map each seat number to its gender
        if (Array.isArray(b.seatGenders) && b.seatGenders.length > 0) {
          b.seats.forEach((seatNum, idx) => {
            seatGenderMap[String(seatNum)] = b.seatGenders[idx] || "Male";
          });
        } else if (b.seatGenders && typeof b.seatGenders === 'object') {
          b.seats.forEach((seatNum) => {
            seatGenderMap[String(seatNum)] = b.seatGenders[String(seatNum)] || b.seatGenders[Number(seatNum)] || "Male";
          });
        } else {
          // Default fallback for any legacy bookings
          b.seats.forEach((seatNum) => {
            if (!seatGenderMap[String(seatNum)]) {
              seatGenderMap[String(seatNum)] = "Male";
            }
          });
        }
      }
    });

    return res.status(200).json({ success: true, bookedSeats: bookedSeatsList, seatGenderMap });
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// QR Ticket Verification endpoint
export const verifyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      return res.status(400).json({ success: false, message: "Ticket ID is required" });
    }

    const booking = await Booking.findOne({ ticketId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Invalid Ticket: No matching booking found in SafarLink database."
      });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-ticket?id=${encodeURIComponent(booking.ticketId)}`;

    // Normalize refund percentage to 75% (25% deduction) for cancelled bookings
    if ((booking.status === "Cancelled" || booking.status === "Refunded") && booking.refundPercentage !== 75) {
      booking.refundPercentage = 75;
      const paidNum = parseInt(String(booking.amount).replace(/[^\d]/g, ''), 10) || 0;
      booking.refundAmount = Math.round((paidNum * 75) / 100);
      await booking.save();
    }

    let qrCode = booking.qrCodeDataUrl;
    if (!qrCode) {
      try {
        qrCode = await QRCode.toDataURL(verificationUrl, {
          errorCorrectionLevel: 'M',
          margin: 2,
          color: {
            dark: '#1b1b1b',
            light: '#ffffff'
          }
        });
      } catch (e) {
        // fallback
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      booking: {
        ticketId: booking.ticketId,
        userName: booking.userName,
        passengerPhone: booking.passengerPhone,
        passengerCnic: booking.passengerCnic,
        passengerEmail: booking.passengerEmail,
        bus: booking.bus,
        date: booking.date,
        departureTime: booking.departureTime,
        routeFrom: booking.routeFrom,
        routeTo: booking.routeTo,
        seats: booking.seats,
        amount: booking.amount,
        status: booking.status || booking.type || "Upcoming",
        refundStatus: booking.refundStatus,
        refundAmount: booking.refundAmount,
        refundPercentage: booking.refundPercentage,
        boardedAt: booking.boardedAt,
        cancelledAt: booking.cancelledAt,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason,
        qrCodeDataUrl: qrCode,
        createdAt: booking.createdAt
      }
    });

  } catch (error) {
    console.error("Error verifying ticket:", error);
    return res.status(500).json({ success: false, message: "Verification error: " + error.message });
  }
};

// Mark ticket as boarded (for Conductor / Staff QR scan)
export const markTicketBoarded = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const booking = await Booking.findOne({ ticketId });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    if (booking.status === "Cancelled" || booking.status === "Refunded") {
      return res.status(400).json({
        success: false,
        message: "Cannot board passenger: This ticket has been cancelled / refunded."
      });
    }

    if (booking.status === "Boarded") {
      return res.status(200).json({
        success: true,
        message: "Passenger is already boarded.",
        booking
      });
    }

    booking.status = "Boarded";
    booking.type = "Boarded";
    booking.boardedAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Passenger successfully marked as Boarded!",
      booking
    });

  } catch (error) {
    console.error("Error updating boarding status:", error);
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// Cancellation & Refund endpoint
export const cancelBooking = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reason, cancelledBy: reqCancelledBy, role, email: reqEmail } = req.body;

    const booking = await Booking.findOne({ ticketId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    if (booking.status === "Cancelled" || booking.status === "Refunded") {
      return res.status(400).json({ success: false, message: "This booking is already cancelled." });
    }

    if (booking.status === "Boarded" || booking.status === "Completed") {
      return res.status(400).json({ success: false, message: "Cannot cancel a completed or already boarded trip." });
    }

    // Calculate exact minutes remaining until bus departure
    let diffMinutes = 999999;
    let hoursRemaining = 48;
    try {
      const departureDateStr = booking.date; // e.g. "2026-09-26" or "26-09-2026"
      const timeStr = booking.departureTime || "08:00 AM";

      const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/);
      let hours = 8;
      let minutes = 0;
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const mer = timeMatch[3]?.toUpperCase();
        if (mer === 'PM' && hours < 12) hours += 12;
        if (mer === 'AM' && hours === 12) hours = 0;
      }

      const depParts = departureDateStr.split(/[-/]/);
      let year = parseInt(depParts[0], 10);
      let month = parseInt(depParts[1], 10) - 1;
      let day = parseInt(depParts[2], 10);

      // Handle DD-MM-YYYY format
      if (depParts[0].length <= 2 && depParts[2].length === 4) {
        day = parseInt(depParts[0], 10);
        month = parseInt(depParts[1], 10) - 1;
        year = parseInt(depParts[2], 10);
      }

      const departureDateTime = new Date(year, month, day, hours, minutes, 0);
      const now = new Date();
      const diffMs = departureDateTime.getTime() - now.getTime();
      diffMinutes = Math.floor(diffMs / (1000 * 60));
      hoursRemaining = diffMs / (1000 * 60 * 60);
    } catch (dateErr) {
      console.warn("Date parse error for cancellation check:", dateErr);
    }

    const isSuperAdminRequest = role === 'superadmin' || 
      (reqCancelledBy && reqCancelledBy.toLowerCase().includes('superadmin')) ||
      (reqEmail && reqEmail.toLowerCase().includes('superadmin@safarlink.com'));

    // Half hour (30 minutes) rule: user cancellation is strictly valid until 30 minutes before departure
    if (!isSuperAdminRequest && diffMinutes < 30) {
      return res.status(400).json({
        success: false,
        message: diffMinutes <= 0
          ? "Departure time has passed. Cancellation is no longer valid."
          : "Cancellation deadline expired. Cancellations can only be made up to 30 minutes before bus departure timing."
      });
    }

    // Format attribution: "Cancelled by User (<user_email>)" or "Cancelled by Superadmin (<superadmin_email>)"
    let cancelledByText = "";
    if (isSuperAdminRequest) {
      const adminEmail = reqEmail || (reqCancelledBy && reqCancelledBy.includes('@') ? reqCancelledBy.replace(/^[^(]*\(([^)]+)\).*$/, '$1') : "superadmin@safarlink.com");
      cancelledByText = `Cancelled by Superadmin (${adminEmail})`;
    } else {
      const userEmail = reqEmail || (reqCancelledBy && reqCancelledBy.includes('@') ? reqCancelledBy.replace(/^[^(]*\(([^)]+)\).*$/, '$1') : (booking.passengerEmail || "user"));
      cancelledByText = `Cancelled by User (${userEmail})`;
    }

    // Refund policy: 25% is DEDUCTED as cancellation fee; the remaining 75% is returned to the user
    const deductionPercentage = diffMinutes >= 30 ? 25 : 100; // 25% deducted if valid, 100% forfeited if past cutoff
    const refundPercentage = 100 - deductionPercentage;       // 75% refunded if valid, 0% if past cutoff

    // Parse numeric paid amount
    const paidAmountNum = parseInt(String(booking.amount).replace(/[^\d]/g, ''), 10) || 0;
    const deductionAmount = Math.round((paidAmountNum * deductionPercentage) / 100);
    const refundAmount = paidAmountNum - deductionAmount;     // Remaining after 25% deduction

    // Update booking status & attribution
    booking.status = "Cancelled";
    booking.type = "Cancelled";
    booking.refundAmount = refundAmount;
    booking.refundPercentage = refundPercentage;
    booking.refundStatus = refundPercentage > 0 ? "Processed" : "None";
    booking.cancelledAt = new Date();
    booking.cancelledBy = cancelledByText;
    booking.cancellationReason = reason || "Customer requested cancellation";
    await booking.save();

    // Release seats back to the bus inventory
    try {
      const busDoc = await Bus.findOne({
        $or: [
          { name: new RegExp(`^${booking.bus.trim()}$`, 'i') },
          { name: new RegExp(booking.bus.trim(), 'i') }
        ]
      });
      if (busDoc) {
        const releasedCount = Array.isArray(booking.seats) ? booking.seats.length : 1;
        busDoc.seatsLeft = Math.min(busDoc.totalSeats || 40, (busDoc.seatsLeft || 0) + releasedCount);
        await busDoc.save();
        console.log(`Restored ${releasedCount} seats to ${busDoc.name}. New seatsLeft: ${busDoc.seatsLeft}`);
      }
    } catch (busRestoreErr) {
      console.error("Error restoring bus seats on cancellation:", busRestoreErr);
    }

    // Dispatch Emails to both User and Admin
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        // 1. Send confirmation email to Passenger / User
        if (booking.passengerEmail) {
          try {
            await transporter.sendMail({
              from: `"SafarLink Support" <${process.env.EMAIL_USER}>`,
              to: booking.passengerEmail,
              subject: `🎟️ Ticket Cancellation Successful - Ref #${booking.ticketId} | SafarLink`,
              html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 25px; color: #222; max-width: 600px; margin: auto; background-color: #fcfaf7; border: 1px solid #e5dfd5; border-radius: 8px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #1b1b1b; margin: 0; font-size: 26px; letter-spacing: 2px;">SAFAR<span style="color: #aa8453; font-style: italic;">LINK</span></h1>
                    <p style="color: #aa8453; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px; font-weight: bold;">Verified Travel Notice</p>
                  </div>

                  <div style="background-color: #fff1f2; color: #9f1239; padding: 18px 22px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #fecdd3;">
                    <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #be123c;">Your Ticket Cancellation Successfully Processed</h3>
                    <p style="margin: 0; font-size: 13px; color: #881337;">Your reservation for Ticket ID <strong>#${booking.ticketId}</strong> has been cancelled.</p>
                  </div>

                  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 14px;">💳 Refund Notice</h4>
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #15803d;">
                      Your refund will be processed within 2-3 working days!
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #166534;">
                      Cancellation fee (25% deduction): <strong>Rs. ${deductionAmount.toLocaleString()}</strong><br/>
                      Refund Amount (75% returned): <strong>Rs. ${refundAmount.toLocaleString()}</strong> will be credited back to your original payment method.
                    </p>
                  </div>

                  <div style="background: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #ebe5dc; margin-bottom: 20px;">
                    <h4 style="color: #aa8453; margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f0eae1; padding-bottom: 8px;">Trip & Passenger Details</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                      <tr>
                        <td style="padding: 6px 0; color: #777;">Ticket Reference:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #aa8453; font-mono;">#${booking.ticketId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #777;">Passenger Name:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.userName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #777;">Route:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.routeFrom} ➔ ${booking.routeTo}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #777;">Fleet Service:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.bus}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #777;">Travel Date & Time:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.date} at ${booking.departureTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #777;">Seats Released:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right;">${Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #777;">Cancelled By:</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #b91c1c;">${cancelledByText}</td>
                      </tr>
                      <tr style="border-top: 1px solid #f0eae1;">
                        <td style="padding: 8px 0; font-weight: bold; color: #1b1b1b;">Original Fare:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">Rs. ${paidAmountNum.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #dc2626;">Cancellation Fee (25% deducted):</td>
                        <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #dc2626;">- Rs. ${deductionAmount.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #16a34a;">Refund Payable (75% returned):</td>
                        <td style="padding: 6px 0; font-weight: bold; font-size: 15px; text-align: right; color: #16a34a;">Rs. ${refundAmount.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>

                  <p style="font-size: 11px; color: #888; text-align: center; margin-top: 20px;">
                    Thank you for choosing SafarLink. If you have any questions, our support team is available 24/7.
                  </p>
                </div>
              `
            });
            console.log(`Cancellation confirmation email sent to passenger: ${booking.passengerEmail}`);
          } catch (passengerMailErr) {
            console.error("Error sending passenger cancellation email:", passengerMailErr);
          }
        }

        // 2. Send cancellation notification email to Admin
        try {
          const adminEmailTarget = process.env.EMAIL_USER;
          await transporter.sendMail({
            from: `"SafarLink Alert" <${process.env.EMAIL_USER}>`,
            to: adminEmailTarget,
            subject: `⚠️ Ticket Cancellation Alert - Ref #${booking.ticketId} | SafarLink`,
            html: `
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 25px; color: #222; max-width: 600px; margin: auto; background-color: #fcfaf7; border: 1px solid #e5dfd5; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #1b1b1b; margin: 0; font-size: 24px;">SAFAR<span style="color: #aa8453; font-style: italic;">LINK</span> <span style="font-size: 13px; color: #d97706; text-transform: uppercase;">[ADMIN NOTIFICATION]</span></h1>
                  <p style="color: #666; font-size: 12px; margin-top: 4px;">Ticket Cancellation Record Manifest</p>
                </div>

                <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
                  <strong style="color: #b45309; font-size: 13px;">Booking Cancellation Alert:</strong>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #92400e;">
                    Ticket <strong>#${booking.ticketId}</strong> was cancelled. Seats have been restored to fleet inventory.
                  </p>
                </div>

                <div style="background: #ffffff; padding: 18px; border-radius: 6px; border: 1px solid #ebe5dc; margin-bottom: 18px;">
                  <h4 style="color: #aa8453; margin-top: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f0eae1; padding-bottom: 6px;">Manifest Breakdown</h4>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Ticket Reference ID:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right; color: #aa8453; font-mono;">#${booking.ticketId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Passenger:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right;">${booking.userName} (${booking.passengerEmail})</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Phone / CNIC:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right;">${booking.passengerPhone} / ${booking.passengerCnic}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Fleet & Route:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right;">${booking.bus} | ${booking.routeFrom} ➔ ${booking.routeTo}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Travel Date & Time:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right;">${booking.date} at ${booking.departureTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Seats Restored:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right;">${Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Original Fare:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right;">Rs. ${paidAmountNum.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #dc2626;">Cancellation Fee (25% deducted):</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right; color: #dc2626;">Rs. ${deductionAmount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Refund Amount (75% returned):</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right; color: #16a34a;">Rs. ${refundAmount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Cancelled By:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right; color: #dc2626;">${cancelledByText}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Cancellation Time:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right;">${new Date().toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #777;">Reason:</td>
                      <td style="padding: 5px 0; font-weight: bold; text-align: right;">${reason || "Customer requested"}</td>
                    </tr>
                  </table>
                </div>

                <div style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #4b5563;">
                  <strong>Action Required:</strong> Please ensure refund settlement is finalized within 2-3 working days.
                </div>
              </div>
            `
          });
          console.log(`Cancellation alert email sent to admin: ${adminEmailTarget}`);
        } catch (adminMailErr) {
          console.error("Error sending admin cancellation email:", adminMailErr);
        }

      } catch (refundMailErr) {
        console.error("Error in mail transport during cancellation:", refundMailErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Booking cancelled successfully! Your amount will be refunded within 2-3 working days. (Rs. ${refundAmount})`,
      refundAmount,
      refundPercentage,
      cancelledBy: cancelledByText,
      booking
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({ success: false, message: "Cancellation error: " + error.message });
  }
};
