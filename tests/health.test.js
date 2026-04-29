const request = require('supertest');
const app = require('../server');

describe('Health endpoint', () => {
  test('GET /health → 200 when DB connected', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET /health → 503 when DB unreachable (mock)', async () => {
    jest.spyOn(require('../src/models').sequelize, 'authenticate')
      .mockRejectedValueOnce(new Error('DB down'));
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('error');
  });
});
