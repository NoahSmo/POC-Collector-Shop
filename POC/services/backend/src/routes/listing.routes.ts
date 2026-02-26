import { Router } from 'express';
import { createListing } from '../controllers/listing.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Protected Route for creating listings
router.post('/', requireAuth, createListing);

export default router;
