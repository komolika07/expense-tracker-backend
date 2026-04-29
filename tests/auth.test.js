jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    User: {
      create: jest.fn().mockImplementation((data) => {
        if (!data.email || !data.password) {
          const err = { name: 'SequelizeValidationError', errors: [{ message: 'Missing fields' }] };
          throw err;
        }
        return { id: 1, email: data.email, password: data.password };
      }),
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where.email === 'test@example.com') {
          return { id: 1, email: 'test@example.com', password: 'password123' };
        }
        return null;
      })
    },
    Income: {
      create: jest.fn().mockResolvedValue({ id: 1, userId: 1, amount: 0 })
    }
  };
});

const request = require('supertest');
const app = require('../server');

describe('Auth endpoints', () => {
  test('POST /api/auth/register → 400 on missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/register → 201 on valid data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(res.statusCode).toBe(201);
  });

  test('POST /api/auth/login → 400 on missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/login → 401 on wrong credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrong'
    });
    expect(res.statusCode).toBe(401);
  });
});

