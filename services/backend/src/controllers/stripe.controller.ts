import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', { apiVersion: '2023-10-16' as any });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const buyerId = (req as any).user?.sub;

    if (!productId || !buyerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.isSold) {
      return res.status(400).json({ error: 'Product is already sold' });
    }

    // Robust price parsing: remove currency symbols and spaces
    let cleanPrice = product.price.replace(/[€$£\s]/g, '');
    
    // Split by possible separators to identify whole and decimal parts
    const parts = cleanPrice.split(/[.,]/);
    let normalizedPrice: string;

    if (parts.length > 1) {
      const decimal = parts.pop();
      const whole = parts.join('');
      // If the last part is exactly 2 digits, it's likely a decimal (e.g., 1.20 or 1,20)
      if (decimal?.length === 2) {
        normalizedPrice = whole + '.' + decimal;
      } else {
        // Otherwise treat all parts as part of the whole number (e.g., 1,200 or 1.200)
        normalizedPrice = whole + (decimal || '');
      }
    } else {
      normalizedPrice = cleanPrice;
    }

    // unit amount in cents
    const parsedPrice = parseFloat(normalizedPrice);
    const unitAmount = Math.round(parsedPrice * 100) || 5000; 

    logger.debug(`Price calculation: original="${product.price}", normalized="${normalizedPrice}", parsed=${parsedPrice}, unitAmount=${unitAmount}`);

    // Stripe only accepts publicly accessible image URLs. Filter out base64 strings to avoid "request too large" errors.
    const productImages = product.image && product.image.startsWith('http') ? [product.image] : [];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout/cancel`,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.title,
              images: productImages,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: product.id,
        buyerId: buyerId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    logger.error(`Error creating checkout session: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // req.body must be the raw buffer to construct the event
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const productId = session.metadata?.productId;
      const buyerId = session.metadata?.buyerId;

      if (productId && buyerId) {
        // Find if order already exists to prevent duplicates
        const existingOrder = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
        if (!existingOrder) {
            await prisma.order.create({
            data: {
                amount: session.amount_total || 0,
                status: 'PURCHASED',
                stripeSessionId: session.id,
                buyerId: buyerId,
                productId: productId,
            }
            });

            // Mark product as sold
            await prisma.product.update({
            where: { id: productId },
            data: { isSold: true }
            });

            logger.info(`Payment successful for product ${productId} by user ${buyerId}`);
        }
      }
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error: any) {
    logger.error(`Error processing webhook: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error processing webhook' });
  }
};

export const verifySession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId as string);
    if (session.payment_status === 'paid') {
      const productId = session.metadata?.productId;
      const buyerId = session.metadata?.buyerId;

      if (productId && buyerId) {
        // Find if order already exists to prevent duplicates
        let order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
        
        if (!order) {
          order = await prisma.order.create({
            data: {
              amount: session.amount_total || 0,
              status: 'PURCHASED',
              stripeSessionId: session.id,
              buyerId: buyerId,
              productId: productId,
            }
          });

          // Mark product as sold
          await prisma.product.update({
            where: { id: productId },
            data: { isSold: true }
          });

          logger.info(`Session verified: Payment successful for product ${productId} by user ${buyerId}`);
        }
        
        return res.status(200).json({ status: 'paid', order });
      }
    }

    return res.status(200).json({ status: session.payment_status });
  } catch (error: any) {
    logger.error(`Error verifying session: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error verifying session' });
  }
};
