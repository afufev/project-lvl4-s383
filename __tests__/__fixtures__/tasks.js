import faker from 'faker';

export const firstTask = {
  id: 1,
  name: faker.hacker.noun(),
  description: faker.hacker.phrase(),
  statusId: 1,
  assigneeId: 1,
  creatorId: 2,
  tags: '#firstTag#secondTag',
};
export const secondTask = {
  id: 2,
  name: faker.hacker.noun(),
  description: faker.hacker.phrase(),
  statusId: 2,
  assigneeId: 2,
  creatorId: 1,
  tags: '#secondTag/firstTag',
};
export const thirdTask = {
  id: 3,
  name: faker.hacker.noun(),
  description: faker.hacker.phrase(),
  statusId: 3,
  assigneeId: 3,
  creatorId: 4,
  tags: ['firstTag', 'secondTag'],
};


export const taskArr = [firstTask, secondTask, thirdTask];
