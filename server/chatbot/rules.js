export function getRuleReply(message) {
  const msg = (message || "").toLowerCase().trim();

  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey") || msg.includes("salam") || msg.includes("assalam")) {
    return "Welcome to SafarLink Concierge. How may I assist your journey today?";
  }

  if (msg.includes("contact") || msg.includes("email") || msg.includes("phone") || msg.includes("support") || msg.includes("number")) {
    return "SafarLink Customer Care:\n• Phone: +92 3090996833\n• Email: info@SafarLink.com / sufarlink0@gmail.com\n• You can also reach us via the Contact Us page.";
  }

  if (msg.includes("owner") || msg.includes("who made") || msg.includes("about safarlink") || msg.includes("ncba")) {
    return "SafarLink was founded in 2025 as a Team Project by NCBA students to bring seamless digital bus ticket reservations to Pakistan.";
  }

  if (msg.includes("verify") || msg.includes("verification")) {
    return "You can easily verify your ticket by visiting our Ticket Verification page and scanning your QR code or entering your Ticket ID.";
  }

  if (msg.includes("service") || msg.includes("what is safarlink")) {
    return "SafarLink is a premium online bus ticket reservation system in Pakistan, enabling you to browse schedules, choose seats, and book tickets from anywhere.";
  }

  if (msg.includes("cities") || msg.includes("routes") || msg.includes("destination")) {
    return "SafarLink connects all major cities across Pakistan. You can search your departure and destination cities directly on our home page to see available routes.";
  }

  if (msg.includes("book") || msg.includes("ticket") || msg.includes("reserve") || msg.includes("seat")) {
    return "To book a seat, search your departure/arrival cities and travel date on our home page, select your preferred seat on the interactive map, and complete your secure booking.";
  }

  if (msg.includes("pay") || msg.includes("payment") || msg.includes("stripe") || msg.includes("card")) {
    return "SafarLink provides fast, secure online checkout for all bus ticket reservations.";
  }

  if (msg.includes("my booking") || msg.includes("activity") || msg.includes("history")) {
    return "You can view all your active and past reservations on your Activity page once logged in.";
  }

  if (msg.includes("ok") || msg.includes("thanks") || msg.includes("thank you") || msg.includes("shukriya")) {
    return "It is my pleasure to assist you. Have a safe and wonderful journey with SafarLink!";
  }

  return "I apologize, but as the SafarLink AI Concierge, I can only assist with questions regarding SafarLink, bus ticket reservations, routes, and our website features. How may I help you with your journey today?";
}