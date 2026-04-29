const request = require('supertest');
const app = require('../server');

describe('Swagger docs', () => {
  test('GET /api-docs → 200', async () => {
  const res = await request(app).get('/api-docs').redirects(1);
  expect(res.statusCode).toBe(200);
});
});

