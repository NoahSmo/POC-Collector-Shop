import { Request, Response } from 'express';
import { createListingSchema } from '../validators/listing.validator';
import { logger } from '../utils/logger';

export const createListing = async (req: Request, res: Response) => {
  try {
    // 1. Validate Input (Acceptance Criteria 2)
    const { error, value } = createListingSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error on listing creation: ${error.details[0].message}`);
      return res.status(400).json({ error: error.details[0].message });
    }

    // 2. Simulate User context retrieval (Acceptance Criteria 1)
    const userId = (req as any).user?.sub || 'anonymous';
    logger.info(`Incoming listing creation request from user ${userId}`, { data: value });

    // 3. Simulate Event Publication to Message Broker (RabbitMQ Mock)
    // In a real system: await channel.sendToQueue('listing_checks', Buffer.from(JSON.stringify(listing)))
    logger.info('Publishing listing to Validation Queue for async processing by AI (Mock Check)');

    // 4. Return early response (Asynchronous Workflow - CA5)
    return res.status(202).json({
      message: 'Listing accepted for processing',
      status: 'Pending_Review',
      listingId: `lst_${Date.now()}`
    });

  } catch (error: any) {
    logger.error(`Error processing listing: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
