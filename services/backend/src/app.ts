import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import promClient from 'prom-client';
import listingRoutes from './routes/listing.routes';
import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/user.routes';
import stripeRoutes from './routes/stripe.routes';
import stripeWebhookRoutes from './routes/stripe-webhook.routes';
import orderRoutes from './routes/order.routes';

const app = express();

// Observability: Prometheus Metrics Middleware Setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Intercept all requests to track their duration
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, code: res.statusCode });
  });
  next();
});

// Webhook must be parsed as raw buffer before express.json()
app.use('/api/stripe/webhook', stripeWebhookRoutes);

// Security & Standard Middleware
app.use(helmet()); 
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Expose Prometheus Metrics Endpoint (usually scraped by Prometheus)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Business Logic Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/orders', orderRoutes);

// General Application Healthcheck 
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

export default app;
