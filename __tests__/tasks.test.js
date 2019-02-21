import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { Task, TaskStatus, sequelize } from '../models';
import app from '..';

import { seedUsers, seedStatuses, prepareTasks } from './helpers';
import { status, updatedStatus } from './__fixtures__/tasktatuses';
import { firstTask, secondTask } from './__fixtures__/tasks';

beforeAll(async () => {
  expect.extend(matchers);
});

describe('taskStatuses', () => {
  let server;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await seedUsers();
  });

  beforeEach(async () => {
    server = app().listen();
  });

  it('GET /taskStatuses', async () => {
    const res = await request.agent(server)
      .get('/taskStatuses');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /taskStatuses/new', async () => {
    const res = await request.agent(server)
      .get('/taskStatuses/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /taskStatuses', async () => {
    const res = await request.agent(server)
      .post('/taskStatuses')
      .send({ form: status });
    expect(res).toHaveHTTPStatus(302);
  });

  it('GET /taskStatuses/:id/settings', async () => {
    const { id } = await TaskStatus.findOne({ where: { name: `${status.name}` } });
    const res = await request.agent(server)
      .get(`/taskStatuses/${id}/settings`);
    expect(res).toHaveHTTPStatus(200);
  });

  it('PATCH /taskStatuses/:id', async () => {
    const { id } = await TaskStatus.findOne({ where: { name: `${status.name}` } });
    const res = await request.agent(server)
      .patch(`/taskStatuses/${id}`)
      .type('form')
      .send({ form: updatedStatus });
    expect(res).toHaveHTTPStatus(302);
  });

  it('DELETE /taskStatuses/:id/delete', async () => {
    const { id } = await TaskStatus.findOne({ where: { name: `${updatedStatus.name}` } });
    const res = await request.agent(server)
      .delete(`/taskStatuses/${id}/delete`);
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
  const updatedTask = { ...secondTask, id: firstTask.id };

  beforeEach(async () => {
    server = app().listen();
  });

  it('GET /tasks/new', async () => {
    const res = await request.agent(server)
      .get('/tasks/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /tasks', async () => {
    const res = await request.agent(server)
      .post('/tasks')
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
      .get(`/tasks/${firstTask.id}/settings`);
    expect(res).toHaveHTTPStatus(200);
  });

  it('PATCH /tasks/:id', async () => {
    const res = await request.agent(server)
      .patch(`/tasks/${updatedTask.id}`)
      .type('form')
      .send({ form: updatedTask });
    expect(res).toHaveHTTPStatus(302);
  });

  it('DELETE /tasks/:id/delete', async () => {
    const res = await request.agent(server)
      .delete(`/tasks/${updatedTask.id}/delete`);
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

  beforeEach(async () => {
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
