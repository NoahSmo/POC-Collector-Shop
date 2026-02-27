import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.sub;

    const products = await prisma.product.findMany({
      where: { 
        status: 'approved',
        isSold: false,
        NOT: userId ? { sellerId: userId } : undefined
      },
      orderBy: { year: 'asc' }
    });
    return res.status(200).json(products);
  } catch (error: any) {
    logger.error(`Error fetching products: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const products = await prisma.product.findMany({
      where: { sellerId: userId },
      orderBy: { year: 'asc' }
    });
    return res.status(200).json(products);
  } catch (error: any) {
    logger.error(`Error fetching my products: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(200).json(product);
  } catch (error: any) {
    logger.error(`Error fetching product by id: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, year, price, image, description } = req.body;
    const sellerId = (req as any).user?.sub;

    if (!title || !year || !price || !image || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        year,
        price,
        image,
        description,
        sellerId,
        status: 'pending' // New products are pending by default
      }
    });

    logger.info(`Product created and pending validation: ${product.id}`);
    return res.status(201).json(product);
  } catch (error: any) {
    logger.error(`Error creating product: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPendingProducts = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }

    const products = await prisma.product.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: { name: true } } }
    });

    return res.status(200).json(products);
  } catch (error: any) {
    logger.error(`Error fetching pending products: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status }
    });

    logger.info(`Product ${id} status updated to ${status}`);
    return res.status(200).json(product);
  } catch (error: any) {
    logger.error(`Error updating product status: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getApprovedProducts = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }

    const products = await prisma.product.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: { name: true } } }
    });

    return res.status(200).json(products);
  } catch (error: any) {
    logger.error(`Error fetching approved products: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.sub;
    const userRole = (req as any).user?.role;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Role check: Admin can delete any, user can only delete own
    if (userRole !== 'admin' && product.sellerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own products' });
    }

    await prisma.product.delete({
      where: { id }
    });

    logger.info(`Product ${id} deleted by ${userId} (role: ${userRole})`);
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    logger.error(`Error deleting product: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, year, price, image, description } = req.body;
    const userId = (req as any).user?.sub;
    const userRole = (req as any).user?.role;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Authorization check: Admin can update any, user can only update own
    if (userRole !== 'admin' && product.sellerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only modify your own products' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: title || product.title,
        year: year || product.year,
        price: price || product.price,
        image: image || product.image,
        description: description || product.description,
        status: userRole === 'admin' ? product.status : 'pending' // Re-validate if not admin
      }
    });

    logger.info(`Product ${id} updated by ${userId} (role: ${userRole})`);
    return res.status(200).json(updatedProduct);
  } catch (error: any) {
    logger.error(`Error updating product: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
