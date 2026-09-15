import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
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

    // Save actual booking to database
    try {
      const busName = selectedRoute?.bus || selectedRoute?.name || "N/A";
      const travelDate = selectedRoute?.date || new Date().toISOString().split('T')[0];
      const routeFrom = selectedRoute?.from || "N/A";
      const routeTo = selectedRoute?.to || "N/A";
      const depTime = selectedRoute?.time || "N/A";
      const totalAmount = `Rs. ${selectedRoute?.price ? selectedRoute.price * (selectedSeats?.length || 1) : 0}`;

      // Check if ticket already exists
      const existing = await Booking.findOne({ ticketId });
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
          type: "Upcoming"
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
      }
    } catch (dbErr) {
      console.error("Failed to save booking to database:", dbErr);
    }

    // Send notification email to admin
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    await transporter.sendMail({
      to: adminEmail,
      subject: `Payment Cleared: Ticket Reservation ${ticketId || ""}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee;">
          <h2 style="color: #aa8453; border-bottom: 2px solid #aa8453; padding-bottom: 10px;">Payment Clearance & Ticket Reservation</h2>
          
          <h3 style="color: #1b1b1b;">Passenger Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${passengerInfo?.name || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${passengerInfo?.phone || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">CNIC:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${passengerInfo?.cnic || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${passengerInfo?.email || "N/A"}</td>
            </tr>
          </table>

          <h3 style="color: #1b1b1b;">Reservation Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Ticket ID:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #aa8453;">${ticketId || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Transaction Ref:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #16a34a;">${txnRefNo || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Bus:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${selectedRoute?.bus || selectedRoute?.name || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Route:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${selectedRoute?.from || "N/A"} to ${selectedRoute?.to || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Departure Time:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${selectedRoute?.time || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Selected Seats:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #aa8453;">${seatsList || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Total Amount Paid:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${selectedRoute?.price ? `Rs. ${selectedRoute.price * (selectedSeats?.length || 1)}` : "N/A"}</td>
            </tr>
          </table>
        </div>
      `
    });

    res.status(200).json({ success: true, message: "Payment clearance email sent and booking saved successfully" });

  } catch (error) {
    console.error("Payment clearance email error:", error);
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

    const bookings = await Booking.find({ bus, date });
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

