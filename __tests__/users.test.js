import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { User, sequelize } from '../models';
import app from '..';

import {
  user, unknownUser, updatedUser, updatedPassword,
} from './__fixtures__/users';

import { getCookie } from './helpers';

beforeAll(() => {
  expect.extend(matchers);
});

describe('sessions', () => {
  let server;

  beforeEach(async () => {
    server = app().listen();
    await sequelize.sync({ force: true });
    await request.agent(server)
      .post('/users')
      .send({ form: user });
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
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: unknownUser });
    const returnPath = res.req.path;
    expect(returnPath).toBe('/session');
  });

  it('DELETE /session', async () => {
    const authRes = await request.agent(server)
      .post('/users')
      .send({ form: unknownUser });
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

describe('users', () => {
  let server;

  beforeEach(async () => {
    server = app().listen();
    await sequelize.sync({ force: true });
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

  it('GET /account/profile/edit', async () => {
    const cookie = await getCookie(server);

    const res = await request.agent(server)
      .get('/account/profile/edit')
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('PATCH /account/profile', async () => {
    const cookie = await getCookie(server);

    const res = await request.agent(server)
      .patch('/account/profile')
      .type('form')
      .send({ form: updatedUser })
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(302);
  });

  it('PATCH /account/settings/change_password', async () => {
    updatedPassword.confirmPassword = updatedPassword.newPassword;
    const cookie = await getCookie(server);

    const res = await request.agent(server)
      .patch('/account/settings/change_password')
      .type('form')
      .send({ form: updatedPassword })
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(302);
  });

  it('DELETE /account/settings/delete', async () => {
    const cookie = await getCookie(server);

    const res = await request.agent(server)
      .delete('/account/settings/delete')
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(302);

    const deletedUser = await User.findOne({
      where: { email: user.email },
    });
    expect(deletedUser).toBeNull();
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
