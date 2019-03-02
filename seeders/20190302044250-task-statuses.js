const statusesArr = [
  {
    id: 1, name: 'new', createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 2, name: 'in progress', createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 3, name: 'testing', createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 4, name: 'finished', createdAt: new Date(), updatedAt: new Date(),
  },
];

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TaskStatuses', statusesArr, {}),

  down: queryInterface => queryInterface.bulkDelete('TaskStatuses', null, {}),
};
