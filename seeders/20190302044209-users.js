const faker = require('faker');

const usersArr = new Array(20).fill(null).map(() => ({
  id: faker.random.uuid,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  passwordDigest: faker.internet.password(),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', usersArr, {}),

  down: queryInterface => queryInterface.bulkDelete('Users', null, {}),
};
