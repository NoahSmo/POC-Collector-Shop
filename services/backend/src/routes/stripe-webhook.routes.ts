import { Router } from 'express';
import { handleWebhook } from '../controllers/stripe.controller';
import express from 'express';

const router = Router();

// Ensure express.raw is applied ONLY for webhook and BEFORE body parser in app.ts
router.post('/', express.raw({ type: 'application/json' }), handleWebhook as any);

export default router;
