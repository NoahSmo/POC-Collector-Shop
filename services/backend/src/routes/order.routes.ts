import { Router } from 'express';
import { getEarnings, getMyOrders } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/earnings', requireAuth as any, getEarnings);
router.get('/my-purchases', requireAuth as any, getMyOrders);

export default router;
