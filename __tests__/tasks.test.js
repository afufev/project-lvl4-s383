import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { Task, TaskStatus, sequelize } from '../models';
import app from '..';

import {
  seedUsers, seedStatuses, prepareTasks, getTaskCookie,
} from './helpers';
import { status, updatedStatus } from './__fixtures__/tasktatuses';
import { firstTask, secondTask } from './__fixtures__/tasks';

beforeAll(async () => {
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

  it('GET /taskStatuses/:id/settings', async () => {
    const { id } = await TaskStatus.findOne({ where: { name: `${status.name}` } });
    const res = await request.agent(server)
      .get(`/taskStatuses/${id}/settings`)
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

describe('tasks', async () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await seedUsers();
    await seedStatuses();
  });

  let server;
  let cookie;
  const updatedTask = { ...secondTask, id: firstTask.id };

  beforeEach(async () => {
    server = app().listen();
    cookie = await getTaskCookie(server);
  });

  it('GET /tasks/new', async () => {
    const res = await request.agent(server)
      .get('/tasks/new')
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /tasks', async () => {
    const res = await request.agent(server)
      .post('/tasks')
      .set('Cookie', cookie)
      .send({ form: firstTask });
    expect(res).toHaveHTTPStatus(302);
  });

  it('GET /tasks/:id', async () => {
    const res = await request.agent(server)
      .get(`/tasks/${firstTask.id}`);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /tasks/:id/settings', async () => {
    const res = await request.agent(server)
      .get(`/tasks/${firstTask.id}/settings`)
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('PATCH /tasks/:id', async () => {
    const res = await request.agent(server)
      .patch(`/tasks/${updatedTask.id}`)
      .set('Cookie', cookie)
      .type('form')
      .send({ form: updatedTask });
    expect(res).toHaveHTTPStatus(302);
  });

  it('DELETE /tasks/:id/delete', async () => {
    const res = await request.agent(server)
      .delete(`/tasks/${updatedTask.id}/delete`)
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(302);
    const deletedTask = await Task.findByPk(updatedTask.id);
    expect(deletedTask).toBeNull();
  });

  afterEach(async (done) => {
    server.close();
    done();
  });
});

describe('filter tasks', async () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await seedUsers();
    await seedStatuses();
    await prepareTasks();
  });

  let server;

  beforeEach(() => {
    server = app().listen();
  });

  it('all tasks', async () => {
    const res = await request.agent(server)
      .get('/tasks');
    expect(res).toHaveHTTPStatus(200);
  });

  it('by status, creator and  assignee', async () => {
    const res = await request.agent(server)
      .get('/tasks')
      .query({ statusId: 1, assigneeId: 1, creatorId: 2 });
    expect(res).toHaveHTTPStatus(200);
  });

  it('by tags', async () => {
    const res = await request.agent(server)
      .get('/tasks')
      .query({ tagsQuery: '#firstTag#secondTag' });
    expect(res).toHaveHTTPStatus(200);
  });

  afterEach(async (done) => {
    server.close();
    done();
  });
});
