const faker = require('faker');

const tagsArr = new Array(50).fill(null).map((el, index) => ({
  id: index + 1,
  name: faker.hacker.abbreviation(),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Tags', tagsArr, {}),

  down: queryInterface => queryInterface.bulkDelete('Tags', null, {}),
};
