import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Mock Keycloak JWT secret or public key for POC
const JWT_SECRET = process.env.JWT_SECRET || 'poc-super-secret-key-for-local-dev';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Unauthorized access attempt: Missing or invalid token format');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    logger.warn(`Unauthorized access attempt: ${err.message}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
    } catch (err) {
      // Ignore invalid tokens for optional auth
    }
  }
  next();
};
