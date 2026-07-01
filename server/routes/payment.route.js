import { Router } from 'express';
import { createStripeCheckoutSession, sendPaymentClearanceEmail, getBookings, getBookedSeats } from '../controller/payment.controller.js';

const router = Router();

router.post('/stripe/create-checkout-session', createStripeCheckoutSession);
router.post('/clearance-email', sendPaymentClearanceEmail);
router.get('/bookings', getBookings);
router.get('/booked-seats', getBookedSeats);

export default router;
