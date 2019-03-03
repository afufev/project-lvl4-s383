const random = require('lodash/random');
const faker = require('faker');

const getTasksArr = users => new Array(207).fill(null).map((el, index) => ({
  id: index + 1,
  name: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  statusId: random(1, 4),
  assigneeId: users[random(users.length)].id,
  creatorId: users[random(users.length)].id,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

module.exports = {
  up: queryInterface => queryInterface.sequelize.query(
    'select id from "Users"', { type: queryInterface.sequelize.QueryTypes.SELECT },
  ).then(users => queryInterface.bulkInsert('Tasks', getTasksArr(users), {})),

  down: queryInterface => queryInterface.bulkDelete('Tasks', null, {}),
};
