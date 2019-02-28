import faker from 'faker';
import { random } from 'lodash';

export const firstTask = {
  id: 1,
  name: faker.hacker.noun(),
  description: faker.hacker.phrase(),
  statusId: random(1, 4),
  assigneeId: random(1, 4),
  creatorId: random(1, 4),
};

export const secondTask = {
  id: 2,
  name: faker.hacker.noun(),
  description: faker.hacker.phrase(),
  statusId: random(1, 4),
  assigneeId: random(1, 4),
  creatorId: random(1, 4),
};

export const thirdTask = {
  id: 3,
  name: faker.hacker.noun(),
  description: faker.hacker.phrase(),
  statusId: random(1, 4),
  assigneeId: random(1, 4),
  creatorId: random(1, 4),
};

export const taskArr = [firstTask, secondTask, thirdTask];

export const bigTaskArr = new Array(200).fill(null).map((el, index) => ({
  id: index + 1,
  name: faker.hacker.noun(),
  description: faker.hacker.phrase(),
  statusId: random(1, 4),
  assigneeId: random(1, 4),
  creatorId: random(1, 4),
}));
