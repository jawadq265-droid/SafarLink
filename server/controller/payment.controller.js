import crypto from 'crypto';
import nodemailer from 'nodemailer';


function generateSecureHash(payload, integritySalt) {
  // 1. Filter out empty values, null, undefined, and pp_SecureHash.
  // Keys must be sorted alphabetically
  const sortedKeys = Object.keys(payload)
    .filter((k) => payload[k] !== undefined && payload[k] !== null && payload[k] !== '' && k !== 'pp_SecureHash')
    .sort();

  // 2. Concatenate values only (separated by &)
  const dataString = sortedKeys.map((k) => payload[k]).join('&');

  // Prepend salt before hashing
  const stringToHash = integritySalt + '&' + dataString;

  // 3. Create the hash using HMAC-SHA256
  const hash = crypto
    .createHmac('sha256', integritySalt)
    .update(stringToHash)
    .digest('hex')
    .toUpperCase();

  return hash;
}

export const initiateJazzCashHosted = async (req, res) => {
  try {
    const { amount, ticketId, description } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required." });
    }

    const merchantId = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const postUrl = process.env.JAZZCASH_API_URL || "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionPage";

    // Setup transaction dates in PKT (UTC+5) robustly
    const getPKTDateStrings = () => {
      const now = new Date();
      // Calculate PKT time by accounting for timezone offset (in minutes) and adding 300 minutes (5 hours)
      const pktTime = new Date(now.getTime() + (now.getTimezoneOffset() + 300) * 60000);
      
      const format = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return d.getFullYear() +
          pad(d.getMonth() + 1) +
          pad(d.getDate()) +
          pad(d.getHours()) +
          pad(d.getMinutes()) +
          pad(d.getSeconds());
      };

      const txnDateTime = format(pktTime);
      const expiryTime = new Date(pktTime.getTime() + 60 * 60 * 1000); // 1 Hour Expiry
      const txnExpiryDateTime = format(expiryTime);

      return { txnDateTime, txnExpiryDateTime };
    };

    const { txnDateTime, txnExpiryDateTime } = getPKTDateStrings();

    const txnRefNo = "T" + txnDateTime;
    const amountInPaisa = Math.round(parseFloat(amount) * 100).toString();

    // Clean up Bill Reference (Alphanumeric only)
    const cleanBillRef = (ticketId || "TicketRef").replace(/[^a-zA-Z0-9]/g, '');

    // Standard Hosted Checkout parameters
    const payload = {
      pp_Version: "1.1",
      pp_Language: "EN",
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amountInPaisa,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: cleanBillRef,
      pp_Description: (description || "Bus ticket reservation via SafarLink").replace(/[^a-zA-Z0-9 ]/g, ''),
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: process.env.JAZZCASH_RETURN_URL || "http://localhost:5005/api/v1/payment/jazzcash/callback",
      pp_TxnType: ""
    };

    // Calculate Secure Hash
    const secureHash = generateSecureHash(payload, integritySalt);
    payload.pp_SecureHash = secureHash;

    console.log("Hosted Payment Payload:", payload);

    return res.status(200).json({
      success: true,
      postUrl,
      fields: payload
    });

  } catch (error) {
    console.error("Hosted Checkout initiation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error: " + error.message });
  }
};

export const handleJazzCashCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log("JazzCash Callback Received POST body:", callbackData);

    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // check response code
    const responseCode = callbackData.pp_ResponseCode;
    const responseMessage = callbackData.pp_ResponseMessage || "Transaction Failed";
    const txnRefNo = callbackData.pp_TxnRefNo || "";

    if (responseCode === "000") {
      // Success, redirect client to payment success page
      return res.redirect(`${clientUrl}/payment-success?status=success&txnRefNo=${txnRefNo}`);
    } else {
      // Failure, redirect back to booking page with error details
      return res.redirect(`${clientUrl}/book-now?status=error&message=${encodeURIComponent(responseMessage)}`);
    }

  } catch (error) {
    console.error("JazzCash Callback processing error:", error);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/book-now?status=error&message=${encodeURIComponent(error.message)}`);
  }
};

export const sendPaymentClearanceEmail = async (req, res) => {
  try {
    const { bookingData } = req.body;

    if (!bookingData) {
      return res.status(400).json({ success: false, message: "Booking data is required" });
    }

    const { selectedRoute, selectedSeats, passengerInfo, ticketId, txnRefNo } = bookingData;

    // Send notification email to admin
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    // Format seats list
    const seatsList = Array.isArray(selectedSeats) ? selectedSeats.join(', ') : selectedSeats;

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
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${selectedRoute?.name || "N/A"}</td>
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

    res.status(200).json({ success: true, message: "Payment clearance email sent to admin successfully" });

  } catch (error) {
    console.error("Payment clearance email error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

