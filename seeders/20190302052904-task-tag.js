const random = require('lodash/random');

const tasksArr = new Array(80).fill(null).map((el, index) => ({
  id: index + 1,
  taskId: random(1, 207),
  tagId: random(1, 50),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TaskTags', tasksArr, {}),

  down: queryInterface => queryInterface.bulkDelete('TaskTags', null, {}),
};
