import { Router } from 'express';
import {
  createStripeCheckoutSession,
  sendPaymentClearanceEmail,
  getBookings,
  getBookedSeats,
  verifyTicket,
  markTicketBoarded,
  cancelBooking
} from '../controller/payment.controller.js';

const router = Router();

router.post('/stripe/create-checkout-session', createStripeCheckoutSession);
router.post('/clearance-email', sendPaymentClearanceEmail);
router.get('/bookings', getBookings);
router.get('/booked-seats', getBookedSeats);
router.get('/verify-ticket/:ticketId', verifyTicket);
router.patch('/board-ticket/:ticketId', markTicketBoarded);
router.post('/cancel-booking/:ticketId', cancelBooking);

export default router;
