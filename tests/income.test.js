jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    Income: {
      create: jest.fn().mockImplementation((data) => {
        if (!data.amount || !data.source || !data.userId) {
          const err = { name: 'SequelizeValidationError', errors: [{ message: 'Missing fields' }] };
          throw err;
        }
        return { id: 1, ...data };
      }),
      findOne: jest.fn().mockResolvedValue({ id: 1, amount: 500, source: 'Salary', userId: 1 })
    }
  };
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

describe('Income endpoints', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ id: 1, email: 'test@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  test('GET /api/income → 401 without token', async () => {
    const res = await request(app).get('/api/income');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/income → 400 on missing fields', async () => {
    const res = await request(app)
      .post('/api/income')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/income → 201 on valid data', async () => {
    const res = await request(app)
      .post('/api/income')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 500,
        source: 'Salary',
        userId: 1
      });
    expect(res.statusCode).toBe(201);
  });
});

