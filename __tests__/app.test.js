import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import db from '../models';
import app from '..';

beforeAll(async () => {
  await db.sequelize.sync({ force: false });
  jasmine.addMatchers(matchers);
});

const user = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

describe('basic routes', () => {
  let server;

  beforeEach(() => {
    server = app().listen();
  });

  it('GET /', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
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

describe('users', () => {
  let server;

  beforeEach(() => {
    server = app().listen();
  });

  it('GET /users/new', async () => {
    const res = await request.agent(server)
      .get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /users', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: user });
    expect(res).toHaveHTTPStatus(302);
  });

  it('POST /users (errors)', async () => {
    const res1 = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: null });
    const returnPath = res1.req.path;
    expect(returnPath).toBe('/users');

    const res2 = await request.agent(server).get(returnPath);
    expect(res2).toHaveHTTPStatus(200);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});


describe('sessions', () => {
  let server;

  beforeEach(() => {
    server = app().listen();
  });

  it('GET /session/new', async () => {
    const res = await request.agent(server)
      .get('/session/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /session', async () => {
    const res = await request.agent(server)
      .post('/session')
      .send({ form: user });
    expect(res).toHaveHTTPStatus(302);
  });

  it('POST /session (errors)', async () => {
    const unknownUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: unknownUser });
    const returnPath = res.req.path;
    expect(returnPath).toBe('/session');
  });

  it('DELETE /session', async () => {
    const authRes = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    expect(authRes).toHaveHTTPStatus(302);
    const cookie = authRes.headers['set-cookie'];

    const res = await request.agent(server)
      .delete('/session')
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
