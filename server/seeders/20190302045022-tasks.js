const random = require('lodash/random');
const faker = require('faker');

const tasksArr = new Array(207).fill(null).map((el, index) => ({
  id: index + 1,
  name: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  statusId: random(1, 4),
  assigneeId: random(1, 20),
  creatorId: random(1, 20),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Tasks', tasksArr, {}),

  down: queryInterface => queryInterface.bulkDelete('Tasks', null, {}),
};
