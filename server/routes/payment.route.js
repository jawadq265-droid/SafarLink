import { Router } from 'express';
import { initiateJazzCashHosted, handleJazzCashCallback } from '../controller/payment.controller.js';

const router = Router();

router.post('/jazzcash', initiateJazzCashHosted);
router.post('/jazzcash/callback', handleJazzCashCallback);

export default router;
