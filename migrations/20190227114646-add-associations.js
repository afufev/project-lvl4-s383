module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Tasks',
    'statusId',
    {
      type: Sequelize.INTEGER,
      references: {
        model: 'TaskStatuses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  )
    .then(() => queryInterface.addColumn(
      'Tasks',
      'creatorId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    ))
    .then(() => queryInterface.addColumn(
      'Tasks',
      'assigneeId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    )),

  down: queryInterface => queryInterface.removeColumn(
    'Tasks',
    'statusId',
  )
    .then(() => queryInterface.removeColumn(
      'Tasks',
      'creatorId',
    ))
    .then(() => queryInterface.removeColumn(
      'Tasks',
      'assigneeId',
    )),
};
