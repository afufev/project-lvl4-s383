import faker from 'faker';

export const status = { name: faker.lorem.word() };

export const updatedStatus = { name: faker.lorem.word() };


// seeding staff

export const firstStatus = {
  id: 1,
  name: 'new',
};

const secondStatus = {
  id: 2,
  name: 'in progress',
};

const thirdStatus = {
  id: 3,
  name: 'testing',
};

const fourthStatus = {
  id: 4,
  name: 'closed',
};

export const statusArr = [firstStatus, secondStatus, thirdStatus, fourthStatus];
