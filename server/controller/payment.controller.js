import crypto from 'crypto';

function generateSecureHash(payload, integritySalt) {
  // 1. Filter out empty values, null, undefined, and pp_SecureHash.
  // Keys must be sorted alphabetically
  const sortedKeys = Object.keys(payload)
    .filter((k) => payload[k] !== undefined && payload[k] !== null && payload[k] !== '' && k !== 'pp_SecureHash')
    .sort();

  // 2. Concatenate into a string: key1=value1&key2=value2...
  const dataString = sortedKeys.map((k) => `${k}=${payload[k]}`).join('&');

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
      pp_ReturnURL: process.env.JAZZCASH_RETURN_URL || "http://localhost:5005/api/v1/payment/jazzcash/callback"
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
