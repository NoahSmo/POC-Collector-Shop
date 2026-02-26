import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        location: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    logger.error(`Error in getProfile: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const { name, bio, location } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        location
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        location: true
      }
    });

    return res.status(200).json(updatedUser);
  } catch (error: any) {
    logger.error(`Error in updateProfile: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
