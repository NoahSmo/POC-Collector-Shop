import { Router } from 'express';
import { createCheckoutSession, verifySession } from '../controllers/stripe.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/create-checkout-session', requireAuth as any, createCheckoutSession);
router.get('/verify-session', verifySession);

export default router;
