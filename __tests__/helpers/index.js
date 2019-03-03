import request from 'supertest';
import {
  User, Task, TaskStatus, Tag,
} from '../../server/models';
import { user, usersArr } from '../__fixtures__/users';
import { statusArr } from '../__fixtures__/tasktatuses';
import { taskArr, bigTaskArr } from '../__fixtures__/tasks';
import { tagArr } from '../__fixtures__/tags';


export const getCookie = async (server) => {
  const authRes = await request.agent(server)
    .post('/users')
    .send({ form: user });
  return authRes.headers['set-cookie'];
};

export const getTaskCookie = async (server) => {
  const authRes = await request.agent(server)
    .post('/session')
    .send({ form: user });
  return authRes.headers['set-cookie'];
};
export const seedUsers = () => User.bulkCreate([...usersArr, user]);

export const seedStatuses = () => TaskStatus.bulkCreate(statusArr);

export const prepareTasks = async () => {
  await Task.bulkCreate(taskArr);
  await Tag.bulkCreate(tagArr);
  const firstTask = await Task.findByPk(1);
  const secondTask = await Task.findByPk(2);
  const thirdTask = await Task.findByPk(3);
  const firstTagId = 1;
  const secondTagId = 2;
  await firstTask.setTags([firstTagId, secondTagId]);
  await secondTask.setTags([firstTagId, secondTagId]);
  await thirdTask.setTags(secondTagId);
};

export const preparePaginationTasks = () => Task.bulkCreate(bigTaskArr);
