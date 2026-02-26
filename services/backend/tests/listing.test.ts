import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';

describe('Listing API endpoint integration tests', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'poc-super-secret-key-for-local-dev';
  const mockToken = jwt.sign({ sub: 'user123', name: 'John Doe' }, JWT_SECRET);

  describe('Integration: POST /api/listings', () => {
    
    it('should reject unauthenticated requests with a 401', async () => {
      const res = await request(app)
        .post('/api/listings')
        .send({ title: 'Test', price: 100 });
      
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Unauthorized/);
    });

    it('should validate inputs and reject incorrect data payload with a 400', async () => {
      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Too short', // Valid field but breaks the length constraint
        });
      
      expect(res.status).toBe(400); // Bad Request
    });

    it('should accept a valid listing payload for asynchronous processing', async () => {
      const validPayload = {
        title: 'Rare Charizard',
        description: 'A very rare pokemon card in pristine condition. Selling it for a reasonable price.',
        price: 1500,
        condition: 'MINT',
        images: [
          'https://example.com/front.jpg',
          'https://example.com/back.jpg',
          'https://example.com/detail.jpg'
        ]
      };

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(validPayload);
      
      expect(res.status).toBe(202); // Accepted
      expect(res.body.status).toBe('Pending_Review');
      expect(res.body.message).toBe('Listing accepted for processing');
      expect(res.body.listingId).toBeDefined();
    });
  });

  describe('Unit: Healthcheck', () => {
    it('should return UP on /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });
  });
});
