import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getEarnings = async (req: Request, res: Response) => {
  try {
    const sellerId = (req as any).user?.sub;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orders = await prisma.order.findMany({
      where: {
        status: 'PURCHASED',
        product: {
          sellerId: sellerId
        }
      },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalEarnings = orders.reduce((sum: number, order: any) => sum + order.amount, 0);

    return res.status(200).json({ totalEarnings, orders });
  } catch (error: any) {
    logger.error(`Error fetching earnings: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const buyerId = (req as any).user?.sub;
    if (!buyerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orders = await prisma.order.findMany({
      where: {
        buyerId: buyerId
      },
      include: {
        product: { 
          include: { 
            seller: { 
              select: { id: true, name: true, email: true } 
            } 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(orders);
  } catch (error: any) {
    logger.error(`Error fetching my orders: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
