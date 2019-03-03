import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { TaskStatus, sequelize } from '../models';
import app from '..';

import { seedUsers, getTaskCookie } from './helpers';
import { status, updatedStatus } from './__fixtures__/tasktatuses';

beforeAll(() => {
  expect.extend(matchers);
});

describe('taskStatuses', () => {
  let server;
  let cookie;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await seedUsers();
  });

  beforeEach(async () => {
    server = app().listen();
    cookie = await getTaskCookie(server);
  });

  it('GET /taskStatuses', async () => {
    const res = await request.agent(server)
      .get('/taskStatuses');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /taskStatuses/new', async () => {
    const res = await request.agent(server)
      .get('/taskStatuses/new')
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /taskStatuses', async () => {
    const res = await request.agent(server)
      .post('/taskStatuses')
      .set('Cookie', cookie)
      .send({ form: status });
    expect(res).toHaveHTTPStatus(302);
  });

  it('POST /taskStatuses with error', async () => {
    const res = await request.agent(server)
      .post('/taskStatuses')
      .set('Cookie', cookie)
      .send({ form: { name: '' } });
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /taskStatuses/:id/edit', async () => {
    const { id } = await TaskStatus.findOne({ where: { name: `${status.name}` } });
    const res = await request.agent(server)
      .get(`/taskStatuses/${id}/edit`)
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('PATCH /taskStatuses/:id', async () => {
    const { id } = await TaskStatus.findOne({ where: { name: `${status.name}` } });
    const res = await request.agent(server)
      .patch(`/taskStatuses/${id}`)
      .set('Cookie', cookie)
      .type('form')
      .send({ form: updatedStatus });
    expect(res).toHaveHTTPStatus(302);
  });

  it('PATCH /taskStatuses/:id with error', async () => {
    const { id } = await TaskStatus.findOne({ where: { name: `${updatedStatus.name}` } });
    const res = await request.agent(server)
      .patch(`/taskStatuses/${id}`)
      .set('Cookie', cookie)
      .type('form')
      .send({ form: { name: '' } });
    expect(res).toHaveHTTPStatus(200);
  });

  it('DELETE /taskStatuses/:id/delete', async () => {
    const { id } = await TaskStatus.findOne({ where: { name: `${updatedStatus.name}` } });
    const res = await request.agent(server)
      .delete(`/taskStatuses/${id}/delete`)
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(302);
    const deletedStatus = await TaskStatus.findByPk(id);
    expect(deletedStatus).toBeNull();
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
