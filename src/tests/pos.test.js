const request = require('supertest');
const app = require('../index');

describe('POS System API', () => {
  
  // Clear products before each test
  beforeEach(() => {
    global.products = [];
    global.transactions = [];
  });

  describe('Products Endpoint', () => {
    
    test('GET /api/products should return empty array initially', async () => {
      const res = await request(app)
        .get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('POST /api/products should add a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          id: 1,
          name: 'Coffee',
          price: 5.99,
          quantity: 50
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Coffee');
      expect(res.body.price).toBe(5.99);
    });

    test('POST /api/products should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Coffee'
          // Missing id and price
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    test('POST /api/products should reject negative price', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          id: 1,
          name: 'Coffee',
          price: -5.99
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Price cannot be negative');
    });
  });

  describe('Transactions Endpoint', () => {
    
    beforeEach(async () => {
      // Add test products
      await request(app)
        .post('/api/products')
        .send({ id: 1, name: 'Coffee', price: 5.99, quantity: 50 });
      
      await request(app)
        .post('/api/products')
        .send({ id: 2, name: 'Tea', price: 3.99, quantity: 30 });
    });

    test('POST /api/transactions should create a valid transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          items: [
            { productId: 1, quantity: 2 }
          ]
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.total).toBe(11.98); // 5.99 * 2
      expect(res.body.id).toBe(1);
    });

    test('POST /api/transactions should calculate correct total', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          items: [
            { productId: 1, quantity: 1 },
            { productId: 2, quantity: 2 }
          ]
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.total).toBe(13.97); // (5.99 * 1) + (3.99 * 2)
    });

    test('POST /api/transactions should reject empty items', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({ items: [] });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('No items in transaction');
    });

    test('POST /api/transactions should reject non-existent product', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          items: [
            { productId: 999, quantity: 1 }
          ]
        });
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toContain('not found');
    });

    test('POST /api/transactions should reject insufficient stock', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          items: [
            { productId: 1, quantity: 100 } // Only 50 available
          ]
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Insufficient stock');
    });
  });

  describe('Health Check', () => {
    test('GET /health should return ok status', async () => {
      const res = await request(app)
        .get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
