import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, getPendingProducts, updateProductStatus, getMyProducts, deleteProduct, getApprovedProducts, updateProduct } from '../controllers/product.controller';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Admin only routes
router.get('/pending', requireAuth, getPendingProducts);
router.patch('/:id/status', requireAuth, updateProductStatus);

// Public routes for catalog (filters own items if logged in)
router.get('/', optionalAuth, getAllProducts);
router.get('/my', requireAuth, getMyProducts);
router.get('/approved', requireAuth, getApprovedProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/', requireAuth, createProduct);
router.put('/:id', requireAuth, updateProduct);
router.delete('/:id', requireAuth, deleteProduct);


export default router;
