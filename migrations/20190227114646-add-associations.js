module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Task',
    'statusId',
    {
      type: Sequelize.INTEGER,
      references: {
        model: 'TaskStatus',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  )
    .then(() => queryInterface.addColumn(
      'Task',
      'creatorId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    ))
    .then(() => queryInterface.addColumn(
      'Task',
      'assigneeId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    )),

  down: queryInterface => queryInterface.removeColumn(
    'Task',
    'statusId',
  )
    .then(() => queryInterface.removeColumn(
      'Task',
      'creatorId',
    ))
    .then(() => queryInterface.removeColumn(
      'Task',
      'assigneeId',
    )),
};
