import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { sequelize } from '../server/models';
import app from '../server';

beforeAll(() => {
  expect.extend(matchers);
});

describe('basic routes', () => {
  let server;

  beforeEach(async () => {
    server = app().listen();
    await sequelize.sync({ force: false });
  });

  it('GET /', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(302);
  });
  it('GET /users', async () => {
    const res = await request.agent(server)
      .get('/users');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
