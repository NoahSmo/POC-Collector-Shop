// This mock MUST be at the top before any imports
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  chatRoom: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  order: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'poc-super-secret-key-for-local-dev';
const userToken = jwt.sign({ sub: 'user1', email: 'user@test.com', name: 'User', role: 'user' }, JWT_SECRET);
const adminToken = jwt.sign({ sub: 'admin1', email: 'admin@test.com', name: 'Admin', role: 'admin' }, JWT_SECRET);

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================
// AUTH CONTROLLER
// ============================================================
describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should reject with missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing/);
    });

    it('should reject if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@test.com', password: 'password123', name: 'Test'
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already exists/);
    });

    it('should register a new user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id', email: 'new@test.com', role: 'user', name: 'New User'
      });
      const res = await request(app).post('/api/auth/register').send({
        email: 'new@test.com', password: 'password123', name: 'New User'
      });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('new@test.com');
    });

    it('should return 500 on internal error', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB down'));
      const res = await request(app).post('/api/auth/register').send({
        email: 'e@t.com', password: 'p', name: 'N'
      });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject with missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing/);
    });

    it('should reject non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@test.com', password: 'password123'
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Invalid credentials/);
    });

    it('should reject wrong password', async () => {
      const hashedPw = await bcrypt.hash('correct-password', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'user@test.com', password: hashedPw, role: 'user', name: 'User'
      });
      const res = await request(app).post('/api/auth/login').send({
        email: 'user@test.com', password: 'wrong-password'
      });
      expect(res.status).toBe(401);
    });

    it('should login successfully with correct credentials', async () => {
      const hashedPw = await bcrypt.hash('correct-password', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'user@test.com', password: hashedPw, role: 'user', name: 'User'
      });
      const res = await request(app).post('/api/auth/login').send({
        email: 'user@test.com', password: 'correct-password'
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should return 500 on internal error', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB down'));
      const res = await request(app).post('/api/auth/login').send({
        email: 'e@t.com', password: 'p'
      });
      expect(res.status).toBe(500);
    });
  });
});

// ============================================================
// PRODUCT CONTROLLER
// ============================================================
describe('Product Controller', () => {
  describe('GET /api/products', () => {
    it('should return approved products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: '1', title: 'Product 1', status: 'approved' }
      ]);
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/products/my', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/api/products/my');
      expect(res.status).toBe(401);
    });

    it('should return user products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/products/my')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/products/my')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product by id', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1', title: 'Test' });
      const res = await request(app).get('/api/products/1');
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Test');
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/products/nonexistent');
      expect(res.status).toBe(404);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/products/bad-id');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/products', () => {
    it('should reject with missing fields', async () => {
      const res = await request(app).post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test' });
      expect(res.status).toBe(400);
    });

    it('should create a product successfully', async () => {
      mockPrisma.product.create.mockResolvedValue({
        id: 'new-id', title: 'New', year: '2020', price: '100', status: 'pending'
      });
      const res = await request(app).post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'New', year: '2020', price: '100', image: 'http://img.com/1.jpg', description: 'Desc' });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.create.mockRejectedValue(new Error('err'));
      const res = await request(app).post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'N', year: '2020', price: '10', image: 'x', description: 'D' });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/products/pending', () => {
    it('should reject non-admin', async () => {
      const res = await request(app).get('/api/products/pending')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should return pending products for admin', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/products/pending')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/products/pending')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/products/approved', () => {
    it('should reject non-admin', async () => {
      const res = await request(app).get('/api/products/approved')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should return approved products for admin', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/products/approved')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/products/approved')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('PATCH /api/products/:id/status', () => {
    it('should reject non-admin', async () => {
      const res = await request(app).patch('/api/products/1/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'approved' });
      expect(res.status).toBe(403);
    });

    it('should reject invalid status', async () => {
      const res = await request(app).patch('/api/products/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid' });
      expect(res.status).toBe(400);
    });

    it('should approve product', async () => {
      mockPrisma.product.update.mockResolvedValue({ id: '1', status: 'approved' });
      const res = await request(app).patch('/api/products/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('approved');
    });

    it('should reject product', async () => {
      mockPrisma.product.update.mockResolvedValue({ id: '1', status: 'rejected' });
      const res = await request(app).patch('/api/products/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected' });
      expect(res.status).toBe(200);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.update.mockRejectedValue(new Error('err'));
      const res = await request(app).patch('/api/products/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).delete('/api/products/1');
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const res = await request(app).delete('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });

    it('should reject deletion by non-owner non-admin', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1', sellerId: 'other-user' });
      const res = await request(app).delete('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow owner to delete', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1', sellerId: 'user1' });
      mockPrisma.product.delete.mockResolvedValue({});
      const res = await request(app).delete('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should allow admin to delete any product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1', sellerId: 'other-user' });
      mockPrisma.product.delete.mockResolvedValue({});
      const res = await request(app).delete('/api/products/1')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).delete('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).put('/api/products/1').send({ title: 'U' });
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const res = await request(app).put('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated' });
      expect(res.status).toBe(404);
    });

    it('should reject update by non-owner non-admin', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1', sellerId: 'other-user' });
      const res = await request(app).put('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated' });
      expect(res.status).toBe(403);
    });

    it('should allow owner to update (re-sets to pending)', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1', sellerId: 'user1', title: 'Old', status: 'approved' });
      mockPrisma.product.update.mockResolvedValue({ id: '1', title: 'Updated', status: 'pending' });
      const res = await request(app).put('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should allow admin to update (keeps status)', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1', sellerId: 'other', title: 'Old', status: 'approved' });
      mockPrisma.product.update.mockResolvedValue({ id: '1', title: 'Updated', status: 'approved' });
      const res = await request(app).put('/api/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).put('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'U' });
      expect(res.status).toBe(500);
    });
  });
});

