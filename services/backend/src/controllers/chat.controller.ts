import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const createOrGetChatRoom = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const buyerId = (req as any).user.sub;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true }
    });

    if (!product || !product.sellerId) {
      return res.status(404).json({ error: 'Product or seller not found' });
    }

    if (product.sellerId === buyerId) {
      return res.status(400).json({ error: 'You cannot start a chat with yourself' });
    }

    // Check if a chat room already exists for this buyer and product
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        productId,
        buyerId,
        sellerId: product.sellerId
      }
    });

    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          productId,
          buyerId,
          sellerId: product.sellerId
        }
      });
    }

    return res.status(200).json(chatRoom);
  } catch (error: any) {
    logger.error(`Error in createOrGetChatRoom: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUserChatRooms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(chatRooms);
  } catch (error: any) {
    logger.error(`Error in getUserChatRooms: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getChatRoomMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user.sub;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { buyerId: true, sellerId: true }
    });

    if (!chatRoom || (chatRoom.buyerId !== userId && chatRoom.sellerId !== userId)) {
      return res.status(403).json({ error: 'Unauthorized to view this chat' });
    }

    const messages = await prisma.message.findMany({
      where: { chatRoomId: roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { name: true } }
      }
    });

    return res.status(200).json(messages);
  } catch (error: any) {
    logger.error(`Error in getChatRoomMessages: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;
    const senderId = (req as any).user.sub;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { buyerId: true, sellerId: true }
    });

    if (!chatRoom || (chatRoom.buyerId !== senderId && chatRoom.sellerId !== senderId)) {
      return res.status(403).json({ error: 'Unauthorized to post in this chat' });
    }

    const message = await prisma.message.create({
      data: {
        chatRoomId: roomId,
        senderId,
        text
      },
      include: {
        sender: { select: { name: true } }
      }
    });

    const io = req.app.get('io');
    if (io) {
      logger.info(`Emitting new_message to room ${roomId}: ${message.text}`);
      io.to(roomId).emit('new_message', message);
      logger.info('Emit successful');
    } else {
      logger.warn('Socket.io instance not found in app');
    }

    return res.status(201).json(message);
  } catch (error: any) {
    logger.error(`Error in sendMessage: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
