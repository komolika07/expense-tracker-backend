jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    Expense: {
      create: jest.fn().mockImplementation((data) => {
        if (!data.amount || !data.type || !data.userId) {
          const err = { name: 'SequelizeValidationError', errors: [{ message: 'Missing fields' }] };
          throw err;
        }
        return { id: 1, ...data };
      }),
      findAll: jest.fn().mockResolvedValue([{ id: 1, type: 'Food', amount: 100, userId: 1 }]),
      findOne: jest.fn().mockResolvedValue({ id: 1, type: 'Food', amount: 100, userId: 1 })
    }
  };
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

describe('Expenses endpoints', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ id: 1, email: 'test@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  test('GET /api/expenses → 401 without token', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/expenses → 400 on missing fields', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/expenses → 201 on valid data', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'Food',
        amount: 250.75,
        userId: 1
      });
    expect(res.statusCode).toBe(201);
  });
});