// ============================================================
// USER CONTROLLER
// ============================================================
describe('User Controller', () => {
  describe('GET /api/users/profile', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.status).toBe(401);
    });

    it('should return user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1', email: 'user@test.com', name: 'User', bio: 'Hello', location: 'Paris'
      });
      const res = await request(app).get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('User');
    });

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).put('/api/users/profile').send({ name: 'N' });
      expect(res.status).toBe(401);
    });

    it('should update profile', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: 'user1', email: 'user@test.com', name: 'New Name', bio: 'Updated', location: 'Lyon'
      });
      const res = await request(app).put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New Name', bio: 'Updated', location: 'Lyon' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Name');
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.user.update.mockRejectedValue(new Error('err'));
      const res = await request(app).put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'N' });
      expect(res.status).toBe(500);
    });
  });
});

// ============================================================
// CHAT CONTROLLER
// ============================================================
describe('Chat Controller', () => {
  describe('GET /api/chats/rooms', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/api/chats/rooms');
      expect(res.status).toBe(401);
    });

    it('should return user chat rooms', async () => {
      mockPrisma.chatRoom.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/chats/rooms')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.chatRoom.findMany.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/chats/rooms')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/chats/rooms', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).post('/api/chats/rooms').send({ productId: '1' });
      expect(res.status).toBe(401);
    });

    it('should reject with missing productId', async () => {
      const res = await request(app).post('/api/chats/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return existing chat room', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ sellerId: 'other-user' });
      mockPrisma.chatRoom.findFirst.mockResolvedValue({ id: 'room1', productId: '1' });
      const res = await request(app).post('/api/chats/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: '1' });
      expect(res.status).toBe(200);
    });

    it('should create new chat room', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ sellerId: 'other-user' });
      mockPrisma.chatRoom.findFirst.mockResolvedValue(null);
      mockPrisma.chatRoom.create.mockResolvedValue({ id: 'new-room', productId: '1' });
      const res = await request(app).post('/api/chats/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: '1' });
      expect(res.status).toBe(200);
    });

    it('should return 404 if product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/chats/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: 'nonexistent' });
      expect(res.status).toBe(404);
    });

    it('should reject chatting with yourself', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ sellerId: 'user1' });
      const res = await request(app).post('/api/chats/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: '1' });
      expect(res.status).toBe(400);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.product.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).post('/api/chats/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: '1' });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/chats/rooms/:roomId/messages', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/api/chats/rooms/room1/messages');
      expect(res.status).toBe(401);
    });

    it('should return messages when authorized', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue({ buyerId: 'user1', sellerId: 'seller1' });
      mockPrisma.message.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/chats/rooms/room1/messages')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 403 when not participant', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue({ buyerId: 'other', sellerId: 'another' });
      const res = await request(app).get('/api/chats/rooms/room1/messages')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.chatRoom.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/chats/rooms/room1/messages')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/chats/rooms/:roomId/messages', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).post('/api/chats/rooms/room1/messages').send({ text: 'Hello' });
      expect(res.status).toBe(401);
    });

    it('should reject with missing text', async () => {
      const res = await request(app).post('/api/chats/rooms/room1/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('should create a message when authorized', async () => {
      const mockMsg = { id: 'msg1', text: 'Hello', senderId: 'user1', sender: { name: 'User' } };
      mockPrisma.chatRoom.findUnique.mockResolvedValue({ buyerId: 'user1', sellerId: 'seller1' });
      mockPrisma.message.create.mockResolvedValue(mockMsg);
      const res = await request(app).post('/api/chats/rooms/room1/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ text: 'Hello' });
      expect(res.status).toBe(201);
    });

    it('should return 403 when not participant', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue({ buyerId: 'other', sellerId: 'another' });
      const res = await request(app).post('/api/chats/rooms/room1/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ text: 'Hello' });
      expect(res.status).toBe(403);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.chatRoom.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).post('/api/chats/rooms/room1/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ text: 'Hello' });
      expect(res.status).toBe(500);
    });
  });
});

// ============================================================
// ORDER CONTROLLER
// ============================================================
describe('Order Controller', () => {
  describe('GET /api/orders', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/api/orders/my-purchases');
      expect(res.status).toBe(401);
    });

    it('should return user orders', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/orders/my-purchases')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.order.findMany.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/orders/my-purchases')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/orders/sales', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/api/orders/earnings');
      expect(res.status).toBe(401);
    });

    it('should return sales for seller', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/orders/earnings')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 500 on DB error', async () => {
      mockPrisma.order.findMany.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/orders/earnings')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(500);
    });
  });
});

// ============================================================
// LISTING CONTROLLER
// ============================================================
describe('Listing API', () => {
  describe('POST /api/listings', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).post('/api/listings').send({});
      expect(res.status).toBe(401);
    });

    it('should reject invalid payload', async () => {
      const res = await request(app).post('/api/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Short' });
      expect(res.status).toBe(400);
    });

    it('should accept valid payload', async () => {
      const res = await request(app).post('/api/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Rare Charizard',
          description: 'A very rare pokemon card in pristine condition selling for good price.',
          price: 1500, condition: 'MINT',
          images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
        });
      expect(res.status).toBe(202);
      expect(res.body.status).toBe('Pending_Review');
    });
  });
});

// ============================================================
// HEALTHCHECK & METRICS
// ============================================================
describe('App Infrastructure', () => {
  it('should return UP on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('should expose Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_request_duration_seconds');
  });
});
