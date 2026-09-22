import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import Booking from '../models/booking.model.js';
import Bus from '../models/bus.model.js';

export const createStripeCheckoutSession = async (req, res) => {
  try {
    const { amount, ticketId, description } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required." });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() : null;
    if (!stripeKey) {
      return res.status(500).json({ success: false, message: "Stripe integration key is missing on the server." });
    }

    const stripe = new Stripe(stripeKey);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: `Bus Ticket - SafarLink`,
              description: description || `Bus ticket reservation via SafarLink`,
            },
            unit_amount: Math.round(parseFloat(amount) * 100), // in cents/paisa
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${clientUrl}/payment-success?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/book-now?status=error&message=Payment cancelled`,
      metadata: {
        ticketId: ticketId || "",
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
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

    const { selectedRoute, selectedSeats, passengerInfo, ticketId, txnRefNo } = bookingData;

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

    // Save actual booking to database
    try {
      const busName = selectedRoute?.bus || selectedRoute?.name || "N/A";
      const travelDate = selectedRoute?.date || new Date().toISOString().split('T')[0];
      const routeFrom = selectedRoute?.from || "N/A";
      const routeTo = selectedRoute?.to || "N/A";
      const depTime = selectedRoute?.time || "N/A";
      const totalAmount = `Rs. ${selectedRoute?.price ? selectedRoute.price * (selectedSeats?.length || 1) : 0}`;

      // Check if ticket already exists
      let existing = await Booking.findOne({ ticketId });
      if (!existing) {
        const newBooking = new Booking({
          ticketId: ticketId || `SL-${Date.now()}`,
          userName: passengerInfo?.name || "N/A",
          passengerPhone: passengerInfo?.phone || "N/A",
          passengerCnic: passengerInfo?.cnic || "N/A",
          passengerEmail: passengerInfo?.email || "N/A",
          bus: busName,
          date: travelDate,
          amount: totalAmount,
          seats: sortedSeats.map(s => String(s)),
          routeFrom: routeFrom,
          routeTo: routeTo,
          departureTime: depTime,
          txnRefNo: txnRefNo || "N/A",
          status: "Upcoming",
          type: "Upcoming",
          qrCodeDataUrl: qrDataUrl
        });
        await newBooking.save();
        console.log("Booking successfully saved in database:", ticketId);

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
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Total Amount Paid:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #1b1b1b; font-size: 16px;">${selectedRoute?.price ? `Rs. ${selectedRoute.price * (selectedSeats?.length || 1)}` : "N/A"}</td>
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
    const bookings = await Booking.find().sort({ createdAt: -1 });
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

    // Only count active bookings (ignore Cancelled and Refunded bookings)
    const bookings = await Booking.find({
      bus,
      date,
      status: { $nin: ["Cancelled", "Refunded"] }
    });

    let bookedSeatsList = [];
    bookings.forEach(b => {
      if (b.seats && Array.isArray(b.seats)) {
        bookedSeatsList = bookedSeatsList.concat(b.seats);
      }
    });

    return res.status(200).json({ success: true, bookedSeats: bookedSeatsList });
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
    const { reason } = req.body;

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

    // Calculate hours remaining until departure
    let hoursRemaining = 48; // default fallback
    try {
      const departureDateStr = booking.date; // e.g. "2026-09-23"
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
      hoursRemaining = diffMs / (1000 * 60 * 60);
    } catch (dateErr) {
      console.warn("Date parse error for refund calculation:", dateErr);
    }

    // Determine refund policy percentage
    let refundPercentage = 100;
    if (hoursRemaining >= 24) {
      refundPercentage = 100; // > 24 hrs: Full 100% refund
    } else if (hoursRemaining >= 12) {
      refundPercentage = 75; // 12-24 hrs: 75% refund
    } else if (hoursRemaining > 0) {
      refundPercentage = 50; // < 12 hrs: 50% refund
    } else {
      refundPercentage = 0; // past departure
    }

    // Parse numeric paid amount
    const paidAmountNum = parseInt(String(booking.amount).replace(/[^\d]/g, ''), 10) || 0;
    const refundAmount = Math.round((paidAmountNum * refundPercentage) / 100);

    // Update booking status
    booking.status = "Cancelled";
    booking.type = "Cancelled";
    booking.refundAmount = refundAmount;
    booking.refundPercentage = refundPercentage;
    booking.refundStatus = refundPercentage > 0 ? "Processed" : "None";
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || "Customer request";
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

    // Send cancellation & refund confirmation email to customer
    if (booking.passengerEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
          from: `"SafarLink Support" <${process.env.EMAIL_USER}>`,
          to: booking.passengerEmail,
          subject: `Cancellation & Refund Confirmation - Ticket ${booking.ticketId}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 25px; color: #222; max-width: 600px; margin: auto; background-color: #fcfaf7; border: 1px solid #e5dfd5; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #1b1b1b; margin: 0; font-size: 26px; letter-spacing: 2px;">SAFAR<span style="color: #aa8453; font-style: italic;">LINK</span></h1>
                <p style="color: #aa8453; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px; font-weight: bold;">Booking Cancellation Notice</p>
              </div>

              <div style="background-color: #fff1f2; color: #9f1239; padding: 16px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #fecdd3;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px;">Booking Cancelled Successfully</h3>
                <p style="margin: 0; font-size: 13px;">Your reservation for Ticket ID <strong>${booking.ticketId}</strong> has been cancelled.</p>
              </div>

              <div style="background: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #ebe5dc; margin-bottom: 20px;">
                <h4 style="color: #aa8453; margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Refund Breakdown</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Original Fare Paid:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right;">Rs. ${paidAmountNum.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #777;">Refund Policy Tier:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #aa8453;">${refundPercentage}% Refund</td>
                  </tr>
                  <tr style="border-top: 1px solid #eee;">
                    <td style="padding: 10px 0 6px 0; font-weight: bold; font-size: 15px; color: #1b1b1b;">Refund Amount Processed:</td>
                    <td style="padding: 10px 0 6px 0; font-weight: bold; font-size: 17px; text-align: right; color: #16a34a;">Rs. ${refundAmount.toLocaleString()}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 12px; color: #666; line-height: 1.5;">Refunds to credit/debit cards are automatically credited back to your original payment method within 3–5 business days.</p>
            </div>
          `
        });
      } catch (refundMailErr) {
        console.error("Error sending cancellation email:", refundMailErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Booking cancelled successfully. Refund of Rs. ${refundAmount} (${refundPercentage}%) has been processed.`,
      refundAmount,
      refundPercentage,
      booking
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({ success: false, message: "Cancellation error: " + error.message });
  }
};
