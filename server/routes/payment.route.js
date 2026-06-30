import { Router } from 'express';
import { initiateJazzCashHosted, handleJazzCashCallback, sendPaymentClearanceEmail } from '../controller/payment.controller.js';

const router = Router();

router.post('/jazzcash', initiateJazzCashHosted);
router.post('/jazzcash/callback', handleJazzCashCallback);
router.post('/clearance-email', sendPaymentClearanceEmail);

export default router;
