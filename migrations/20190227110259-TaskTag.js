module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TaskTags', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    taskId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tagId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  }),

  down: queryInterface => queryInterface.dropTable('TaskTags'),
};
